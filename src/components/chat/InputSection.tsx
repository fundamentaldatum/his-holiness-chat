import React, { useRef } from 'react';
import { ChatInput } from './ChatInput';
import { ChatInputRef } from '../../utils/types';
import { ConfessionDropdown } from './ConfessionDropdown';
import { useViewportContext } from '../../contexts/ViewportContext';

interface InputSectionProps {
  onSubmit: (body: string) => Promise<void>;
  onClear: () => void;
  disabled: boolean;
}

/**
 * Component for the input section of the chat interface
 * @param onSubmit - Function to call when a message is submitted
 * @param onClear - Function to call when the clear button is clicked
 * @param disabled - Whether the input section is disabled
 * @returns Input section component
 */
export function InputSection({ onSubmit, onClear, disabled }: InputSectionProps) {
  const chatInputRef = useRef<ChatInputRef>(null);
  const { isMobile } = useViewportContext();
  
  // Handle confession selection
  const handleSelectConfession = (confession: string) => {
    console.log("Confession selected:", confession);
    
    if (chatInputRef.current) {
      chatInputRef.current.setValue(confession);
    }
  };
  
  // Handle submit button click
  const handleSubmitClick = () => {
    if (chatInputRef.current) {
      chatInputRef.current.submitForm().catch((error: Error) => {
        console.error("Error submitting form:", error);
      });
    }
  };
  
  // Render desktop layout
  const renderDesktopLayout = () => (
    <>
      {/* Input Field */}
      <div className="w-full pt-2 px-2">
        <ChatInput ref={chatInputRef} onSubmit={onSubmit} />
      </div>
      
      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 w-full py-2 xs:py-3">
        <button
          onClick={handleSubmitClick}
          className="almendra-font text-sm xs:text-base px-3 xs:px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 w-32 text-center"
          disabled={disabled}
        >
          CONFESS
        </button>
        <ConfessionDropdown onSelect={handleSelectConfession} disabled={disabled} type="venial" />
        <ConfessionDropdown onSelect={handleSelectConfession} disabled={disabled} type="mortal" />
        <button
          onClick={onClear}
          className="almendra-font text-sm xs:text-base px-3 xs:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-32 text-center"
          disabled={disabled}
        >
          ABSOLVE
        </button>
      </div>
    </>
  );
  
  // Render mobile layout
  const renderMobileLayout = () => (
    <>
      {/* Input Field - Full Width */}
      <div className="w-full px-3 pt-2 pb-1" id="mobile-input-container">
        <ChatInput ref={chatInputRef} onSubmit={onSubmit} />
      </div>
      
      {/* Buttons - Single Row with reduced height */}
      <div className="flex justify-between px-3 py-2 overflow-x-auto no-scrollbar">
        <button
          onClick={handleSubmitClick}
          className="almendra-font text-xs whitespace-nowrap px-2 py-1 bg-indigo-700 text-white rounded hover:bg-indigo-800 flex-1 mx-1 text-center"
          disabled={disabled}
        >
          CONFESS
        </button>
        <ConfessionDropdown 
          onSelect={handleSelectConfession} 
          disabled={disabled} 
          type="venial" 
          mobile={true} 
        />
        <ConfessionDropdown 
          onSelect={handleSelectConfession} 
          disabled={disabled} 
          type="mortal" 
          mobile={true} 
        />
        <button
          onClick={onClear}
          className="almendra-font text-xs whitespace-nowrap px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex-1 mx-1 text-center"
          disabled={disabled}
        >
          ABSOLVE
        </button>
      </div>
    </>
  );
  
  // Render desktop or mobile layout based on viewport
  if (isMobile) {
    return (
      <div className="w-full sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 border-t border-gray-800 pb-safe">
        {renderMobileLayout()}
      </div>
    );
  } else {
    return (
      <div className="static z-40 bg-gray-900/95 border-0 shadow-none hidden sm:block">
        <div className="container mx-auto px-0 max-w-5xl">
          <div className="w-full ml-auto">
            {renderDesktopLayout()}
          </div>
        </div>
      </div>
    );
  }
}
