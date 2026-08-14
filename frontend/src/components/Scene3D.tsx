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

function makeDotTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.7)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

function ParticleField({ progress, dark }: { progress: Refs["progress"]; dark: boolean }) {
  const points = useRef<THREE.Points>(null);
  const texture = useMemo(() => makeDotTexture(), []);
  const positions = useMemo(() => {
    const count = 340;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 15;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const p = points.current;
    if (!p) return;
    const t = state.clock.elapsedTime;
    const prog = progress.current;
    p.rotation.y = t * 0.02 + prog * Math.PI;
    p.rotation.x = Math.sin(t * 0.08) * 0.08 + prog * 0.4;
    p.position.z = prog * 4;
    p.position.y = Math.sin(t * 0.15) * 0.3 - prog * 1.5;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        map={texture}
        transparent
        depthWrite={false}
        opacity={dark ? 0.4 : 0.2}
        color={dark ? "#67e8f9" : "#0e7490"}
        sizeAttenuation
      />
    </points>
  );
}

function NodeCloud({ progress, dark }: { progress: Refs["progress"]; dark: boolean }) {
  const group = useRef<THREE.Group>(null);
  const nodes = useMemo(() => {
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
    return pts;
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
      {nodes.map((n, i) => (
        <mesh key={i} position={n}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color={dark ? "#67e8f9" : "#155e75"}
            transparent
            opacity={dark ? 0.55 : 0.35}
          />
        </mesh>
      ))}
    </group>
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
        <ParticleField progress={progress} dark={dark} />
        <NodeCloud progress={progress} dark={dark} />
        <CameraRig pointer={pointer} />
      </Canvas>
    </div>
  );
};
