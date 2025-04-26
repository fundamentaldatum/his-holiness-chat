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

// Function to get or create a unique user ID and check if it's a new user
function getUserId(): { userId: string; isNewUser: boolean; welcomeShown: boolean } {
  let userId = localStorage.getItem('popeUserId');
  let isNewUser = false;
  let welcomeShown = localStorage.getItem('popeWelcomeShown') === 'true';
  
  if (!userId) {
    userId = crypto.randomUUID(); // Generate a UUID
    localStorage.setItem('popeUserId', userId);
    isNewUser = true;
    welcomeShown = false;
  }
  
  return { userId, isNewUser, welcomeShown };
}

// Function to mark welcome message as shown
function markWelcomeAsShown(): void {
  localStorage.setItem('popeWelcomeShown', 'true');
}

// Function to clear welcome message flag
function clearWelcomeFlag(): void {
  localStorage.removeItem('popeWelcomeShown');
}

// Preload the model
useGLTF.preload('/pope_francis.glb');

// Loading component to show while the model is loading
function ModelLoader() {
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="mb-2 almendra-font">memento mori</div>
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
  const { userId, isNewUser, welcomeShown } = useMemo(() => getUserId(), []);
  
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
  // Get or create user ID and check if it's a new user
  const { userId, isNewUser, welcomeShown } = useMemo(() => getUserId(), []);
  
  // Get messages with userId
  const messages = useQuery(api.messages.list, { userId }) || [];
  const messagesLoaded = useRef(false);
  const welcomeAttempted = useRef(false);
  
  // Mutations
  const sendMessage = useMutation(api.messages.send);
  const clearMessages = useMutation(api.messages.clear);
  const sendBotMessage = useMutation(api.messages.sendBotMessage);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputRef>(null);
  const [isBurning, setIsBurning] = useState(false);
  const [showAbsolveModal, setShowAbsolveModal] = useState(false);
  const [isScrolledUp, setIsScrolledUp] = useState(false);

  // Track when messages are loaded
  useEffect(() => {
    if (messages !== undefined) {
      messagesLoaded.current = true;
    }
  }, [messages]);

  // Send welcome message for new users
  useEffect(() => {
    // Only proceed if messages have loaded and we haven't attempted to send welcome message yet
    if (messagesLoaded.current && !welcomeAttempted.current) {
      welcomeAttempted.current = true;
      
      // Check if we should send welcome message (new user or returning user who hasn't seen welcome)
      if (!welcomeShown && messages.length === 0) {
        sendBotMessage({
          body: "Welcome, Penitent One, how many weeks has it been since your last confession?",
          userId: userId
        });
        
        // Mark welcome as shown to prevent showing it again
        markWelcomeAsShown();
      }
    }
  }, [welcomeShown, messages, sendBotMessage, userId]);

  // Detect scroll position to show/hide scroll-to-bottom button
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;
    
    const handleScroll = () => {
      // Show button when scrolled up more than 100px from bottom
      const isScrolled = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight > 100;
      setIsScrolledUp(isScrolled);
    };
    
    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setIsScrolledUp(false);
    }
  }, []);
  
  // Scroll to bottom when messages change or after a short delay (for mobile keyboard)
  useEffect(() => {
    if (chatContainerRef.current) {
      // Immediate scroll
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      
      // Additional scroll after a short delay (helps with mobile keyboard appearance)
      const scrollTimeout = setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [messages]);

  const handleClear = () => {
    setShowAbsolveModal(true);
  };

  const handleConfirmAbsolve = () => {
    setShowAbsolveModal(false);
    setIsBurning(true);
    setTimeout(() => {
      clearMessages({ userId: userId });
      // Reset welcome attempted flag so welcome message can be sent again if needed
      // but only for truly new users (welcomeShown flag in localStorage remains)
      welcomeAttempted.current = false;
      setIsBurning(false);
    }, 2500); // Increased duration for better visibility on mobile
  };

  const handleCancelAbsolve = () => {
    setShowAbsolveModal(false);
  };

  // Handle sending messages
  const handleSendMessage = async (body: string) => {
    await sendMessage({
      body,
      author: "the Penitent",
      userId: userId,
    });
    
    // Scroll to bottom after sending a message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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
      <main className="flex-1 flex flex-col items-center justify-center w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-24 py-2 sm:py-4">
        <div className="w-full max-w-5xl flex flex-row gap-2 xs:gap-3 sm:gap-6 md:gap-8 lg:gap-12 items-stretch">
          {/* 3D Model */}
          <div className="w-[45%] sm:w-[48%] md:w-1/2 flex flex-col items-center justify-start pt-2 sm:pt-4 md:pt-6">
            <div className="w-full h-[40vh] xs:h-[45vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh] relative">
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Suspense fallback={<ModelLoader />}>
                  <ModelErrorBoundary>
                    <Model />
                  </ModelErrorBoundary>
                </Suspense>
              </Canvas>
              <div className="text-center -mt-6 sm:-mt-8 relative z-10">
                <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl almendra-font text-indigo-300">🕊️Pope Francis🕊️</h2>
              </div>
            </div>
          </div>
          {/* Chat Section */}
          <div className="w-[55%] sm:w-[52%] md:w-1/2 flex flex-col flex-1 min-h-0">
            <div className="flex flex-col flex-1 min-h-0 relative">
              {/* Chat Messages Container with consistent dimensions for all devices */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-2 xs:p-3 sm:p-4 rounded chat-card border 
                  min-h-[40vh] xs:min-h-[45vh] sm:min-h-[50vh] md:min-h-[55vh] lg:min-h-[60vh]
                  h-[40vh] xs:h-[45vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh]
                  relative pb-4 chat-container-with-padding"
              >
                {/* 3D Fire effect overlays */}
                {isBurning && <FireOverlay3D />}
                {/* Overlay message during burning */}
                {isBurning && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                    style={{
                      animation: "fadeInOut 2.5s linear",
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
                
                {/* Scroll to bottom button */}
                {isScrolledUp && !isBurning && (
                  <button
                    onClick={scrollToBottom}
                    className="fixed bottom-20 sm:bottom-5 right-5 z-40 rounded-full bg-yellow-600 p-2 shadow-lg text-white scroll-to-bottom-button"
                    aria-label="Scroll to bottom"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Input and Buttons - Desktop Layout */}
              <div className="static z-40 bg-gray-900/95 border-0 shadow-none hidden sm:block">
                <div className="container mx-auto px-0 max-w-5xl">
                  <div className="w-full ml-auto">
                    {/* Input Field */}
                    <div className="w-full pt-2 px-2">
                      <ChatInput ref={chatInputRef} onSubmit={handleSendMessage} />
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 w-full py-2 xs:py-3">
                      <button
                        onClick={() => {
                          if (chatInputRef.current) {
                            chatInputRef.current.submitForm().catch(error => {
                              console.error("Error submitting form:", error);
                            });
                          }
                        }}
                        className="almendra-font text-sm xs:text-base px-3 xs:px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800"
                        disabled={isBurning}
                      >
                        CONFESS
                      </button>
                      <ConfessionDropdown onSelect={handleSelectConfession} disabled={isBurning} type="venial" />
                      <ConfessionDropdown onSelect={handleSelectConfession} disabled={isBurning} type="mortal" />
                      <button
                        onClick={handleClear}
                        className="almendra-font text-sm xs:text-base px-3 xs:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        disabled={isBurning}
                      >
                        ABSOLVE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile-specific full-width input and buttons */}
        <div className="w-full sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 border-t border-gray-800 pb-safe">
          {/* Input Field - Full Width */}
          <div className="w-full px-3 pt-3">
            <ChatInput ref={chatInputRef} onSubmit={handleSendMessage} />
          </div>
          
          {/* Buttons - Single Row */}
          <div className="flex justify-between px-3 py-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                if (chatInputRef.current) {
                  chatInputRef.current.submitForm().catch(error => {
                    console.error("Error submitting form:", error);
                  });
                }
              }}
              className="almendra-font text-xs whitespace-nowrap px-2 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 flex-1 mx-1"
              disabled={isBurning}
            >
              CONFESS
            </button>
            <ConfessionDropdown onSelect={handleSelectConfession} disabled={isBurning} type="venial" mobile={true} />
            <ConfessionDropdown onSelect={handleSelectConfession} disabled={isBurning} type="mortal" mobile={true} />
            <button
              onClick={handleClear}
              className="almendra-font text-xs whitespace-nowrap px-2 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex-1 mx-1"
              disabled={isBurning}
            >
              ABSOLVE
            </button>
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
        
        /* Ensure consistent chat container dimensions */
        .chat-container-with-padding {
          position: relative;
          overflow: hidden;
        }
        
        /* Ensure fire effect is properly positioned */
        .chat-card {
          position: relative;
          overflow: hidden;
        }
        
        .is-burning {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return <ChatRoom />;
}
