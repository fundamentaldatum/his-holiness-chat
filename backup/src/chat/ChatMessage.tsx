import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ChatMessageProps } from "../../utils/types";
import { TYPING_SPEED, TYPING_INITIAL_DELAY } from "../../utils/constants";

/**
 * Component to display a chat message with typing animation for Pope Francis
 * @param author - Author of the message
 * @param body - Content of the message
 * @param time - Timestamp of the message
 * @returns Chat message component
 */
export function ChatMessage({ author, body, time }: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (author === "Pope Francis") {
      setIsTyping(true);
      setDisplayedText(""); // Reset the displayed text
      
      // Add a small initial delay before starting the animation
      const startDelay = setTimeout(() => {
        let index = 0;
        const intervalId = setInterval(() => {
          if (index < body.length) {
            setDisplayedText(body.substring(0, index + 1));
            index++;
          } else {
            setIsTyping(false);
            clearInterval(intervalId);
          }
        }, TYPING_SPEED);

        return () => {
          clearInterval(intervalId);
        };
      }, TYPING_INITIAL_DELAY);

      return () => {
        clearTimeout(startDelay);
      };
    } else {
      setDisplayedText(body);
      setIsTyping(false);
    }
  }, [body, author]);

  return (
    <div className="mb-4 sm:mb-5 px-1 py-1 rounded hover:bg-black/20 transition-colors duration-200">
      <div className="flex items-baseline gap-2">
        <span className={`font-bold text-sm xs:text-base ${author === "the Penitent" ? "text-yellow-200" : "almendra-font text-indigo-300"}`}>
          {author}
        </span>
        <span className="text-[10px] xs:text-xs text-gray-500">
          {format(time, "h:mm a")}
        </span>
      </div>
      <div 
        className="mt-1 text-gray-100 text-sm xs:text-base break-words"
        style={{ 
          wordWrap: 'break-word', 
          overflowWrap: 'break-word',
          touchAction: 'pan-y',
          WebkitTouchCallout: 'none'
        }}
      >
        {author === "Pope Francis" ? (
          <>
            {displayedText}
            {isTyping && <span className="animate-pulse">▋</span>}
          </>
        ) : (
          body
        )}
      </div>
    </div>
  );
}
