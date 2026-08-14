import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Character() {
  const rootRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyeLRef = useRef<THREE.Group>(null);
  const eyeRRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { x, y } = pointer.current;
    const head = headRef.current;
    if (head) {
      head.rotation.y += (x * 0.55 - head.rotation.y) * 0.08;
      head.rotation.x += (-y * 0.3 - head.rotation.x) * 0.08;
    }
    const phase = t % 4.2;
    const blink = phase < 0.18 ? Math.sin((phase / 0.18) * Math.PI) : 0;
    [eyeLRef, eyeRRef].forEach((r) => {
      const eye = r.current;
      if (!eye) return;
      eye.rotation.y += (x * 0.4 - eye.rotation.y) * 0.16;
      eye.rotation.x += (-y * 0.25 - eye.rotation.x) * 0.16;
      eye.scale.y = 1 - blink * 0.85;
    });
    const root = rootRef.current;
    if (root) {
      root.position.y = Math.sin(t * 1.4) * 0.05;
      root.rotation.y = Math.sin(t * 0.4) * 0.05;
    }
  });

  const skin = "#c68a5b";
  const skinDeep = "#a96f43";
  const hair = "#191210";
  const blazer = "#1e2a45";
  const scarf = "#aebccd";
  const gold = "#d4af37";

  return (
    <group ref={rootRef}>
      <group ref={headRef}>
        <mesh>
          <sphereGeometry args={[0.78, 48, 48]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.24, -0.1]} scale={[1.06, 0.95, 1.06]}>
          <sphereGeometry args={[0.78, 48, 48]} />
          <meshStandardMaterial color={hair} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.3, -0.42]} scale={[0.98, 1.15, 0.72]}>
          <sphereGeometry args={[0.62, 32, 32]} />
          <meshStandardMaterial color={hair} roughness={0.7} />
        </mesh>
        <mesh position={[-0.62, -0.38, 0.12]} scale={[0.34, 0.95, 0.45]}>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial color={hair} roughness={0.7} />
        </mesh>
        <mesh position={[0.62, -0.38, 0.12]} scale={[0.34, 0.95, 0.45]}>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshStandardMaterial color={hair} roughness={0.7} />
        </mesh>
        <group ref={eyeLRef} position={[-0.27, 0.08, 0.6]}>
          <mesh>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#1a1210" roughness={0.15} />
          </mesh>
        </group>
        <group ref={eyeRRef} position={[0.27, 0.08, 0.6]}>
          <mesh>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color="#ffffff" roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshStandardMaterial color="#1a1210" roughness={0.15} />
          </mesh>
        </group>
        <mesh position={[-0.27, 0.34, 0.62]} rotation={[0.15, 0, 0.12]}>
          <boxGeometry args={[0.24, 0.05, 0.05]} />
          <meshStandardMaterial color={hair} roughness={0.7} />
        </mesh>
        <mesh position={[0.27, 0.34, 0.62]} rotation={[0.15, 0, -0.12]}>
          <boxGeometry args={[0.24, 0.05, 0.05]} />
          <meshStandardMaterial color={hair} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.04, 0.76]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color={skinDeep} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.2, 0.64]} rotation={[0, 0, Math.PI * 1.125]}>
          <torusGeometry args={[0.24, 0.035, 12, 32, Math.PI * 0.75]} />
          <meshStandardMaterial color="#8f4a3a" roughness={0.5} />
        </mesh>
        <mesh position={[-0.44, -0.14, 0.55]} scale={[1, 0.6, 0.4]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#f2a0a0" roughness={0.7} transparent opacity={0.65} />
        </mesh>
        <mesh position={[0.44, -0.14, 0.55]} scale={[1, 0.6, 0.4]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial color="#f2a0a0" roughness={0.7} transparent opacity={0.65} />
        </mesh>
        <mesh position={[-0.76, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        <mesh position={[0.76, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={skin} roughness={0.55} />
        </mesh>
        <mesh position={[-0.78, -0.12, 0.06]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={gold} metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0.78, -0.12, 0.06]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={gold} metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      <mesh position={[0, -1.45, 0]}>
        <capsuleGeometry args={[0.58, 0.7, 8, 24]} />
        <meshStandardMaterial color={blazer} roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.92, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.1, 12, 32]} />
        <meshStandardMaterial color={scarf} roughness={0.85} />
      </mesh>
      <mesh position={[0, -1.28, 0.5]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.22, 0.5, 0.06]} />
        <meshStandardMaterial color={scarf} roughness={0.85} />
      </mesh>
      <mesh position={[-0.62, -1.2, 0]}>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color={blazer} roughness={0.75} />
      </mesh>
      <mesh position={[0.62, -1.2, 0]}>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color={blazer} roughness={0.75} />
      </mesh>
    </group>
  );
}

export const HeroAvatar = ({ dark }: { dark: boolean }) => (
  <Canvas camera={{ position: [0, 0.05, 3.1], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
    <ambientLight intensity={dark ? 0.6 : 0.95} />
    <directionalLight position={[4, 6, 5]} intensity={dark ? 1.6 : 1.15} color={dark ? "#cfeffd" : "#ffffff"} />
    <directionalLight position={[-5, 2, -3]} intensity={dark ? 0.8 : 0.45} color={dark ? "#155e75" : "#7dd3fc"} />
    <Character />
  </Canvas>
);
