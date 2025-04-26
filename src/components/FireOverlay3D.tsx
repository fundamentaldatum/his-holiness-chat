import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// Enhanced fire color palette, from base to tip
const fireColors = [
  "#fffbe6", // pale yellow
  "#ffd700", // gold
  "#ffb300", // orange
  "#ff9800", // deep orange
  "#ff5722", // red-orange
  "#e65100", // dark red-orange
  "#b71c1c", // deep red
  "#4e342e", // brown (smoke)
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

// Create a flame-shaped geometry
function createFlameGeometry() {
  const geometry = new THREE.BufferGeometry();
  
  // Create a teardrop/flame shape with vertices
  const vertices = [];
  const segments = 8;
  const height = 1.5;
  
  // Top point
  vertices.push(0, height, 0);
  
  // Create the circular base with a pinched bottom
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const radius = 0.5 * (1 - Math.sin(angle * 2) * 0.2); // Slightly irregular circle
    vertices.push(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }
  
  // Create faces
  const indices = [];
  for (let i = 1; i <= segments; i++) {
    indices.push(0, i, i + 1);
  }
  indices.push(0, segments, 1); // Close the loop
  
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  
  return geometry;
}

// Create a more natural-looking base with multiple embers
function FireBase() {
  const emberCount = 12;
  const embers = useMemo(() => {
    const arr = [];
    for (let i = 0; i < emberCount; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 2.4,
        y: -1.2 + Math.random() * 0.2,
        z: (Math.random() - 0.5) * 0.3,
        size: 0.1 + Math.random() * 0.25,
        flickerPhase: Math.random() * Math.PI * 2,
        color: fireColors[Math.floor(Math.random() * 3)], // Random color from the base colors
      });
    }
    return arr;
  }, []);
  
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    
    // Animate each ember
    embers.forEach((ember, i) => {
      const child = meshRef.current?.children[i];
      if (child) {
        // Flicker the embers
        const flicker = 0.85 + 0.3 * Math.sin(t * 8 + ember.flickerPhase);
        child.scale.set(ember.size * flicker, ember.size * flicker, ember.size * flicker);
        
        // Subtle movement
        child.position.y = ember.y + 0.05 * Math.sin(t * 3 + i);
        child.position.x = ember.x + 0.03 * Math.sin(t * 5 + i * 2);
      }
    });
  });
  
  return (
    <group ref={meshRef}>
      {embers.map((ember, i) => (
        <mesh key={i} position={[ember.x, ember.y, ember.z]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            transparent
            opacity={0.9}
            color={ember.color}
          />
        </mesh>
      ))}
    </group>
  );
}

// Smoke particles that appear at the top of flames
function SmokeParticles({ count = 40 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  // Each smoke particle
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 2.0,
        y: 0.8 + Math.random() * 0.5, // Start higher up where flames end
        z: (Math.random() - 0.5) * 0.5,
        speed: 0.2 + Math.random() * 0.3, // Slower than flames
        size: 0.15 + Math.random() * 0.2,
        flickerPhase: Math.random() * Math.PI * 2,
        wavePhase: Math.random() * Math.PI * 2,
        lifetime: 1.5 + Math.random() * 1.0,
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
      // Particle progress (0 at start, 1 at end of life)
      let progress = ((t * p.speed + p.flickerPhase) % p.lifetime) / p.lifetime;
      
      // Smoke rises and drifts
      let y = p.y + progress * 1.2;
      let x = p.x + 0.3 * Math.sin(t * 0.8 + p.wavePhase) * progress;
      
      // Smoke expands as it rises
      let size = p.size * (0.8 + progress * 0.7);
      
      // Smoke fades out
      let opacity = 0.3 * (1 - progress * 0.8);
      
      // Matrix
      const matrix = new THREE.Matrix4();
      matrix.makeTranslation(x, y, p.z);
      matrix.multiply(new THREE.Matrix4().makeScale(size, size, size));
      mesh.current.setMatrixAt(i, matrix);
      
      // Set color (smoke is grayish)
      const smokeColor = progress > 0.7 
        ? "#2d1a00" // darker at the end
        : lerpColor("#4e342e", "#2d1a00", progress);
      mesh.current.setColorAt(i, new THREE.Color(smokeColor));
      
      // Set opacity
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
        color="#4e342e"
      />
    </instancedMesh>
  );
}

