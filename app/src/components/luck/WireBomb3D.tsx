// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { WireState } from "@/lib/hooks/useWireBombGame";

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

// 단일 전선 컴포넌트 - 폭탄에서 연결되어 나옴
function Wire({ wire, index, canCut, isCutting, onCut }: WireProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [cutAnimation, setCutAnimation] = useState(0);

  // 전선 시작점 (폭탄 상단에서 시작)
  const startY = 0.6;
  const startX = -0.25 + (index % 4) * 0.17;
  const startZ = index < 4 ? -0.15 : 0.15;

  // 전선 끝점 (바깥으로 펼쳐짐)
  const endX = -1.5 + index * 0.43;
  const endY = 1.2;
  const endZ = 0;

  useFrame(() => {
    if (!groupRef.current) return;

    // 자르기 애니메이션
    if (isCutting && wire.isCut && cutAnimation < 1) {
      setCutAnimation(prev => Math.min(prev + 0.05, 1));
    }
  });

  const wireColor = wire.isCut
    ? (wire.isCorrect ? "#00AA00" : "#FF0000")
    : wire.color;

  // 전선 중간점 계산
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2 + 0.3;
  const midZ = (startZ + endZ) / 2;

  if (wire.isCut) {
    // 잘린 전선
    return (
      <group ref={groupRef}>
        {/* 폭탄에 연결된 부분 */}
        <mesh position={[(startX + midX) / 2, (startY + midY) / 2, (startZ + midZ) / 2]}>
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(startX, startY, startZ),
              new THREE.Vector3(midX, midY, midZ),
            ]),
            20, 0.025, 8, false
          ]} />
          <meshStandardMaterial
            color={wireColor}
            roughness={0.4}
            emissive={wire.isCorrect ? "#00FF00" : "#FF0000"}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* 잘린 끝부분 (떨어짐) */}
        <mesh
          position={[
            (midX + endX) / 2,
            (midY + endY) / 2 - cutAnimation * 1.5,
            (midZ + endZ) / 2 + cutAnimation * 0.3
          ]}
          rotation={[cutAnimation * 0.5, 0, cutAnimation * 0.3]}
        >
          <tubeGeometry args={[
            new THREE.CatmullRomCurve3([
              new THREE.Vector3(0, 0.3, 0),
              new THREE.Vector3(endX - midX, endY - midY, endZ - midZ),
            ]),
            20, 0.025, 8, false
          ]} />
          <meshStandardMaterial
            color={wireColor}
            roughness={0.4}
            emissive={wire.isCorrect ? "#00FF00" : "#FF0000"}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* 스파크 */}
        {cutAnimation < 0.7 && [...Array(6)].map((_, i) => (
          <mesh
            key={i}
            position={[
              midX + (Math.random() - 0.5) * 0.15,
              midY + (Math.random() - 0.5) * 0.15,
              midZ + (Math.random() - 0.5) * 0.15
            ]}
          >
            <sphereGeometry args={[0.015 + Math.random() * 0.01, 6, 6]} />
            <meshBasicMaterial color={wire.isCorrect ? "#FFFF00" : "#FF4400"} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      {/* 메인 전선 - 곡선 */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          if (canCut && !wire.isCut) onCut();
        }}
        onPointerOver={(e) => {
          if (canCut) {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(startX, startY, startZ),
            new THREE.Vector3(midX, midY, midZ),
            new THREE.Vector3(endX, endY, endZ),
          ]),
          32, hovered && canCut ? 0.035 : 0.025, 8, false
        ]} />
        <meshStandardMaterial
          color={hovered && canCut ? "#FFFFFF" : wire.color}
          roughness={0.3}
          emissive={hovered && canCut ? wire.color : "#000000"}
          emissiveIntensity={hovered && canCut ? 0.8 : 0}
        />
      </mesh>

      {/* 전선 끝 클립 */}
      <mesh position={[endX, endY, endZ]}>
        <boxGeometry args={[0.08, 0.05, 0.05]} />
        <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// 폭탄 본체 - 클래식 둥근 폭탄
function BombBody({ isExploding }: { isExploding: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [shake, setShake] = useState(0);
  const [explodeProgress, setExplodeProgress] = useState(0);

  useFrame(() => {
    if (!groupRef.current) return;

    if (isExploding) {
      setShake(prev => prev + 0.1);
      setExplodeProgress(prev => Math.min(prev + 0.015, 1));

      if (explodeProgress < 0.4) {
        groupRef.current.rotation.z = Math.sin(shake * 30) * 0.15 * (1 - explodeProgress * 2.5);
        groupRef.current.rotation.x = Math.cos(shake * 25) * 0.08 * (1 - explodeProgress * 2.5);
      }
    }
  });

  if (explodeProgress > 0.4) {
    return (
      <group ref={groupRef}>
        {/* 폭발 코어 */}
        <mesh scale={1 + explodeProgress * 4}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshBasicMaterial color="#FF2200" transparent opacity={Math.max(0, 1 - explodeProgress * 1.2)} />
        </mesh>

        {/* 강렬한 빛 */}
        <pointLight color="#FF4400" intensity={20 * (1 - explodeProgress)} distance={15} />
        <pointLight color="#FFAA00" intensity={10 * (1 - explodeProgress)} distance={8} />

        {/* 불꽃 */}
        {[...Array(40)].map((_, i) => {
          const angle = (i / 40) * Math.PI * 2;
          const vertAngle = ((i % 10) / 10) * Math.PI - Math.PI / 2;
          const speed = 1 + Math.random() * 2;
          return (
            <mesh
              key={`fire-${i}`}
              position={[
                Math.cos(angle) * Math.cos(vertAngle) * explodeProgress * speed * 2,
                Math.sin(vertAngle) * explodeProgress * speed * 2,
                Math.sin(angle) * Math.cos(vertAngle) * explodeProgress * speed * 2
              ]}
            >
              <sphereGeometry args={[0.06 + Math.random() * 0.06, 8, 8]} />
              <meshBasicMaterial
                color={i % 3 === 0 ? "#FF0000" : i % 3 === 1 ? "#FF6600" : "#FFCC00"}
                transparent
                opacity={Math.max(0, 1 - explodeProgress * 1.1)}
              />
            </mesh>
          );
        })}

        {/* 연기 */}
        {[...Array(25)].map((_, i) => {
          const angle = (i / 25) * Math.PI * 2;
          const delay = i * 0.015;
          const progress = Math.max(0, explodeProgress - delay - 0.2);
          return (
            <mesh
              key={`smoke-${i}`}
              position={[
                Math.cos(angle) * progress * 2,
                progress * 4,
                Math.sin(angle) * progress * 2
              ]}
              scale={0.3 + progress * 3}
            >
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color="#222222" transparent opacity={Math.max(0, (1 - progress * 1.5) * 0.7)} />
            </mesh>
          );
        })}

        {/* 파편 */}
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const speed = 1.5 + Math.random() * 2.5;
          const rotSpeed = 5 + Math.random() * 10;
          return (
            <mesh
              key={`debris-${i}`}
              position={[
                Math.cos(angle) * explodeProgress * speed,
                explodeProgress * 3 - explodeProgress * explodeProgress * 4,
                Math.sin(angle) * explodeProgress * speed
              ]}
              rotation={[
                explodeProgress * rotSpeed,
                explodeProgress * rotSpeed * 0.7,
                explodeProgress * rotSpeed * 1.2
              ]}
            >
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          );
        })}
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      {/* 메인 폭탄 - 둥근 형태 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* 상단 원통 (전선 연결부) */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.25, 32]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* 전선 연결 커버 */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 32]} />
        <meshStandardMaterial color="#444444" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 위험 띠 */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.03, 8, 32]} />
        <meshStandardMaterial color="#FFD700" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.025, 8, 32]} />
        <meshStandardMaterial color="#FF0000" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.48, 0.025, 8, 32]} />
        <meshStandardMaterial color="#FF0000" roughness={0.5} />
      </mesh>

      {/* 타이머 디스플레이 */}
      <mesh position={[0, 0, 0.48]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.25, 0.15, 0.08]} />
        <meshStandardMaterial color="#111111" roughness={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.53]}>
        <boxGeometry args={[0.2, 0.1, 0.01]} />
        <meshBasicMaterial color={isExploding ? "#FF0000" : "#00FF00"} />
      </mesh>

      {/* 볼트 디테일 */}
      {[0, 1, 2, 3].map((i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
        return (
          <mesh
            key={`bolt-${i}`}
            position={[Math.cos(angle) * 0.25, 0.6, Math.sin(angle) * 0.25]}
          >
            <cylinderGeometry args={[0.025, 0.025, 0.05, 6]} />
            <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.1} />
          </mesh>
        );
      })}
    </group>
  );
}

