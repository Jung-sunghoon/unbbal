// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import type { EnhanceResult } from "@/lib/hooks/useEnhanceGame";

interface Item3DProps {
  level: number;
  phase: "ready" | "playing" | "enhancing" | "result" | "destroyed";
  lastResult: EnhanceResult | null;
}

interface SwordProps {
  level: number;
  isEnhancing: boolean;
  lastResult: EnhanceResult | null;
  isDestroyed: boolean;
}

function Sword({ level, isEnhancing, lastResult, isDestroyed }: SwordProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const shakeRef = useRef(0);
  const particlesRef = useRef<THREE.Points>(null);

  // 레벨에 따른 색상
  const color = useMemo(() => {
    if (isDestroyed) return "#444444";
    if (level >= 15) return "#FFD700"; // Gold
    if (level >= 12) return "#FF6B35"; // Orange
    if (level >= 10) return "#A855F7"; // Purple
    if (level >= 7) return "#3B82F6"; // Blue
    if (level >= 4) return "#22C55E"; // Green
    return "#9CA3AF"; // Gray
  }, [level, isDestroyed]);

  // 파티클 위치
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = Math.random() * 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    // 기본 회전
    if (!isDestroyed) {
      groupRef.current.rotation.y += 0.01;
    }

    // 강화 중 흔들림
    if (isEnhancing) {
      shakeRef.current += 0.5;
      groupRef.current.position.x = Math.sin(shakeRef.current) * 0.1;
      groupRef.current.position.z = Math.cos(shakeRef.current * 1.3) * 0.05;
    } else {
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        0,
        0.1
      );
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        0,
        0.1
      );
    }

    // 결과에 따른 반응
    if (lastResult === "success" && !isEnhancing) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.05;
      groupRef.current.scale.setScalar(scale);
    } else if (lastResult === "fail" && !isEnhancing) {
      const shake = Math.sin(state.clock.elapsedTime * 20) * 0.02;
      groupRef.current.position.x = shake;
    }

    // 파괴 시 떨어짐
    if (isDestroyed && groupRef.current.rotation.x > -Math.PI / 2) {
      groupRef.current.rotation.x -= 0.1;
      groupRef.current.position.y -= 0.05;
    }

    // 발광 효과
    if (glowRef.current) {
      const intensity = level >= 7 ? 2 + Math.sin(state.clock.elapsedTime * 3) : 0.5;
      glowRef.current.intensity = intensity;
    }

    // 파티클 애니메이션
    if (particlesRef.current && level >= 10 && !isDestroyed) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 50; i++) {
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 1] > 3) {
          positions[i * 3 + 1] = 0;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* 검 손잡이 */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.5, 8]} />
        <meshStandardMaterial color="#4A3728" roughness={0.6} />
      </mesh>

      {/* 가드 */}
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.1, 0.6, 0.1]} />
        <meshStandardMaterial color="#8B7355" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 검날 */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.15, 1.8, 0.05]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={level >= 7 ? color : "#000000"}
          emissiveIntensity={level >= 7 ? 0.3 : 0}
        />
      </mesh>

      {/* 검 끝 */}
      <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.12, 0.3, 4]} />
        <meshStandardMaterial
          color={color}
          metalness={0.9}
          roughness={0.1}
          emissive={level >= 7 ? color : "#000000"}
          emissiveIntensity={level >= 7 ? 0.3 : 0}
        />
      </mesh>

      {/* 발광 */}
      {level >= 4 && !isDestroyed && (
        <pointLight ref={glowRef} color={color} intensity={1} distance={3} />
      )}

      {/* 파티클 (고강) */}
      {level >= 10 && !isDestroyed && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particlePositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            color={color}
            transparent
            opacity={0.6}
            sizeAttenuation
          />
        </points>
      )}

      {/* 파괴 이펙트 */}
      {isDestroyed && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshBasicMaterial color="#FF0000" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

export function Item3D({ level, phase, lastResult }: Item3DProps) {
  const isEnhancing = phase === "enhancing";
  const isDestroyed = phase === "destroyed";

  return (
    <div className="w-full h-64">
      <Canvas camera={{ position: [0, 1, 4], fov: 40 }} shadows>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <pointLight position={[-3, 3, -3]} intensity={0.5} color="#fff5e6" />

        <Sword
          level={level}
          isEnhancing={isEnhancing}
          lastResult={lastResult}
          isDestroyed={isDestroyed}
        />

        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.4}
          scale={5}
          blur={2}
          far={4}
        />

        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
