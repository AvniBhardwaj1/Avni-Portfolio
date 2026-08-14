import { useLayoutEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { playLock, playWhoosh } from "@/lib/sounds";
import { useMotion } from "@/theme/MotionContext";

gsap.registerPlugin(ScrollTrigger);

const ENGINE_PART =
  /^(engine|fan|ftf|stage|turbine|nozzle|bypass|cascade|cowl|intake|nosecone|pylon|reverse|rim|poly|object01|comph|cylinder01)/i;
const WING = /^(wingseg|leading|trailing|slat|slot|flap|aileron|spoiler|tip|winglet)/i;
const TAIL_V = /^(vstab|rudder|upperrudder|lowerrudder)/i;
const TAIL_H = /^(stabilizer|elev)/i;
const GEAR = /^gear/i;
const SHADOW = /^shadow/i;

const GROUP_IDS = [
  "fuselage",
  "wingL",
  "wingR",
  "eng0",
  "eng1",
  "eng2",
  "eng3",
  "tailV",
  "tailH",
  "gear",
];

type Groups = Record<string, THREE.Group>;

function A380({ onReady, reduced }: { onReady: (groups: Groups, fly: THREE.Group) => void; reduced: boolean }) {
  const { scene } = useGLTF("/models/a380.glb");
  const flyRef = useRef<THREE.Group>(null);
  const doneRef = useRef(false);

  useLayoutEffect(() => {
    if (doneRef.current || !flyRef.current) return;
    doneRef.current = true;

    const root = scene;
    root.updateMatrixWorld(true);
    const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
    if (size.z > size.x) root.rotation.y = Math.PI / 2;
    root.scale.setScalar(9 / Math.max(size.x, size.z));
    root.updateMatrixWorld(true);
    const center = new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3());
    root.position.sub(center);
    root.updateMatrixWorld(true);

    const cats: Groups = {};
    GROUP_IDS.forEach((id) => {
      const g = new THREE.Group();
      g.name = `cat-${id}`;
      cats[id] = g;
      flyRef.current!.add(g);
    });

    const meshes: THREE.Mesh[] = [];
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
    });

    const wp = new THREE.Vector3();
    const engineCore = meshes.filter((m) => /^engine/i.test(m.name));
    const left = engineCore.filter((m) => m.getWorldPosition(wp).z < 0);
    const right = engineCore.filter((m) => m.getWorldPosition(wp).z >= 0);
    const splitBySpan = (arr: THREE.Mesh[]) => {
      const sorted = [...arr].sort(
        (a, b) => Math.abs(a.getWorldPosition(wp).z) - Math.abs(b.getWorldPosition(wp).z),
      );
      return [sorted.slice(0, Math.ceil(sorted.length / 2)), sorted.slice(Math.ceil(sorted.length / 2))];
    };
    const [lIn, lOut] = splitBySpan(left);
    const [rIn, rOut] = splitBySpan(right);
    const clusters = [lOut, lIn, rIn, rOut].map((arr) => {
      const c = new THREE.Vector3();
      arr.forEach((m) => c.add(m.getWorldPosition(wp)));
      return arr.length ? c.divideScalar(arr.length) : new THREE.Vector3();
    });

    meshes.forEach((m) => {
      if (SHADOW.test(m.name)) {
        m.visible = false;
        return;
      }
      let target: THREE.Group;
      if (ENGINE_PART.test(m.name)) {
        m.getWorldPosition(wp);
        let best = 0;
        let bestDist = Infinity;
        clusters.forEach((c, i) => {
          const d = wp.distanceTo(c);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        target = cats[`eng${best}`];
      } else if (WING.test(m.name)) {
        target = m.getWorldPosition(wp).z < 0 ? cats.wingL : cats.wingR;
      } else if (TAIL_V.test(m.name)) {
        target = cats.tailV;
      } else if (TAIL_H.test(m.name)) {
        target = cats.tailH;
      } else if (GEAR.test(m.name)) {
        target = cats.gear;
      } else {
        target = cats.fuselage;
      }
      target.attach(m);
    });

    GROUP_IDS.forEach((id, i) => {
      const g = cats[id];
      if (!g.children.length) return;
      const c = new THREE.Vector3();
      g.children.forEach((ch) => c.add(ch.getWorldPosition(wp)));
      c.divideScalar(g.children.length);
      const dir = c.length() > 0.6 ? c.clone().normalize() : new THREE.Vector3(0, 1, 0);
      const dist = id === "fuselage" ? 2.4 : 4.2 + (i % 3) * 1.3;
      const exPos: [number, number, number] = [
        dir.x * dist,
        dir.y * dist + (i % 2 === 0 ? 2.4 : -2.2),
        dir.z * dist,
      ];
      const exRot: [number, number, number] = [
        ((i * 37) % 10) / 12 - 0.4,
        ((i * 53) % 10) / 12 - 0.4,
        ((i * 71) % 10) / 12 - 0.4,
      ];
      g.userData.exploded = { pos: exPos, rot: exRot };
      if (!reduced) {
        g.position.set(...exPos);
        g.rotation.set(...exRot);
      }
    });

    onReady(cats, flyRef.current);
  }, [scene, onReady]);

  return (
    <group ref={flyRef}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/models/a380.glb");

export const AircraftAssembly = ({ dark }: { dark: boolean }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardLRef = useRef<HTMLDivElement>(null);
  const cardRRef = useRef<HTMLDivElement>(null);
  const [model, setModel] = useState<{ groups: Groups; fly: THREE.Group } | null>(null);
  const { reduced } = useMotion();

  useLayoutEffect(() => {
    if (!model) return;
    GROUP_IDS.forEach((id) => {
      const g = model.groups[id];
      const e = g?.userData.exploded;
      if (!g || !e) return;
      if (reduced) {
        g.position.set(0, 0, 0);
        g.rotation.set(0, 0, 0);
      } else {
        g.position.set(e.pos[0], e.pos[1], e.pos[2]);
        g.rotation.set(e.rot[0], e.rot[1], e.rot[2]);
      }
    });
    if (reduced) {
      model.fly.position.set(0, 0, 0);
      model.fly.rotation.set(0, Math.PI * 0.3, 0);
    }
  }, [model, reduced]);

  useLayoutEffect(() => {
    if (!model || !sectionRef.current || reduced) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=320%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
      GROUP_IDS.forEach((id, i) => {
        const g = model.groups[id];
        if (!g || !g.children.length) return;
        tl.to(g.position, { x: 0, y: 0, z: 0, duration: 0.5, ease: "power2.inOut" }, i * 0.035);
        tl.to(g.rotation, { x: 0, y: 0, z: 0, duration: 0.5, ease: "power2.inOut" }, i * 0.035);
        tl.call(playLock, [], i * 0.035 + 0.48);
      });
      tl.to(model.fly.rotation, { y: Math.PI * 0.3, duration: 0.14, ease: "sine.inOut" }, 0.66);
      tl.fromTo(cardLRef.current, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.1, ease: "power2.out" }, 0.68);
      tl.fromTo(cardRRef.current, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.1, ease: "power2.out" }, 0.72);
      tl.to(model.fly.rotation, { z: 0.6, y: -Math.PI * 0.12, duration: 0.14, ease: "power2.in" }, 0.85);
      tl.to(model.fly.position, { x: -20, y: 5, duration: 0.14, ease: "power2.in" }, 0.85);
      tl.to([cardLRef.current, cardRRef.current], { opacity: 0, duration: 0.07 }, 0.87);
    }, sectionRef);
    return () => ctx.revert();
  }, [model]);

  return (
    <div ref={sectionRef} className="relative h-screen overflow-hidden" data-testid="aircraft-assembly">
      <div className="pointer-events-none absolute inset-0">
        <Canvas camera={{ position: [0, 1.4, 11], fov: 42 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={dark ? 0.5 : 0.85} />
          <directionalLight position={[6, 8, 4]} intensity={dark ? 1.6 : 1.1} color={dark ? "#bfefff" : "#ffffff"} />
          <directionalLight position={[-6, 3, -4]} intensity={dark ? 0.5 : 0.4} color={dark ? "#155e75" : "#7dd3fc"} />
          <A380 onReady={(groups, fly) => setModel({ groups, fly })} reduced={reduced} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute left-6 top-24 md:left-16 lg:left-24">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Scroll to assemble the A380</p>
        <h3 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-6xl">
          Built at Airbus<span className="text-accent">.</span>
        </h3>
      </div>

      <div
        ref={cardLRef}
        style={{ opacity: reduced ? 1 : 0 }}
        data-testid="airbus-card-fpbot"
        className="pointer-events-none absolute left-6 top-[26%] max-w-sm rounded-2xl border border-foreground/10 bg-background/60 p-7 backdrop-blur-xl md:left-16 lg:left-24"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Airbus India — Internship</p>
        <h4 className="mt-3 font-display text-2xl font-bold tracking-tight">FP-BOT</h4>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Architected a Dockerized RAG pipeline deployed via Jenkins CI/CD — natural-language
          querying of technical documentation through a FastAPI service.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["RAG", "Docker", "Jenkins", "FastAPI"].map((t) => (
            <span key={t} className="rounded-full border border-foreground/10 px-3 py-1 font-mono text-[10px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div
        ref={cardRRef}
        style={{ opacity: reduced ? 1 : 0 }}
        data-testid="airbus-card-airsimupy"
        className="pointer-events-none absolute bottom-[18%] right-6 max-w-sm rounded-2xl border border-foreground/10 bg-background/60 p-7 backdrop-blur-xl md:right-16 lg:right-24"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">Simulation Engine & Validation</p>
        <h4 className="mt-3 font-display text-2xl font-bold tracking-tight">AirSimuPy</h4>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Python + PySide6 platform executing block-diagram data pipelines on NetworkX graphs
          with NumPy — built on a Hybrid Compiled Architecture. Also validated a Python-based
          Sorting Tool against legacy Fortran solvers.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["PySide6", "NetworkX", "NumPy", "Fortran"].map((t) => (
            <span key={t} className="rounded-full border border-foreground/10 px-3 py-1 font-mono text-[10px] text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
