import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/theme/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

type Refs = {
  progress: { current: number };
  pointer: { current: { x: number; y: number } };
};

function NodeNetwork({ progress, dark }: { progress: Refs["progress"]; dark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { nodes, linePositions } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 26;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      pts.push(
        new THREE.Vector3(
          Math.cos(theta) * Math.sin(phi),
          Math.sin(theta) * Math.sin(phi),
          Math.cos(phi),
        ).multiplyScalar(3.4),
      );
    }
    const lines: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (pts[i].distanceTo(pts[j]) < 2.4) {
          lines.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }
    return { nodes: pts, linePositions: new Float32Array(lines) };
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const p = progress.current;
    g.rotation.y = t * 0.06 + p * Math.PI * 1.5;
    g.rotation.x = Math.sin(t * 0.1) * 0.12 + p * 0.7;
    g.scale.setScalar(1 + p * 0.45);
    g.position.z = -1 + p * 2.5;
  });

  return (
    <group ref={group}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={dark ? "#22d3ee" : "#0e7490"}
          transparent
          opacity={dark ? 0.26 : 0.16}
        />
      </lineSegments>
      {nodes.map((n, i) => (
        <mesh key={i} position={n}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color={dark ? "#67e8f9" : "#155e75"}
            transparent
            opacity={dark ? 0.9 : 0.65}
          />
        </mesh>
      ))}
    </group>
  );
}

function WireShapes({ progress, dark }: { progress: Refs["progress"]; dark: boolean }) {
  const knot = useRef<THREE.Mesh>(null);
  const ico = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;
    if (knot.current) {
      knot.current.rotation.x = t * 0.12 + p * 2.2;
      knot.current.rotation.y = t * 0.09 + p * 3.1;
      knot.current.position.z = -3.5 + p * 3;
      knot.current.scale.setScalar(1 + p * 0.6);
    }
    if (ico.current) {
      ico.current.rotation.y = -t * 0.1 - p * 2.0;
      ico.current.rotation.z = t * 0.07;
      ico.current.position.z = -2 + p * 1.5;
      ico.current.position.y = 1.2 - p * 2.4;
    }
  });

  return (
    <>
      <mesh ref={knot} position={[3.4, 0.2, -3.5]}>
        <torusKnotGeometry args={[1.7, 0.45, 140, 18]} />
        <meshBasicMaterial
          wireframe
          color={dark ? "#0e7490" : "#155e75"}
          transparent
          opacity={dark ? 0.32 : 0.14}
        />
      </mesh>
      <mesh ref={ico} position={[-3.8, 1.2, -2]}>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          wireframe
          color={dark ? "#67e8f9" : "#0e7490"}
          transparent
          opacity={dark ? 0.4 : 0.2}
        />
      </mesh>
    </>
  );
}

function CameraRig({ pointer }: { pointer: Refs["pointer"] }) {
  useFrame(({ camera }) => {
    camera.position.x += (pointer.current.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (-pointer.current.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export const Scene3D = () => {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const progress = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      st.kill();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
      data-testid="scene3d-canvas"
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <NodeNetwork progress={progress} dark={dark} />
        <WireShapes progress={progress} dark={dark} />
        <CameraRig pointer={pointer} />
      </Canvas>
    </div>
  );
};
