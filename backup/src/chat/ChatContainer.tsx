import React, { useRef } from 'react';
import { useScrolling } from '../../hooks/useScrolling';
import { ChatMessage } from './ChatMessage';
import { FireOverlay3D } from '../effects/FireOverlay3D';
import { ChatMessage as ChatMessageType } from '../../utils/types';
import { BURNING_ANIMATION_DURATION } from '../../utils/constants';

interface ChatContainerProps {
  messages: ChatMessageType[];
  isBurning: boolean;
}

/**
 * Container component for chat messages with scrolling functionality
 * @param messages - Array of chat messages to display
 * @param isBurning - Whether the burning animation is active
 * @returns Chat container component
 */
export function ChatContainer({ messages, isBurning }: ChatContainerProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { isScrolledUp, shouldAutoScroll, scrollToBottom } = useScrolling(chatContainerRef);

  return (
    <div
      ref={chatContainerRef}
      className="overflow-y-scroll p-1 xs:p-3 sm:p-4 rounded chat-card border 
        min-h-[40vh] xs:min-h-[45vh] sm:min-h-[50vh] md:min-h-[55vh] lg:min-h-[60vh]
        h-[40vh] xs:h-[45vh] sm:h-[50vh] md:h-[55vh] lg:h-[60vh]
        max-h-[40vh] xs:max-h-[45vh] sm:max-h-[50vh] md:max-h-[55vh] lg:max-h-[60vh]
        relative pb-4 chat-container-with-padding"
      style={{ 
        touchAction: 'pan-y', 
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        pointerEvents: 'auto'
      }}
      tabIndex={0}
    >
      {/* 3D Fire effect overlays */}
      {isBurning && <FireOverlay3D />}
      
      {/* Overlay message during burning */}
      {isBurning && (
        <div
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          style={{
            animation: `fadeInOut ${BURNING_ANIMATION_DURATION}ms linear`,
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
  );
}
