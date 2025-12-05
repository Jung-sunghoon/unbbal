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
      <RoundedBox args={[0.8, 0.6, 0.8]} radius={0.05} position={[0, 0.3, 0]}>
        <meshStandardMaterial color={boxColor} roughness={0.6} />
      </RoundedBox>

      {/* 뚜껑 */}
      <group ref={lidRef} position={[0, 0.6, -0.35]}>
        <RoundedBox args={[0.85, 0.15, 0.85]} radius={0.03} position={[0, 0.075, 0.35]}>
          <meshStandardMaterial color={boxColor} roughness={0.6} />
        </RoundedBox>
      </group>

      {/* 상자 안 내용물 */}
      {isOpened && (
        <group ref={bombRef} position={[0, 0.3, 0]}>
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
                  <pointLight color="#FF4400" intensity={3} distance={3} />
                  {/* 폭발 파티클 */}
                  {[...Array(8)].map((_, i) => (
                    <mesh
                      key={i}
                      position={[
                        Math.cos(i * Math.PI / 4) * 0.4,
                        Math.sin(Date.now() * 0.01 + i) * 0.2,
                        Math.sin(i * Math.PI / 4) * 0.4
                      ]}
                    >
                      <sphereGeometry args={[0.08, 8, 8]} />
                      <meshBasicMaterial color="#FF6600" />
                    </mesh>
                  ))}
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
        <mesh position={[0, 0.61, 0.001]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

export function Box3D({ boxes, selectedBox, phase, onSelectBox, onRevealComplete }: Box3DProps) {
  // 2x3 그리드 배치
  const positions: [number, number, number][] = [
    [-1, 0, -0.5],
    [0, 0, -0.5],
    [1, 0, -0.5],
    [-1, 0, 0.5],
    [0, 0, 0.5],
    [1, 0, 0.5],
  ];

  const canSelect = phase === "playing";
  const isRevealing = phase === "revealing";

  return (
    <div className="w-full h-64">
      <Canvas
        camera={{ position: [0, 3, 4], fov: 40 }}
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