// 성공 이펙트
function SuccessEffect() {
  const [progress, setProgress] = useState(0);

  useFrame(() => {
    setProgress(prev => Math.min(prev + 0.015, 1));
  });

  return (
    <group>
      <pointLight color="#00FF00" intensity={8 * (1 - progress * 0.5)} distance={8} />

      {[...Array(30)].map((_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const speed = 0.5 + Math.random() * 0.5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle + progress * 3) * (0.5 + progress * speed * 2),
              Math.sin(progress * Math.PI) * 2 + Math.sin(i) * 0.3,
              Math.sin(angle + progress * 3) * (0.5 + progress * speed * 2)
            ]}
          >
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#00FF00" : "#88FF88"} transparent opacity={Math.max(0, 1 - progress)} />
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

  // 컴포넌트 언마운트 시 커서 복원
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <div className="w-full h-72 sm:h-80">
      <Canvas camera={{ position: [0, 1.5, 3.5], fov: 50 }} shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <pointLight position={[-3, 3, -3]} intensity={0.4} color="#fff5e6" />
        <pointLight position={[3, 2, 3]} intensity={0.3} color="#e6f0ff" />

        <BombBody isExploding={isExploding} />

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

        {isSafe && <SuccessEffect />}

        <ContactShadows
          position={[0, -0.6, 0]}
          opacity={0.5}
          scale={8}
          blur={2.5}
          far={4}
        />

        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