// 3D fire particles with organic, flickering, flame-shaped particles
function FireParticles({ count = 180 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const flameGeometry = useMemo(() => createFlameGeometry(), []);
  
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
        rotationSpeed: (Math.random() - 0.5) * 0.2, // Random rotation speed
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
      
      // Vertical movement with more natural flame-like motion
      let y = p.y + progress * 2.5 + 
              0.25 * Math.sin(t * 2 + p.wavePhase + i) + 
              0.08 * Math.sin(t * 8 + p.seed * 10);
      
      // More natural horizontal flame motion
      let x = p.x + 
              0.18 * Math.sin(t * 6 + p.wavePhase + i) * (1 - progress) + 
              0.08 * Math.sin(t * 12 + p.seed * 10) * (1 - progress * 0.5);
      
      // Size tapers as it rises, with natural flame shape
      let size = p.baseSize * (1.1 - progress * 0.85) * 
                (0.7 + 0.5 * Math.abs(Math.sin(t * 8 + p.flickerPhase + i)));
      
      // Color interpolates from base to tip with more natural gradient
      let colorIdx = Math.floor(progress * (fireColors.length - 2));
      let colorT = (progress * (fireColors.length - 2)) % 1;
      let color = lerpColor(fireColors[colorIdx], fireColors[colorIdx + 1], colorT);
      
      // Opacity fades out at tip, with extra flicker
      let opacity = 0.7 * (1 - progress * 0.7) + 0.18 * Math.sin(t * 10 + p.seed * 20);
      
      // Create matrix with rotation for more natural flame appearance
      const matrix = new THREE.Matrix4();
      matrix.makeTranslation(x, y, p.z);
      
      // Add rotation to the flames
      const rotationMatrix = new THREE.Matrix4();
      rotationMatrix.makeRotationZ(p.rotationSpeed * t + p.flickerPhase);
      matrix.multiply(rotationMatrix);
      
      // Scale with more height for flame shape
      matrix.multiply(new THREE.Matrix4().makeScale(
        size * (0.8 + 0.4 * Math.sin(t + p.seed)), // Varying width
        size * 1.8, // Height
        size * 0.8  // Depth
      ));
      
      mesh.current.setMatrixAt(i, matrix);
      mesh.current.setColorAt(i, new THREE.Color(color));
      
      // Set opacity
      (mesh.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
    
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[flameGeometry, undefined, count]}>
      <meshBasicMaterial
        transparent
        depthWrite={false}
        color="#ffd700"
      />
    </instancedMesh>
  );
}

// Dynamic light source to enhance the fire effect
function FireLight() {
  const light = useRef<THREE.PointLight>(null);
  
  useFrame(({ clock }) => {
    if (!light.current) return;
    const t = clock.getElapsedTime();
    
    // Flicker the light intensity
    light.current.intensity = 1.5 + 0.5 * Math.sin(t * 10) + 0.3 * Math.sin(t * 17);
    
    // Subtle movement
    light.current.position.x = 0.2 * Math.sin(t * 3);
    light.current.position.y = -0.8 + 0.1 * Math.sin(t * 5);
  });
  
  return (
    <pointLight
      ref={light}
      position={[0, -0.8, 1]}
      color="#ff9800"
      intensity={1.5}
      distance={5}
    />
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
        <ambientLight intensity={0.3} />
        <FireLight />
        <FireParticles count={180} />
        <SmokeParticles count={40} />
        <FireBase />
      </Canvas>
    </div>
  );
}
