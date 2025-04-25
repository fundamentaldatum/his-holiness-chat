import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// Fire color palette, from base to tip
const fireColors = [
  "#fffbe6", // pale yellow
  "#ffd700", // gold
  "#ffb300", // orange
  "#ff9800", // deep orange
  "#ff5722", // red-orange
  "#e65100", // dark red-orange
  "#2d1a00", // dark brown (smoke tip)
];

// Linear interpolate between two hex colors
function lerpColor(a: string, b: string, t: number) {
  const ah = parseInt(a.replace("#", ""), 16);
  const bh = parseInt(b.replace("#", ""), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1)}`;
}

// 3D fire particles with organic, flickering, elongated flames
function FireParticles({ count = 160 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  // Each particle: [x, y, z, speed, baseSize, flickerPhase, wavePhase, lifetime, seed]
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 2.2,
        y: -1.2 - Math.random() * 0.2,
        z: (Math.random() - 0.5) * 0.3,
        speed: 0.7 + Math.random() * 0.7,
        baseSize: 0.13 + Math.random() * 0.22,
        flickerPhase: Math.random() * Math.PI * 2,
        wavePhase: Math.random() * Math.PI * 2,
        lifetime: 1.2 + Math.random() * 0.7,
        seed: Math.random(),
      });
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      // Particle progress (0 at base, 1 at tip)
      let progress = ((t * p.speed + p.flickerPhase) % p.lifetime) / p.lifetime;
      // Vertical stretch for flame shape, with extra flicker
      let y = p.y + progress * 2.5 + 0.25 * Math.sin(t * 2 + p.wavePhase + i) + 0.08 * Math.sin(t * 8 + p.seed * 10);
      // Wavy, flickering horizontal motion
      let x = p.x + 0.18 * Math.sin(t * 6 + p.wavePhase + i) * (1 - progress) + 0.08 * Math.sin(t * 12 + p.seed * 10);
      // Size tapers as it rises, with extra vertical stretch
      let size = p.baseSize * (1.1 - progress * 0.85) * (0.7 + 0.5 * Math.abs(Math.sin(t * 8 + p.flickerPhase + i)));
      // Color interpolates from base to tip
      let colorIdx = Math.floor(progress * (fireColors.length - 2));
      let colorT = (progress * (fireColors.length - 2)) % 1;
      let color = lerpColor(fireColors[colorIdx], fireColors[colorIdx + 1], colorT);
      // Opacity fades out at tip, with extra flicker
      let opacity = 0.7 * (1 - progress) + 0.18 * Math.sin(t * 10 + p.seed * 20);
      // Matrix
      const matrix = new THREE.Matrix4();
      matrix.makeTranslation(x, y, p.z);
      matrix.multiply(new THREE.Matrix4().makeScale(size, size * 2.1, size)); // extra vertical stretch
      mesh.current.setMatrixAt(i, matrix);
      mesh.current.setColorAt(i, new THREE.Color(color));
      // Set opacity per instance (Three.js doesn't support per-instance opacity, so we use a global value)
      (mesh.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial
        transparent
        depthWrite={false}
        color="#ffd700"
      />
    </instancedMesh>
  );
}

// 3D fire overlay for burning animation
export function FireOverlay3D() {
  // The overlay is sized to cover the chat area (aspect ratio ~1:1.2)
  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      <Canvas
        orthographic
        camera={{ zoom: 120, position: [0, 0, 10] }}
        style={{ width: "100%", height: "100%", background: "transparent" }}
      >
        <ambientLight intensity={0.7} />
        <FireParticles count={160} />
        {/* Glowing, jagged base */}
        <mesh position={[0, -1.1, 0]}>
          <planeGeometry args={[2.6, 0.5]} />
          <meshBasicMaterial
            transparent
            opacity={0.85}
            color="#ffd700"
          />
        </mesh>
      </Canvas>
    </div>
  );
}
