import { useLayoutEffect, useRef } from "react";
import type { ReactElement } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Part = {
  id: string;
  geo: ReactElement;
  pos: [number, number, number];
  rot: [number, number, number];
  exploded: [number, number, number];
  explodedRot: [number, number, number];
  accent?: boolean;
};

const PARTS: Part[] = [
  {
    id: "fuselage",
    geo: <cylinderGeometry args={[0.42, 0.42, 5.6, 24]} />,
    pos: [0, 0, 0],
    rot: [0, 0, Math.PI / 2],
    exploded: [-7, 2.5, -2],
    explodedRot: [0.6, 0.4, 2.4],
  },
  {
    id: "nose",
    geo: <coneGeometry args={[0.42, 1.2, 24]} />,
    pos: [3.4, 0, 0],
    rot: [0, 0, -Math.PI / 2],
    exploded: [5.5, -2.5, 1.5],
    explodedRot: [1.2, 0.8, -0.6],
  },
  {
    id: "tail-cone",
    geo: <coneGeometry args={[0.42, 1.0, 24]} />,
    pos: [-3.3, 0, 0],
    rot: [0, 0, Math.PI / 2],
    exploded: [-5, -3, 2.5],
    explodedRot: [-0.8, 1.1, 0.4],
  },
  {
    id: "wing-l",
    geo: <boxGeometry args={[1.5, 0.1, 3.0]} />,
    pos: [-0.4, 0, 2.2],
    rot: [0, 0, 0],
    exploded: [-2, 4, 6],
    explodedRot: [0.5, 0.9, 0.7],
    accent: true,
  },
  {
    id: "wing-r",
    geo: <boxGeometry args={[1.5, 0.1, 3.0]} />,
    pos: [-0.4, 0, -2.2],
    rot: [0, 0, 0],
    exploded: [1.5, -4.5, -6],
    explodedRot: [-0.6, -0.4, 1.2],
    accent: true,
  },
  {
    id: "engine-l",
    geo: <cylinderGeometry args={[0.28, 0.28, 1.1, 18]} />,
    pos: [0.2, -0.45, 1.5],
    rot: [0, 0, Math.PI / 2],
    exploded: [3.5, 3.5, 4],
    explodedRot: [1.4, 0.2, 0.9],
  },
  {
    id: "engine-r",
    geo: <cylinderGeometry args={[0.28, 0.28, 1.1, 18]} />,
    pos: [0.2, -0.45, -1.5],
    rot: [0, 0, Math.PI / 2],
    exploded: [-3.5, -4, -4],
    explodedRot: [-1.1, 0.7, -0.5],
  },
  {
    id: "tail-fin",
    geo: <boxGeometry args={[0.8, 1.3, 0.12]} />,
    pos: [-2.6, 0.75, 0],
    rot: [0, 0, 0],
    exploded: [6, 4.5, -3],
    explodedRot: [0.9, -1.2, 0.3],
    accent: true,
  },
  {
    id: "stab-l",
    geo: <boxGeometry args={[0.7, 0.08, 1.1]} />,
    pos: [-2.6, 0.3, 0.85],
    rot: [0, 0, 0],
    exploded: [0.5, -5, 5],
    explodedRot: [-0.4, 1.3, -0.9],
  },
  {
    id: "stab-r",
    geo: <boxGeometry args={[0.7, 0.08, 1.1]} />,
    pos: [-2.6, 0.3, -0.85],
    rot: [0, 0, 0],
    exploded: [-6, 1, -5],
    explodedRot: [1.1, -0.6, 0.8],
  },
];

export const AircraftAssembly = ({ dark }: { dark: boolean }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const partsRef = useRef<THREE.Mesh[]>([]);

  useLayoutEffect(() => {
    let ctx: gsap.Context | undefined;
    let raf = 0;
    const init = () => {
      if (
        !sectionRef.current ||
        !groupRef.current ||
        !cardRef.current ||
        partsRef.current.filter(Boolean).length !== PARTS.length
      ) {
        raf = requestAnimationFrame(init);
        return;
      }
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=300%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });
        partsRef.current.forEach((mesh, i) => {
          const p = PARTS[i];
          if (!mesh || !p) return;
          tl.to(
            mesh.position,
            { x: p.pos[0], y: p.pos[1], z: p.pos[2], duration: 0.5, ease: "power2.inOut" },
            i * 0.02,
          );
          tl.to(
            mesh.rotation,
            { x: p.rot[0], y: p.rot[1], z: p.rot[2], duration: 0.5, ease: "power2.inOut" },
            i * 0.02,
          );
        });
        tl.to(groupRef.current!.rotation, { y: Math.PI * 0.35, duration: 0.12, ease: "sine.inOut" }, 0.68);
        tl.fromTo(
          cardRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.1, ease: "power2.out" },
          0.7,
        );
        tl.to(
          groupRef.current!.rotation,
          { z: -0.65, y: Math.PI * 0.1, duration: 0.14, ease: "power2.in" },
          0.84,
        );
        tl.to(groupRef.current!.position, { x: 18, y: 4.5, duration: 0.14, ease: "power2.in" }, 0.84);
        tl.to(cardRef.current, { opacity: 0, y: -30, duration: 0.08 }, 0.88);
      }, sectionRef);
    };
    raf = requestAnimationFrame(init);
    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative h-screen overflow-hidden" data-testid="aircraft-assembly">
      <div className="pointer-events-none absolute inset-0">
        <Canvas camera={{ position: [0, 1.6, 9.5], fov: 45 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={dark ? 0.5 : 0.85} />
          <directionalLight position={[6, 8, 4]} intensity={dark ? 1.6 : 1.1} color={dark ? "#bfefff" : "#ffffff"} />
          <directionalLight position={[-6, 3, -4]} intensity={dark ? 0.5 : 0.4} color={dark ? "#155e75" : "#7dd3fc"} />
          <group ref={groupRef}>
            {PARTS.map((p, i) => (
              <mesh
                key={p.id}
                ref={(m) => {
                  if (m) partsRef.current[i] = m;
                }}
                position={p.exploded}
                rotation={p.explodedRot}
              >
                {p.geo}
                <meshStandardMaterial
                  color={p.accent ? "#22d3ee" : dark ? "#64748b" : "#aebac8"}
                  metalness={0.65}
                  roughness={0.3}
                />
              </mesh>
            ))}
          </group>
        </Canvas>
      </div>

      <div className="pointer-events-none absolute left-6 top-24 md:left-16 lg:left-24">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Scroll to assemble</p>
        <h3 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
          Built at Airbus<span className="text-accent">.</span>
        </h3>
      </div>

      <div
        ref={cardRef}
        style={{ opacity: 0 }}
        data-testid="airbus-overlay-card"
        className="pointer-events-none absolute bottom-24 right-6 max-w-sm rounded-2xl border border-foreground/10 bg-background/70 p-6 backdrop-blur-xl md:right-16 lg:right-24"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Assembly complete</p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          FP-BOT — a Dockerized RAG pipeline shipped via Jenkins CI/CD — and AirSimuPy, a
          PySide6 simulation engine executing block-diagram pipelines on NetworkX graphs.
        </p>
      </div>
    </div>
  );
};
