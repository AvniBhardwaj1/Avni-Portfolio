import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function Robot() {
  const { scene } = useGLTF("/models/robot.glb");
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Object3D | null>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let head: THREE.Object3D | null = null;
    scene.traverse((obj) => {
      if (!head && obj.type === "Bone" && obj.name === "Head") head = obj;
    });
    headRef.current = head;

    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [scene]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const { x, y } = pointer.current;
    const head = headRef.current;
    if (head) {
      head.rotation.y += (x * 0.75 - head.rotation.y) * 0.08;
      head.rotation.x += (-y * 0.5 - head.rotation.x) * 0.08;
    }
    const g = groupRef.current;
    if (g) {
      g.position.y = -1.3 + Math.sin(t * 1.1) * 0.06;
      g.rotation.y += (x * 0.28 - g.rotation.y) * 0.05;
    }
  });

  return <primitive ref={groupRef} object={scene} position={[0, -1.3, 0]} scale={0.6} />;
}

useGLTF.preload("/models/robot.glb");

export const HeroAvatar = ({ dark }: { dark: boolean }) => (
  <Canvas camera={{ position: [0, 0.95, 5.0], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
    <ambientLight intensity={dark ? 0.55 : 0.9} />
    <directionalLight position={[4, 6, 5]} intensity={dark ? 1.7 : 1.2} color={dark ? "#cfeffd" : "#ffffff"} />
    <directionalLight position={[-5, 3, -4]} intensity={dark ? 0.7 : 0.4} color={dark ? "#155e75" : "#7dd3fc"} />
    <Suspense fallback={null}>
      <Robot />
    </Suspense>
  </Canvas>
);
