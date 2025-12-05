// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { WireState, WIRE_COLORS } from "@/lib/hooks/useWireBombGame";

interface WireBomb3DProps {
  wires: WireState[];
  phase: "ready" | "playing" | "cutting" | "safe" | "exploded";
  lastCutWire: number | null;
  onCutWire: (wireId: number) => void;
  onCutComplete: () => void;
}

interface WireProps {
  wire: WireState;
  index: number;
  canCut: boolean;
  isCutting: boolean;
  onCut: () => void;
}

// 단일 전선 컴포넌트
function Wire({ wire, index, canCut, isCutting, onCut }: WireProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [cutAnimation, setCutAnimation] = useState(0);

  // 전선 위치 계산 (폭탄 주변에 배치)
  const angle = (index / 7) * Math.PI * 0.8 - Math.PI * 0.4;
  const startX = -1.2;
  const endX = 1.2;
  const y = 0.3 + index * 0.12;
  const curve = Math.sin(angle) * 0.15;

  useFrame(() => {
    if (!groupRef.current) return;

    // 호버 효과
    if (hovered && canCut && !wire.isCut) {
      groupRef.current.position.y = y + Math.sin(Date.now() * 0.01) * 0.02;
    } else {
      groupRef.current.position.y = y;
    }

    // 자르기 애니메이션
    if (isCutting && wire.isCut && cutAnimation < 1) {
      setCutAnimation(prev => Math.min(prev + 0.05, 1));
    }
  });

  const wireColor = wire.isCut
    ? (wire.isCorrect ? "#00FF00" : "#FF0000")
    : wire.color;

  if (wire.isCut && cutAnimation > 0.5) {
    // 잘린 전선 - 두 조각으로 표시
    return (
      <group ref={groupRef} position={[0, y, 0]}>
        {/* 왼쪽 조각 */}
        <mesh position={[startX + 0.5, curve, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
          <meshStandardMaterial
            color={wireColor}
            roughness={0.4}
            emissive={wire.isCorrect ? "#00FF00" : "#FF0000"}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* 오른쪽 조각 (떨어지는 애니메이션) */}
        <mesh
          position={[endX - 0.5, curve - cutAnimation * 0.5, cutAnimation * 0.3]}
          rotation={[cutAnimation * 0.5, 0, Math.PI / 2 + cutAnimation * 0.3]}
        >
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
          <meshStandardMaterial
            color={wireColor}
            roughness={0.4}
            emissive={wire.isCorrect ? "#00FF00" : "#FF0000"}
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* 스파크 효과 */}
        {cutAnimation < 0.8 && (
          <>
            {[...Array(5)].map((_, i) => (
              <mesh
                key={i}
                position={[
                  0 + (Math.random() - 0.5) * 0.2,
                  curve + (Math.random() - 0.5) * 0.1,
                  (Math.random() - 0.5) * 0.1
                ]}
              >
                <sphereGeometry args={[0.02, 4, 4]} />
                <meshBasicMaterial color={wire.isCorrect ? "#FFFF00" : "#FF4400"} />
              </mesh>
            ))}
          </>
        )}
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[0, y, 0]}>
      <mesh
        position={[0, curve, 0]}
        rotation={[0, 0, Math.PI / 2]}
        onClick={(e) => {
          e.stopPropagation();
          if (canCut && !wire.isCut) onCut();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.035, 0.035, 2.4, 12]} />
        <meshStandardMaterial
          color={hovered && canCut ? "#FFFFFF" : wire.color}
          roughness={0.3}
          emissive={hovered && canCut ? wire.color : "#000000"}
          emissiveIntensity={hovered && canCut ? 0.5 : 0}
        />
      </mesh>
      {/* 전선 끝 커넥터 */}
      <mesh position={[startX, curve, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[endX, curve, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// 폭탄 본체
function BombBody({ isExploding }: { isExploding: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [shake, setShake] = useState(0);
  const [explodeProgress, setExplodeProgress] = useState(0);

  useFrame(() => {
    if (!groupRef.current) return;

    if (isExploding) {
      setShake(prev => prev + 0.1);
      setExplodeProgress(prev => Math.min(prev + 0.02, 1));

      // 흔들림
      if (explodeProgress < 0.5) {
        groupRef.current.rotation.z = Math.sin(shake * 20) * 0.1 * (1 - explodeProgress * 2);
        groupRef.current.rotation.x = Math.cos(shake * 15) * 0.05 * (1 - explodeProgress * 2);
      }
    }
  });

  if (explodeProgress > 0.5) {
    // 폭발 이펙트
    return (
      <group ref={groupRef}>
        {/* 폭발 중심 */}
        <mesh scale={1 + explodeProgress * 3}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshBasicMaterial
            color="#FF4400"
            transparent
            opacity={1 - explodeProgress}
          />
        </mesh>

        {/* 폭발 빛 */}
        <pointLight color="#FF4400" intensity={10 * (1 - explodeProgress)} distance={10} />
        <pointLight color="#FFAA00" intensity={5 * (1 - explodeProgress)} distance={5} />

        {/* 불꽃 파티클 */}
        {[...Array(30)].map((_, i) => {
          const angle = (i / 30) * Math.PI * 2;
          const speed = 0.5 + Math.random() * 1.5;
          const height = Math.random() * 2 - 1;
          return (
            <mesh
              key={`fire-${i}`}
              position={[
                Math.cos(angle) * explodeProgress * speed * 2,
                height * explodeProgress * 2,
                Math.sin(angle) * explodeProgress * speed * 2
              ]}
            >
              <sphereGeometry args={[0.08 + Math.random() * 0.08, 8, 8]} />
              <meshBasicMaterial
                color={i % 3 === 0 ? "#FF0000" : i % 3 === 1 ? "#FF6600" : "#FFAA00"}
                transparent
                opacity={1 - explodeProgress}
              />
            </mesh>
          );
        })}

        {/* 연기 */}
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const delay = i * 0.02;
          const progress = Math.max(0, explodeProgress - delay);
          return (
            <mesh
              key={`smoke-${i}`}
              position={[
                Math.cos(angle) * progress * 1.5,
                progress * 3 + Math.sin(i) * 0.5,
                Math.sin(angle) * progress * 1.5
              ]}
              scale={0.5 + progress * 2}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial
                color="#333333"
                transparent
                opacity={(1 - progress) * 0.6}
              />
            </mesh>
          );
        })}

        {/* 파편 */}
        {[...Array(15)].map((_, i) => {
          const angle = (i / 15) * Math.PI * 2;
          const speed = 1 + Math.random() * 2;
          const rotSpeed = Math.random() * 10;
          return (
            <mesh
              key={`debris-${i}`}
              position={[
                Math.cos(angle) * explodeProgress * speed,
                explodeProgress * 2 - explodeProgress * explodeProgress * 3,
                Math.sin(angle) * explodeProgress * speed
              ]}
              rotation={[
                explodeProgress * rotSpeed,
                explodeProgress * rotSpeed * 0.7,
                explodeProgress * rotSpeed * 1.3
              ]}
            >
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color="#222222" />
            </mesh>
          );
        })}
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      {/* 폭탄 본체 - 원통형 */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 1.5, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 폭탄 양끝 반구 */}
      <mesh position={[-0.75, 0, 0]}>
        <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0.75, 0, 0]} rotation={[0, 0, Math.PI]}>
        <sphereGeometry args={[0.4, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 위험 표시 띠 */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.2, 32]} />
        <meshStandardMaterial color="#FFD700" roughness={0.5} />
      </mesh>
      <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.1, 32]} />
        <meshStandardMaterial color="#FF0000" roughness={0.5} />
      </mesh>
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.42, 0.1, 32]} />
        <meshStandardMaterial color="#FF0000" roughness={0.5} />
      </mesh>

      {/* 타이머 디스플레이 */}
      <mesh position={[0, 0.35, 0.2]}>
        <boxGeometry args={[0.5, 0.2, 0.1]} />
        <meshStandardMaterial color="#000000" roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.35, 0.26]}>
        <boxGeometry args={[0.45, 0.15, 0.01]} />
        <meshBasicMaterial color={isExploding ? "#FF0000" : "#00FF00"} />
      </mesh>

      {/* 전선 연결부 (좌우) */}
      <mesh position={[-1.2, 0.5, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.3]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[1.2, 0.5, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.3]} />
        <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  );
}

