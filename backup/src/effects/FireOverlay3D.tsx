import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FireOverlay3DProps } from "../../utils/types";
import { FIRE_COLORS } from "../../utils/constants";
import { lerpColor } from "../../utils/textUtils";

/**
 * Linear interpolate between two hex colors
 * @param a - First color in hex format
 * @param b - Second color in hex format
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated color in hex format
 */
function createFlameGeometry() {
  const geometry = new THREE.BufferGeometry();
  
  // Create a more complex flame shape with vertices
  const vertices = [];
  const segments = 12; // More segments for smoother shape
  const height = 1.8;  // Taller flame
  
  // Top point (slightly offset for asymmetry)
  vertices.push(0.05, height, 0);
  
  // Create intermediate points for a more natural flame shape
  const midHeight = height * 0.6;
  const quarterHeight = height * 0.3;
  
  // Add some intermediate points to create a more natural flame curve
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    
    // Vary the radius based on angle to create flickering effect
    const baseRadius = 0.5 * (1 - Math.sin(angle * 3) * 0.15);
    
    // Add points at different heights for a more complex shape
    if (i % 3 === 0) {
      // Add a point at mid-height with varying radius
      const midRadius = baseRadius * 0.7 * (1 + Math.sin(angle * 5) * 0.2);
      vertices.push(
        Math.cos(angle) * midRadius, 
        midHeight + Math.sin(angle * 4) * 0.1, 
        Math.sin(angle) * midRadius * 0.8
      );
    }
    
    if (i % 2 === 0) {
      // Add a point at quarter-height
      const quarterRadius = baseRadius * 0.85;
      vertices.push(
        Math.cos(angle) * quarterRadius, 
        quarterHeight + Math.sin(angle * 2) * 0.05, 
        Math.sin(angle) * quarterRadius * 0.9
      );
    }
    
    // Base points with a more natural, flickering shape
    vertices.push(
      Math.cos(angle) * baseRadius * (1 + Math.sin(angle * 7) * 0.05), 
      0, 
      Math.sin(angle) * baseRadius * 0.9
    );
  }
  
  // Create faces - we need to triangulate our more complex shape
  const indices = [];
  let vertexCount = vertices.length / 3;
  
  // Connect top point to all other points
  for (let i = 1; i < vertexCount - 1; i++) {
    indices.push(0, i, i + 1);
  }
  indices.push(0, vertexCount - 1, 1); // Close the loop
  
  // Connect intermediate points
  for (let i = 1; i < vertexCount - 2; i++) {
    if (i % 2 === 1) {
      indices.push(i, i + 1, i + 2);
    }
  }
  
  geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * Create a more natural-looking base with multiple embers
 */
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
        color: FIRE_COLORS[Math.floor(Math.random() * 3)], // Random color from the base colors
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

/**
 * Smoke particles that appear at the top of flames
 */
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

/**
 * 3D fire particles with more realistic, flickering, flame-shaped particles
 */
