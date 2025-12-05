// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface Box3DProps {
  boxes: Array<{ id: number; isOpened: boolean; hasBomb: boolean }>;
  selectedBox: number | null;
  phase: "ready" | "playing" | "revealing" | "safe" | "exploded";
  onSelectBox: (id: number) => void;
  onRevealComplete: () => void;
}

interface SingleBoxProps {
  id: number;
  position: [number, number, number];
  isOpened: boolean;
  hasBomb: boolean;
  isSelected: boolean;
  isRevealing: boolean;
  canSelect: boolean;
  onSelect: () => void;
  onRevealComplete: () => void;
}

function SingleBox({
  id,
  position,
  isOpened,
  hasBomb,
  isSelected,
  isRevealing,
  canSelect,
  onSelect,
  onRevealComplete,
}: SingleBoxProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lidRef = useRef<THREE.Group>(null);
  const bombRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [lidAngle, setLidAngle] = useState(0);
  const [explosionPhase, setExplosionPhase] = useState<"none" | "shake" | "explode">("none");
  const [explosionScale, setExplosionScale] = useState(1);
  const revealStartRef = useRef<number | null>(null);
  const explosionStartRef = useRef<number | null>(null);

  // 호버 애니메이션
  useFrame(() => {
    if (!groupRef.current) return;

    const targetY = hovered && canSelect && !isOpened ? 0.1 : 0;
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      0.1
    );

    // 폭발 시 흔들림 효과
    if (explosionPhase === "shake" && hasBomb && isSelected) {
      const shakeIntensity = 0.05;
      groupRef.current.rotation.z = (Math.random() - 0.5) * shakeIntensity * 2;
      groupRef.current.rotation.x = (Math.random() - 0.5) * shakeIntensity;
    } else if (explosionPhase !== "shake") {
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
    }
  });

  // 뚜껑 열림 애니메이션
  useEffect(() => {
    if (isRevealing && isSelected) {
      revealStartRef.current = Date.now();
      if (hasBomb) {
        // 폭탄이면 흔들림 시작
        setTimeout(() => setExplosionPhase("shake"), 500);
        setTimeout(() => {
          setExplosionPhase("explode");
          explosionStartRef.current = Date.now();
        }, 1000);
      }
    }
  }, [isRevealing, isSelected, hasBomb]);

  useFrame(() => {
    if (!lidRef.current) return;

    if (isRevealing && isSelected && revealStartRef.current) {
      const elapsed = Date.now() - revealStartRef.current;
      const progress = Math.min(elapsed / 500, 1);
      const targetAngle = -Math.PI * 0.7;

      setLidAngle(targetAngle * progress);
      lidRef.current.rotation.x = lidAngle;

      // 폭탄이 아닌 경우만 빨리 완료
      if (!hasBomb && progress >= 1 && elapsed > 800) {
        revealStartRef.current = null;
        onRevealComplete();
      }
    } else if (isOpened && !isRevealing) {
      lidRef.current.rotation.x = -Math.PI * 0.7;
    } else {
      lidRef.current.rotation.x = 0;
    }

    // 폭발 애니메이션
    if (explosionPhase === "explode" && explosionStartRef.current) {
      const elapsed = Date.now() - explosionStartRef.current;
      const progress = Math.min(elapsed / 500, 1);

      // 폭탄이 커졌다가 작아지는 효과
      if (progress < 0.3) {
        setExplosionScale(1 + progress * 5);
      } else if (progress < 0.6) {
        setExplosionScale(2.5 - (progress - 0.3) * 3);
      } else {
        setExplosionScale(1.6 + Math.sin(progress * Math.PI * 4) * 0.2);
      }

      if (elapsed > 800) {
        explosionStartRef.current = null;
        revealStartRef.current = null;
        onRevealComplete();
      }
    }
  });

  const boxColor = isOpened
    ? (hasBomb ? "#FF4444" : "#44FF44")
    : (hovered && canSelect ? "#FFD700" : "#8B4513");

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (canSelect && !isOpened) onSelect();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* 상자 본체 */}
      <RoundedBox args={[0.65, 0.5, 0.65]} radius={0.05} position={[0, 0.25, 0]}>
        <meshStandardMaterial color={boxColor} roughness={0.6} />
      </RoundedBox>

      {/* 뚜껑 */}
      <group ref={lidRef} position={[0, 0.5, -0.28]}>
        <RoundedBox args={[0.7, 0.12, 0.7]} radius={0.03} position={[0, 0.06, 0.28]}>
          <meshStandardMaterial color={boxColor} roughness={0.6} />
        </RoundedBox>
      </group>

      {/* 상자 안 내용물 */}
      {isOpened && (
        <group ref={bombRef} position={[0, 0.25, 0]}>
          {hasBomb ? (
            // 폭탄 + 폭발 효과
            <group scale={explosionScale}>
              {/* 폭탄 본체 */}
              <mesh>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial
                  color={explosionPhase === "explode" ? "#FF6600" : "#222222"}
                  roughness={0.3}
                  emissive={explosionPhase === "explode" ? "#FF4400" : "#000000"}
                  emissiveIntensity={explosionPhase === "explode" ? 2 : 0}
                />
              </mesh>
              {/* 폭발 시 빛 효과 */}
              {explosionPhase === "explode" && (
                <>
                  <pointLight color="#FF4400" intensity={5} distance={5} />
                  <pointLight color="#FFAA00" intensity={3} distance={3} position={[0, 0.5, 0]} />

                  {/* 폭발 불꽃 파티클 */}
                  {[...Array(16)].map((_, i) => {
                    const angle = (i / 16) * Math.PI * 2;
                    const radius = 0.3 + Math.sin(Date.now() * 0.02 + i) * 0.3;
                    const yOffset = Math.sin(Date.now() * 0.015 + i * 0.5) * 0.4;
                    return (
                      <mesh
                        key={`fire-${i}`}
                        position={[
                          Math.cos(angle) * radius,
                          0.2 + yOffset,
                          Math.sin(angle) * radius
                        ]}
                      >
                        <sphereGeometry args={[0.06 + Math.random() * 0.04, 8, 8]} />
                        <meshBasicMaterial color={i % 2 === 0 ? "#FF4400" : "#FFAA00"} />
                      </mesh>
                    );
                  })}

                  {/* 연기 파티클 */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i / 12) * Math.PI * 2;
                    const time = Date.now() * 0.001;
                    const yOffset = (time * 2 + i * 0.3) % 2;
                    const radius = 0.2 + yOffset * 0.3;
                    const opacity = Math.max(0, 1 - yOffset * 0.5);
                    return (
                      <mesh
                        key={`smoke-${i}`}
                        position={[
                          Math.cos(angle + time) * radius,
                          0.3 + yOffset * 0.8,
                          Math.sin(angle + time) * radius
                        ]}
                      >
                        <sphereGeometry args={[0.08 + yOffset * 0.1, 8, 8]} />
                        <meshBasicMaterial
                          color="#444444"
                          transparent
                          opacity={opacity * 0.7}
                        />
                      </mesh>
                    );
                  })}

                  {/* 폭발 파편 */}
                  {[...Array(10)].map((_, i) => {
                    const angle = (i / 10) * Math.PI * 2;
                    const speed = 0.5 + Math.random() * 0.5;
                    const time = (Date.now() * 0.003) % 1;
                    return (
                      <mesh
                        key={`debris-${i}`}
                        position={[
                          Math.cos(angle) * time * speed,
                          0.2 + time * 0.5 - time * time * 0.8,
                          Math.sin(angle) * time * speed
                        ]}
                        rotation={[time * 5, time * 3, time * 4]}
                      >
                        <boxGeometry args={[0.04, 0.04, 0.04]} />
                        <meshBasicMaterial color="#331100" />
                      </mesh>
                    );
                  })}
                </>
              )}
              {/* 흔들림 시 경고 빛 */}
              {explosionPhase === "shake" && (
                <pointLight color="#FF0000" intensity={2} distance={2} />
              )}
            </group>
          ) : (
            // 빈 상자 (체크마크)
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[0.15, 0.03, 16, 32]} />
              <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.3} />
            </mesh>
          )}
        </group>
      )}

      {/* 번호 표시 */}
      {!isOpened && (
        <mesh position={[0, 0.51, 0.001]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.25, 0.25]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

export function Box3D({ boxes, selectedBox, phase, onSelectBox, onRevealComplete }: Box3DProps) {
  // 2x3 그리드 배치 (모바일에서도 보이도록 간격 조정)
  const positions: [number, number, number][] = [
    [-0.9, 0, -0.45],
    [0, 0, -0.45],
    [0.9, 0, -0.45],
    [-0.9, 0, 0.45],
    [0, 0, 0.45],
    [0.9, 0, 0.45],
  ];

  const canSelect = phase === "playing";
  const isRevealing = phase === "revealing";

  return (
    <div className="w-full h-56 sm:h-64">
      <Canvas
        camera={{ position: [0, 3.5, 4.5], fov: 35 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
        />
        <pointLight position={[-5, 5, -5]} intensity={0.3} color="#fff5e6" />

        {boxes.map((box, i) => (
          <SingleBox
            key={box.id}
            id={box.id}
            position={positions[i]}
            isOpened={box.isOpened}
            hasBomb={box.hasBomb}
            isSelected={selectedBox === box.id}
            isRevealing={isRevealing && selectedBox === box.id}
            canSelect={canSelect}
            onSelect={() => onSelectBox(box.id)}
            onRevealComplete={onRevealComplete}
          />
        ))}

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.4}
          scale={8}
          blur={2}
          far={4}
        />

        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