// 성공 이펙트
function SuccessEffect() {
  const [progress, setProgress] = useState(0);

  useFrame(() => {
    setProgress(prev => Math.min(prev + 0.02, 1));
  });

  return (
    <group>
      {/* 초록 빛 */}
      <pointLight color="#00FF00" intensity={5 * (1 - progress * 0.5)} distance={5} />

      {/* 반짝이는 파티클 */}
      {[...Array(20)].map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle + progress * 2) * (1 + progress),
              Math.sin(progress * Math.PI) * 2,
              Math.sin(angle + progress * 2) * (1 + progress)
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#00FF00" transparent opacity={1 - progress} />
          </mesh>
        );
      })}
    </group>
  );
}

export function WireBomb3D({ wires, phase, lastCutWire, onCutWire, onCutComplete }: WireBomb3DProps) {
  const canCut = phase === "playing";
  const isCutting = phase === "cutting";
  const isExploding = phase === "exploded";
  const isSafe = phase === "safe";
  const cutCompleteRef = useRef(false);

  // cutting 애니메이션 후 완료 콜백
  useEffect(() => {
    if (isCutting && !cutCompleteRef.current) {
      cutCompleteRef.current = true;
      const timer = setTimeout(() => {
        onCutComplete();
        cutCompleteRef.current = false;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isCutting, onCutComplete]);

  return (
    <div className="w-full h-72 sm:h-80">
      <Canvas camera={{ position: [0, 2, 4], fov: 45 }} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-3, 3, -3]} intensity={0.5} color="#fff5e6" />

        {/* 폭탄 본체 */}
        <BombBody isExploding={isExploding} />

        {/* 전선들 */}
        {!isExploding && wires.map((wire, index) => (
          <Wire
            key={wire.id}
            wire={wire}
            index={index}
            canCut={canCut}
            isCutting={isCutting && lastCutWire === wire.id}
            onCut={() => onCutWire(wire.id)}
          />
        ))}

        {/* 성공 이펙트 */}
        {isSafe && <SuccessEffect />}

        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />

        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
