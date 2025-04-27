import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ModelContainer } from "./components/model/ModelComponents";
import { ChatContainer } from "./components/chat/ChatContainer";
import { InputSection } from "./components/chat/InputSection";
import { AbsolveModal } from "./components/modals/AbsolveModal";
import { AppProvider } from "./contexts/AppProvider";
import { useUser } from "./contexts/UserContext";
import { BURNING_ANIMATION_DURATION, WELCOME_MESSAGE } from "./utils/constants";

/**
 * Main chat room component
 * @returns Chat room component
 */
function ChatRoom() {
  // Get user identity from context
  const { userId, isNewUser, welcomeShown, markWelcomeAsShown } = useUser();
  
  // Get messages with userId
  const messages = useQuery(api.messages.list, { userId }) || [];
  const messagesLoaded = useRef(false);
  const welcomeAttempted = useRef(false);
  
  // Mutations
  const sendMessage = useMutation(api.messages.send);
  const clearMessages = useMutation(api.messages.clear);
  const sendBotMessage = useMutation(api.messages.sendBotMessage);
  
  // UI state
  const [isBurning, setIsBurning] = useState(false);
  const [showAbsolveModal, setShowAbsolveModal] = useState(false);

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
          body: WELCOME_MESSAGE,
          userId: userId
        });
        
        // Mark welcome as shown to prevent showing it again
        markWelcomeAsShown();
      }
    }
  }, [welcomeShown, messages, sendBotMessage, userId, markWelcomeAsShown]);

  // Handle clearing messages
  const handleClear = () => {
    setShowAbsolveModal(true);
  };

  // Handle confirming absolution
  const handleConfirmAbsolve = () => {
    setShowAbsolveModal(false);
    setIsBurning(true);
    setTimeout(() => {
      clearMessages({ userId: userId });
      // Reset welcome attempted flag so welcome message can be sent again if needed
      // but only for truly new users (welcomeShown flag in localStorage remains)
      welcomeAttempted.current = false;
      setIsBurning(false);
    }, BURNING_ANIMATION_DURATION);
  };

  // Handle canceling absolution
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <AbsolveModal
        open={showAbsolveModal}
        onConfirm={handleConfirmAbsolve}
        onCancel={handleCancelAbsolve}
      />
      
      {/* Header - Fixed position for mobile */}
      <header className="w-full py-2 xs:py-4 px-2 text-center fixed-header">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-4xl latin-header animated-gold-glow break-words">
          HIS HOLINESS WILL SEE YOU NOW
        </h1>
      </header>
      
      {/* Main Content Area - With padding to account for fixed header */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-1 sm:px-4 md:px-8 lg:px-16 xl:px-24 py-2 sm:py-4 main-content">
        <div className="w-full max-w-5xl flex flex-row gap-1 xs:gap-3 sm:gap-6 md:gap-8 lg:gap-12 items-stretch">
          {/* 3D Model */}
          <div className="w-[45%] sm:w-[48%] md:w-1/2 flex flex-col items-center justify-start pt-0 sm:pt-4 md:pt-6">
            <ModelContainer />
          </div>
          
          {/* Chat Section */}
          <div className="w-[55%] sm:w-[52%] md:w-1/2 flex flex-col">
            <div className="flex flex-col relative">
              {/* Chat Messages Container */}
              <ChatContainer 
                messages={messages} 
                isBurning={isBurning} 
              />
              
              {/* Input and Buttons */}
              <InputSection 
                onSubmit={handleSendMessage} 
                onClear={handleClear} 
                disabled={isBurning} 
              />
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

/**
 * Main application component
 * @returns Application component
 */
export default function App() {
  return (
    <AppProvider>
      <ChatRoom />
    </AppProvider>
  );
}