function FireParticles({ count = 220 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const flameGeometry = useMemo(() => createFlameGeometry(), []);
  
  // Each particle with enhanced properties for more realistic flames
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 2.0, // Slightly narrower distribution
        y: -1.2 - Math.random() * 0.3,
        z: (Math.random() - 0.5) * 0.4,
        speed: 0.6 + Math.random() * 0.8, // More varied speeds
        baseSize: 0.1 + Math.random() * 0.25, // More varied sizes
        flickerPhase: Math.random() * Math.PI * 2,
        wavePhase: Math.random() * Math.PI * 2,
        lifetime: 1.0 + Math.random() * 0.9, // Longer potential lifetime
        seed: Math.random(),
        rotationSpeed: (Math.random() - 0.5) * 0.3, // More rotation
        // Add twist for more realistic flame movement
        twistFactor: 0.2 + Math.random() * 0.4,
        // Add unique flicker frequency
        flickerFreq: 6 + Math.random() * 8,
        // Add unique color bias (some flames more yellow, some more orange)
        colorBias: Math.random() * 0.3,
      });
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const p = particles[i];
      // Particle progress with more natural variation
      let progress = ((t * p.speed + p.flickerPhase) % p.lifetime) / p.lifetime;
      
      // Enhanced vertical movement with more natural flame-like motion
      let y = p.y + progress * 2.7 + 
              0.3 * Math.sin(t * 1.5 + p.wavePhase + i * 0.1) + 
              0.1 * Math.sin(t * p.flickerFreq + p.seed * 10);
      
      // More complex horizontal flame motion with twist effect
      let x = p.x + 
              0.2 * Math.sin(t * 4 + p.wavePhase + i * 0.2) * (1 - progress * 0.7) + 
              0.1 * Math.sin(t * 10 + p.seed * 10) * (1 - progress * 0.6) +
              // Add spiral/twist effect as flames rise
              p.twistFactor * progress * Math.sin(progress * 8 + t * 2);
      
      // Z-axis movement for more 3D effect
      let z = p.z + 
              0.05 * Math.sin(t * 3 + p.seed * 15) * progress;
      
      // Size varies more naturally with height and flicker
      let size = p.baseSize * (1.2 - progress * 0.9) * 
                (0.75 + 0.45 * Math.abs(Math.sin(t * p.flickerFreq * 0.5 + p.flickerPhase)));
      
      // Enhanced color interpolation with individual flame color bias
      let colorProgress = progress * (1 - p.colorBias); // Some flames stay yellow/orange longer
      let colorIdx = Math.floor(colorProgress * (FIRE_COLORS.length - 2));
      let colorT = (colorProgress * (FIRE_COLORS.length - 2)) % 1;
      let color = lerpColor(FIRE_COLORS[colorIdx], FIRE_COLORS[colorIdx + 1], colorT);
      
      // Improved opacity with more natural fade
      let opacity = 0.8 * (1 - progress * 0.65) + 
                    0.2 * Math.sin(t * p.flickerFreq * 0.7 + p.seed * 20);
      
      // Create matrix with enhanced transformations
      const matrix = new THREE.Matrix4();
      matrix.makeTranslation(x, y, z);
      
      // Add more complex rotation to the flames
      const rotationMatrix = new THREE.Matrix4();
      // Rotation around Y axis for twisting effect
      rotationMatrix.makeRotationY(p.rotationSpeed * 0.5 * t + p.flickerPhase);
      matrix.multiply(rotationMatrix);
      
      // Rotation around Z for flickering effect
      const zRotation = new THREE.Matrix4();
      zRotation.makeRotationZ(p.rotationSpeed * t + p.flickerPhase + progress * 0.5);
      matrix.multiply(zRotation);
      
      // Scale with more natural flame shape - wider at bottom, narrower at top
      matrix.multiply(new THREE.Matrix4().makeScale(
        size * (0.9 + 0.3 * Math.sin(t * 2 + p.seed) - progress * 0.3), // Width narrows at top
        size * (1.9 + 0.2 * Math.sin(t + p.flickerPhase)), // Height
        size * (0.7 - progress * 0.2)  // Depth decreases slightly at top
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
        blending={THREE.AdditiveBlending} // Add additive blending for more realistic fire glow
      />
    </instancedMesh>
  );
}

/**
 * Dynamic light source to enhance the fire effect
 */
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

/**
 * Responsive camera component that adjusts zoom based on screen size
 */
function ResponsiveCamera() {
  const { size, camera } = useThree();
  
  useEffect(() => {
    // Adjust zoom based on screen width - enhanced for better mobile coverage
    const calculateZoom = () => {
      if (size.width < 360) {
        return 70; // Extra small mobile devices
      } else if (size.width < 480) {
        return 80; // Small mobile devices
      } else if (size.width < 640) {
        return 90; // Medium mobile devices
      } else if (size.width < 768) {
        return 100; // Tablets
      } else {
        return 120; // Desktop
      }
    };
    
    // Apply zoom to the orthographic camera
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = calculateZoom();
      camera.updateProjectionMatrix();
    }
  }, [size.width, camera]);
  
  return null; // No need to render anything, we're modifying the default camera
}

/**
 * 3D fire overlay for burning animation
 */
export function FireOverlay3D({}: FireOverlay3DProps) {
  // Enhanced state to track screen size more precisely
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isSmallMobile: false,
    width: 0,
    height: 0
  });
  
  // Detect screen size with more granularity
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({
        isMobile: width < 768,
        isSmallMobile: width < 480,
        width,
        height
      });
    };
    
    // Check initially
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Adjust particle counts based on screen size with more granularity
  const fireParticleCount = screenSize.isSmallMobile ? 80 : (screenSize.isMobile ? 120 : 220);
  const smokeParticleCount = screenSize.isSmallMobile ? 15 : (screenSize.isMobile ? 25 : 50);
  
  // Calculate optimal container style based on screen size
  const containerStyle = useMemo(() => {
    // Base styles
    const style: React.CSSProperties = {
      width: "100%",
      height: "100%",
      background: "transparent",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    };
    
    // Add specific adjustments for mobile
    if (screenSize.isMobile) {
      // Ensure the fire effect covers the entire chat area on mobile
      style.minHeight = screenSize.isSmallMobile ? "250px" : "300px";
      
      // Add a slight scale adjustment for better visibility on small screens
      if (screenSize.isSmallMobile) {
        style.transform = "scale(1.1)";
      }
    }
    
    return style;
  }, [screenSize]);
  
  // The overlay is sized to cover the chat area with improved positioning
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      <div className="w-full h-full min-h-[200px] relative">
        <Canvas
          orthographic
          camera={{ position: [0, 0, 10] }}
          style={containerStyle}
        >
          <ResponsiveCamera />
          <ambientLight intensity={0.3} />
          <FireLight />
          <FireParticles count={fireParticleCount} />
          <SmokeParticles count={smokeParticleCount} />
          <FireBase />
        </Canvas>
      </div>
    </div>
  );
}
