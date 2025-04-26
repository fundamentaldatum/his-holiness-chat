import React, { useEffect, useRef, useState, Suspense, ReactNode, useMemo, useCallback } from "react";
import { useMutation, useQuery, useMutation as useConvexMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { ChatInput, ChatInputRef } from "./components/ChatInput";
import { ChatMessage } from "./components/ChatMessage";
import { FireOverlay3D } from "./components/FireOverlay3D";
import { ConfessionDropdown } from "./components/ConfessionDropdown";
import * as THREE from "three";

// Helper to create a checkerboard texture
function createCheckerboardTexture(size = 256, squares = 8) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const squareSize = size / squares;
  for (let y = 0; y < squares; y++) {
    for (let x = 0; x < squares; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#f3e9c7" : "#3b3b3b";
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
  }
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Function to get or create a unique user ID
function getUserId() {
  let userId = localStorage.getItem('popeUserId');
  if (!userId) {
    userId = crypto.randomUUID(); // Generate a UUID
    localStorage.setItem('popeUserId', userId);
  }
  return userId;
}

// Preload the model
useGLTF.preload('/pope_francis.glb');

// Loading component to show while the model is loading
function ModelLoader() {
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="mb-2 almendra-font">Loading His Holiness...</div>
        <div className="w-12 h-12 border-t-2 border-b-2 border-yellow-400 rounded-full animate-spin mx-auto"></div>
      </div>
    </Html>
  );
}

// Fallback component for when model loading fails
function ModelFallback() {
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

// Error boundary for 3D model rendering
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ModelErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('Error in 3D model rendering:', error);
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ModelFallback />;
    }
    return this.props.children;
  }
}

