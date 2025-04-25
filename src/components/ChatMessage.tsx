import { format } from "date-fns";
import React, { useState, useEffect } from "react";

interface ChatMessageProps {
  author: string;
  body: string;
  time: number;
}

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
        }, 20);

        return () => {
          clearInterval(intervalId);
        };
      }, 50); // 50ms delay before starting

      return () => {
        clearTimeout(startDelay);
      };
    } else {
      setDisplayedText(body);
      setIsTyping(false);
    }
  }, [body, author]);

  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2">
        <span className={`font-bold ${author === "the Penitent" ? "text-yellow-200" : "almendra-font text-indigo-300"}`}>
          {author}
        </span>
        <span className="text-xs text-gray-500">
          {format(time, "h:mm a")}
        </span>
      </div>
      <div className="mt-1 text-gray-100">
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
