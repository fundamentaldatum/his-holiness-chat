import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '../../contexts/UserContext';
import { createCheckerboardTexture } from '../../utils/textUtils';
import { 
  ErrorBoundaryProps, 
  ErrorBoundaryState, 
  ModelLoaderProps, 
  ModelFallbackProps,
  ModelProps,
  ResetButtonProps
} from '../../utils/types';
import { 
  MODEL_PATH, 
  MODEL_SCALE, 
  ROTATION_SPEED, 
  SPIN_THRESHOLD, 
  DIZZY_COOLDOWN,
  DIZZY_MESSAGE
} from '../../utils/constants';

// Preload the model
useGLTF.preload(MODEL_PATH);

/**
 * Loading component to show while the model is loading
 */
export function ModelLoader({}: ModelLoaderProps) {
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="mb-2 almendra-font">memento mori</div>
        <div className="w-12 h-12 border-t-2 border-b-2 border-yellow-400 rounded-full animate-spin mx-auto"></div>
      </div>
    </Html>
  );
}

/**
 * Fallback component for when model loading fails
 */
export function ModelFallback({}: ModelFallbackProps) {
  // Checkerboard texture for placeholder
  const texture = createCheckerboardTexture();
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        metalness={0.2}
        roughness={0.7}
      />
    </mesh>
  );
}

/**
 * Error boundary for 3D model rendering
 */
export class ModelErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('Error in 3D model rendering:', error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <ModelFallback />;
    }
    return this.props.children;
  }
}

/**
 * Reset button component that appears when the model is not in default position
 */
export function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <Html position={[0, -2, 0]} center>
      <button
        onClick={onClick}
        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-full shadow-lg almendra-font text-sm"
        style={{
          transition: "all 0.3s ease",
          border: "2px solid #fff",
          boxShadow: "0 0 10px rgba(255, 215, 0, 0.7)",
          whiteSpace: "nowrap",
        }}
      >
        are you even listening?
      </button>
    </Html>
  );
}

/**
 * The model component with oscillating rotation and reset button functionality
 */
export function Model({}: ModelProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<any>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const [isDefaultView, setIsDefaultView] = useState(true);
  
  // Rotation tracking for dizziness detection
  const lastRotationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());
  const rotationSpeedRef = useRef<number>(0);
  const lastDizzyMessageRef = useRef<number>(0);
  
  // Get the userId for sending messages
  const { userId } = useUser();
  
  // Get the sendBotMessage mutation
  const sendBotMessage = useMutation(api.messages.sendBotMessage);
  
  // Function to handle camera movement
  const handleCameraChange = useCallback(() => {
    if (controlsRef.current) {
      // Check if camera has moved from default position
      const azimuthalAngle = controlsRef.current.getAzimuthalAngle();
      const polarAngle = controlsRef.current.getPolarAngle();
      
      // If the camera has moved significantly from the default view
      const isDefault = Math.abs(azimuthalAngle) < 0.1 && Math.abs(polarAngle - Math.PI / 2) < 0.1;
      setIsDefaultView(isDefault);
      
      // Calculate rotation speed
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTimeRef.current;
      
      if (timeDelta > 0) {
        const rotationDelta = Math.abs(azimuthalAngle - lastRotationRef.current);
        rotationSpeedRef.current = rotationDelta / timeDelta * 1000; // rotations per second
        
        // Check if spinning too fast and cooldown period has passed
        if (rotationSpeedRef.current > SPIN_THRESHOLD && 
            currentTime - lastDizzyMessageRef.current > DIZZY_COOLDOWN) {
          // Send dizzy message
          sendBotMessage({
            body: DIZZY_MESSAGE,
            userId
          });
          
          // Update last dizzy message time
          lastDizzyMessageRef.current = currentTime;
        }
        
        // Update last values
        lastRotationRef.current = azimuthalAngle;
        lastTimeRef.current = currentTime;
      }
    }
  }, [sendBotMessage, userId]);
  
  // Function to reset the camera to default position
  const resetCamera = useCallback(() => {
    if (controlsRef.current) {
      // Reset the camera position
      controlsRef.current.reset();
      
      // Ensure the target is at the origin
      controlsRef.current.target.set(0, 0, 0);
      
      // Update controls
      controlsRef.current.update();
      
      // Mark as default view
      setIsDefaultView(true);
    }
  }, []);
  
  // Use useFrame to create an oscillating rotation
  useFrame(() => {
    if (modelRef.current) {
      // Apply oscillating rotation to the model
      modelRef.current.rotation.y = Math.sin(clockRef.current.getElapsedTime() * ROTATION_SPEED) * 0.5;
    }
  });
  
  return (
    <>
      <primitive ref={modelRef} object={scene} scale={MODEL_SCALE} />
      
      {/* Show reset button only when not in default view */}
      {!isDefaultView && <ResetButton onClick={resetCamera} />}
      
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableZoom={false}
        enablePan={false}
        minDistance={5}
        maxDistance={5}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: undefined,
          RIGHT: undefined,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: undefined,
        }}
        onChange={handleCameraChange}
      />
    </>
  );
}

/**
 * Container component that sets up the 3D scene with the model
 */
export function ModelContainer() {
  return (
    <div className="w-full h-[40vh] xs:h-[45vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh] relative">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <React.Suspense fallback={<ModelLoader />}>
          <ModelErrorBoundary>
            <Model />
          </ModelErrorBoundary>
        </React.Suspense>
      </Canvas>
      <div className="text-center -mt-6 sm:-mt-8 relative z-10">
        <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl almendra-font text-indigo-300">🕊️Pope Francis🕊️</h2>
      </div>
    </div>
  );
}