// Reset button component that appears when the model is not in default position
function ResetButton({ onClick }: { onClick: () => void }) {
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

// The model component with oscillating rotation and reset button functionality
function Model() {
  const { scene } = useGLTF('/pope_francis.glb');
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
  const userId = useMemo(() => getUserId(), []);
  
  // Get the sendBotMessage mutation
  const sendBotMessage = useConvexMutation(api.messages.sendBotMessage);
  
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
        const SPIN_THRESHOLD = 2.0; // Adjust this threshold as needed
        const COOLDOWN_PERIOD = 10000; // 10 seconds cooldown
        
        if (rotationSpeedRef.current > SPIN_THRESHOLD && 
            currentTime - lastDizzyMessageRef.current > COOLDOWN_PERIOD) {
          // Send dizzy message
          sendBotMessage({
            body: "Penitent One, the spinning... please...",
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
      modelRef.current.rotation.y = Math.sin(clockRef.current.getElapsedTime() * 0.5) * 0.5;
    }
  });
  
  return (
    <>
      <primitive ref={modelRef} object={scene} scale={2.5} />
      
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

function AbsolveModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-yellow-700 rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
        <div className="almendra-font text-lg text-yellow-200 mb-4">
          For these and all my sins, I am truly sorry
        </div>
        <div className="flex justify-center gap-4">
          <button
            className="almendra-font px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
            onClick={onCancel}
          >
            Keep Praying
          </button>
          <button
            className="almendra-font px-4 py-2 rounded bg-yellow-700 text-white hover:bg-yellow-800"
            onClick={onConfirm}
          >
            Amen
          </button>
        </div>
      </div>
    </div>
  );
}

function ChatRoom() {
  // Get or create user ID
  const userId = useMemo(() => getUserId(), []);
  
  // Get messages with userId
  const messages = useQuery(api.messages.list, { userId }) || [];
  
  // Mutations
  const sendMessage = useMutation(api.messages.send);
  const clearMessages = useMutation(api.messages.clear);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputRef>(null);
  const [isBurning, setIsBurning] = useState(false);
  const [showAbsolveModal, setShowAbsolveModal] = useState(false);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleClear = () => {
    setShowAbsolveModal(true);
  };

  const handleConfirmAbsolve = () => {
    setShowAbsolveModal(false);
    setIsBurning(true);
    setTimeout(() => {
      clearMessages({ userId });
      setIsBurning(false);
    }, 1500); // Match the duration of the burning animation
  };

  const handleCancelAbsolve = () => {
    setShowAbsolveModal(false);
  };

  // Handle sending messages
  const handleSendMessage = async (body: string) => {
    await sendMessage({
      body,
      author: "the Penitent",
      userId,
    });
  };
  
  // Handle selecting a confession from the dropdown
  const handleSelectConfession = (confession: string) => {
    if (chatInputRef.current) {
      chatInputRef.current.setValue(confession);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <AbsolveModal
        open={showAbsolveModal}
        onConfirm={handleConfirmAbsolve}
        onCancel={handleCancelAbsolve}
      />
      {/* Header */}
      <header className="w-full py-4 px-2 text-center sticky top-0 z-30 bg-gray-900/95">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-4xl latin-header animated-gold-glow break-words">
          HIS HOLINESS WILL SEE YOU NOW
        </h1>
      </header>
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-2 sm:px-6 md:px-12 lg:px-24 xl:px-32 py-4 md:py-10">
        <div className="w-full max-w-5xl flex flex-col md:flex-row md:gap-12 gap-6 items-center md:items-stretch">
          {/* 3D Model */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center md:justify-start md:pt-6">
            <div className="w-full h-80 xs:h-88 sm:h-96 md:h-[28rem] lg:h-[32rem] relative">
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Suspense fallback={<ModelLoader />}>
                  <ModelErrorBoundary>
                    <Model />
                  </ModelErrorBoundary>
                </Suspense>
              </Canvas>
              <div className="text-center -mt-8 relative z-10">
                <h2 className="text-lg xs:text-xl sm:text-2xl almendra-font text-indigo-300">🕊️Pope Francis🕊️</h2>
              </div>
            </div>
          </div>
          {/* Chat Section */}
          <div className="w-full md:w-1/2 flex flex-col flex-1 min-h-0">
            <div className="flex flex-col flex-1 min-h-0">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-2 p-2 xs:p-3 sm:p-4 rounded chat-card border min-h-[120px] max-h-[40vh] xs:max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] lg:max-h-[80vh] xl:max-h-[90vh] md:min-h-[28rem] lg:min-h-[32rem] relative"
                style={{ minHeight: 120 }}
              >
                {/* 3D Fire effect overlays */}
                {isBurning && <FireOverlay3D />}
                {/* Overlay message during burning */}
                {isBurning && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                    style={{
                      animation: "fadeInOut 1.5s linear",
                    }}
                  >
                    <span
                      className="almendra-font text-3xl sm:text-4xl md:text-5xl text-yellow-200 drop-shadow-lg font-bold select-none text-center w-full"
                      style={{
                        textShadow:
                          "0 0 20px #ffd700, 0 0 40px #ffd700, 0 0 60px #ffd700, 0 0 80px #ffd700",
                        letterSpacing: "0.05em",
                        display: "block",
                        whiteSpace: "pre-line",
                      }}
                    >
                      THANKS BE TO GOD
                    </span>
                  </div>
                )}
                {messages.length === 0 ? (
                  <div className="text-gray-500 text-center almendra-font">
                    OFFER YOUR BURDENS UNTO GOD
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message._id} className={`message-burning${isBurning ? ' is-burning' : ''}`}>
                      <ChatMessage
                        author={message.author}
                        body={message.body}
                        time={message._creationTime}
                      />
                    </div>
                  ))
                )}
              </div>
              {/* Input Field */}
              <div className="w-full mb-2">
                <ChatInput ref={chatInputRef} onSubmit={handleSendMessage} />
              </div>
              
              {/* Buttons */}
              <div className="flex justify-center gap-4 w-full pb-2 xs:pb-3 sm:pb-4">
                <button
                  onClick={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }))}
                  className="almendra-font px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800"
                  disabled={isBurning}
                >
                  CONFESS
                </button>
                <ConfessionDropdown onSelect={handleSelectConfession} disabled={isBurning} />
                <button
                  onClick={handleClear}
                  className="almendra-font px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={isBurning}
                >
                  ABSOLVE
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return <ChatRoom />;
}
