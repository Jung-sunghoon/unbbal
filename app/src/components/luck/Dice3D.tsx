// © 2025 운빨(unbbal). All rights reserved.

"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  onRollComplete?: () => void;
}

// 각 면의 점 위치 (로컬 좌표)
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.25, -0.25], [0.25, 0.25]],
  3: [[-0.25, -0.25], [0, 0], [0.25, 0.25]],
  4: [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]],
  5: [[-0.25, -0.25], [0.25, -0.25], [0, 0], [-0.25, 0.25], [0.25, 0.25]],
  6: [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0], [0.25, 0], [-0.25, 0.25], [0.25, 0.25]],
};

// 각 숫자가 보이는 면의 회전값
const FACE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  2: [0, -Math.PI / 2, 0],
  3: [Math.PI / 2, 0, 0],
  4: [-Math.PI / 2, 0, 0],
  5: [0, Math.PI / 2, 0],
  6: [Math.PI, 0, 0],
};

// 점 컴포넌트
function Dot({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <circleGeometry args={[0.09, 32]} />
      <meshStandardMaterial color="#1a1a1a" />
    </mesh>
  );
}

// 주사위 면의 점들
function DiceFace({
  value,
  position,
  rotation
}: {
  value: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const dots = DOT_POSITIONS[value] || [];

  return (
    <group position={position} rotation={rotation}>
      {dots.map((pos, i) => (
        <Dot key={i} position={[pos[0], pos[1], 0.001]} />
      ))}
    </group>
  );
}

// 카메라 컨트롤러
function CameraController({ isRolling, isSettled }: { isRolling: boolean; isSettled: boolean }) {
  const { camera } = useThree();
  const targetZ = useRef(5);

  useFrame(() => {
    // 결과 나올 때 살짝 줌인
    if (isSettled) {
      targetZ.current = 4;
    } else if (isRolling) {
      targetZ.current = 5.5;
    } else {
      targetZ.current = 5;
    }

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ.current, 0.05);
  });

  return null;
}

// 주사위 메시
function DiceMesh({
  value,
  isRolling,
  onRollComplete,
  onPhaseChange
}: {
  value: number;
  isRolling: boolean;
  onRollComplete?: () => void;
  onPhaseChange?: (phase: "idle" | "rolling" | "settling") => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const [targetRotation, setTargetRotation] = useState<[number, number, number]>([0, 0, 0]);
  const velocityRef = useRef({ x: 0, y: 0, z: 0 });
  const positionRef = useRef({ y: 0, vy: 0, x: 0, vx: 0 });
  const phaseRef = useRef<"idle" | "rolling" | "settling">("idle");
  const settleStartRef = useRef(0);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (isRolling) {
      // 던지기 시작 - 더 역동적으로
      phaseRef.current = "rolling";
      onPhaseChange?.("rolling");

      // 랜덤 초기 회전 속도 (더 빠르게)
      velocityRef.current = {
        x: (Math.random() - 0.5) * 0.5 + 0.3,
        y: (Math.random() - 0.5) * 0.5 + 0.3,
        z: (Math.random() - 0.5) * 0.3,
      };

      // 위로 튀어오르면서 옆으로도 살짝
      positionRef.current = {
        y: 0,
        vy: 0.2,
        x: 0,
        vx: (Math.random() - 0.5) * 0.05
      };

      // 1초 후 착지 시작
      setTimeout(() => {
        if (phaseRef.current === "rolling") {
          phaseRef.current = "settling";
          onPhaseChange?.("settling");
          settleStartRef.current = Date.now();
          setTargetRotation(FACE_ROTATIONS[value] || [0, 0, 0]);

          // 현재 회전값 저장
          if (meshRef.current) {
            rotationRef.current = {
              x: meshRef.current.rotation.x,
              y: meshRef.current.rotation.y,
              z: meshRef.current.rotation.z,
            };
          }
        }
      }, 1000);
    }
  }, [isRolling, value, onPhaseChange]);

  useFrame(() => {
    if (!meshRef.current) return;

    if (phaseRef.current === "rolling") {
      // 회전
      meshRef.current.rotation.x += velocityRef.current.x;
      meshRef.current.rotation.y += velocityRef.current.y;
      meshRef.current.rotation.z += velocityRef.current.z;

      // 중력
      positionRef.current.vy -= 0.012;
      positionRef.current.y += positionRef.current.vy;
      positionRef.current.x += positionRef.current.vx;

      // 바운스 (바닥)
      if (positionRef.current.y < 0) {
        positionRef.current.y = 0;
        positionRef.current.vy = Math.abs(positionRef.current.vy) * 0.4;

        // 바운스할 때 회전 속도도 감소
        velocityRef.current.x *= 0.7;
        velocityRef.current.y *= 0.7;
        velocityRef.current.z *= 0.7;
      }

      meshRef.current.position.y = positionRef.current.y;
      meshRef.current.position.x = positionRef.current.x;

      // 감속
      velocityRef.current.x *= 0.98;
      velocityRef.current.y *= 0.98;
      velocityRef.current.z *= 0.98;
      positionRef.current.vx *= 0.98;

    } else if (phaseRef.current === "settling") {
      const elapsed = Date.now() - settleStartRef.current;
      const duration = 500;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4); // 더 부드러운 easing

      // 회전 보간
      const startX = rotationRef.current.x % (Math.PI * 2);
      const startY = rotationRef.current.y % (Math.PI * 2);
      const startZ = rotationRef.current.z % (Math.PI * 2);

      meshRef.current.rotation.x = THREE.MathUtils.lerp(startX, targetRotation[0], eased);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(startY, targetRotation[1], eased);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(startZ, targetRotation[2], eased);

      // 위치 보간
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, eased);
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, eased);

      if (progress >= 1) {
        phaseRef.current = "idle";
        onPhaseChange?.("idle");
        positionRef.current = { y: 0, vy: 0, x: 0, vx: 0 };
        onRollComplete?.();
      }
    }
  });

  return (
    <group ref={meshRef}>
      {/* 주사위 본체 */}
      <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial
          color="#fafafa"
          roughness={0.3}
          metalness={0.1}
        />
      </RoundedBox>

      {/* 각 면의 점들 */}
      <DiceFace value={1} position={[0, 0, 0.51]} rotation={[0, 0, 0]} />
      <DiceFace value={6} position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} />
      <DiceFace value={2} position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <DiceFace value={5} position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <DiceFace value={3} position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      <DiceFace value={4} position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

export function Dice3D({ value, isRolling, onRollComplete }: Dice3DProps) {
  const [phase, setPhase] = useState<"idle" | "rolling" | "settling">("idle");

  return (
    <div className="w-40 h-40">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 30 }}
        shadows
      >
        {/* 조명 */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-3, 3, -3]} intensity={0.3} color="#fff5e6" />

        {/* 카메라 컨트롤 */}
        <CameraController isRolling={isRolling} isSettled={phase === "idle" && !isRolling} />

        {/* 주사위 */}
        <DiceMesh
          value={value}
          isRolling={isRolling}
          onRollComplete={onRollComplete}
          onPhaseChange={setPhase}
        />

        {/* 바닥 그림자 */}
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.4}
          scale={5}
          blur={2}
          far={4}
        />

        {/* 환경 */}
        <Environment preset="studio" />
      </Canvas>
    </div>
  );
}
