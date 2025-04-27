import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ConfessionDropdownProps } from "../../utils/types";
import { useConfession } from "../../hooks/useConfession";
import { useViewportContext } from "../../contexts/ViewportContext";
import { VENIAL_SINS, MORTAL_SINS } from "../../utils/constants";

/**
 * Dropdown component for selecting pre-defined confessions
 * @param onSelect - Function to call when a confession is selected
 * @param onSubmit - Optional function to call to automatically submit the confession
 * @param disabled - Whether the dropdown is disabled
 * @param type - Type of confessions to display (venial or mortal)
 * @param mobile - Whether to use mobile layout
 * @returns Confession dropdown component
 */
export function ConfessionDropdown({ 
  onSelect, 
  onSubmit,
  disabled, 
  type = 'venial', 
  mobile = false 
}: ConfessionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropDirection, setDropDirection] = useState<'down' | 'up'>('down');
  const [horizontalPosition, setHorizontalPosition] = useState<'left' | 'right' | 'center'>('right');
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number; width: number; height: number }>({ top: 0, left: 0, width: 0, height: 0 });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Use the confession hook with a null inputRef since we're not directly connected to an input
  const { selectConfession } = useConfession({ inputRef: { current: null } });
  
  // Get viewport information from context
  const viewport = useViewportContext();

  // Select the appropriate list based on type
  const confessions = type === 'venial' ? VENIAL_SINS : MORTAL_SINS;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update button position when dropdown is opened
  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  }, [isOpen]);

  // Determine dropdown direction and horizontal position based on available space
  // Only used for non-mobile view
  useEffect(() => {
    if (!mobile && isOpen && buttonRef.current && menuRef.current) {
      // Vertical positioning
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const menuWidth = 250; // Approximate width based on CSS classes
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      
      // If there's not enough space below, position the dropdown above the button
      if (spaceBelow < menuHeight && buttonRect.top > menuHeight) {
        setDropDirection('up');
      } else {
        setDropDirection('down');
      }
      
      // Horizontal positioning
      const buttonCenterX = buttonRect.left + (buttonRect.width / 2);
      const spaceToRight = viewportWidth - buttonRect.right;
      const spaceToLeft = buttonRect.left;
      
      // If menu would extend beyond right edge
      if (spaceToRight < menuWidth / 2) {
        setHorizontalPosition('right');
      } 
      // If menu would extend beyond left edge
      else if (spaceToLeft < menuWidth / 2) {
        setHorizontalPosition('left');
      } 
      // Center the menu if there's enough space on both sides
      else {
        setHorizontalPosition('center');
      }
    }
  }, [isOpen, mobile]);

  const handleSelect = (confession: string) => {
    // Call the selectConfession function from the hook
    selectConfession(confession);
    
    // Call the onSelect prop for backward compatibility
    onSelect(confession);
    
    // If onSubmit is provided, call it to automatically submit the confession
    if (onSubmit) {
      onSubmit(confession);
    }
    
    // Close the dropdown
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Render the dropdown menu
  const renderDropdownMenu = () => {
    // For mobile, render an inline dropdown that appears below the button
    if (mobile) {
      return (
        <div 
          className="fixed inset-x-0 bottom-0 z-[1000] bg-gray-800 border-t border-yellow-700 rounded-t-md shadow-lg overflow-hidden"
          style={{ maxHeight: '40vh' }}
        >
          <div className="sticky top-0 bg-gray-900 p-2 border-b border-yellow-700 flex justify-between items-center">
            <span className="text-white almendra-font">
              {type === 'venial' ? 'VENIAL SINS' : 'MORTAL SINS'}
            </span>
            <button 
              className="text-white p-1"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(40vh - 40px)' }}>
            {confessions.map((confession, index) => (
              <button
                key={index}
                className="w-full text-left px-3 py-3 text-sm text-white almendra-font hover:bg-gray-700 focus:outline-none border-b border-gray-700"
                onClick={() => handleSelect(confession)}
              >
                {confession}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    // For desktop, render the dropdown as before
    return (
      <div 
        ref={menuRef}
        className={`absolute z-50 w-[250px] xs:w-64 bg-gray-800 border border-yellow-700 rounded-md shadow-lg overflow-hidden ${
          dropDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
        } ${
          horizontalPosition === 'left' ? 'left-0' : 
          horizontalPosition === 'right' ? 'right-0' : 
          'left-1/2 -translate-x-1/2'
        }`}
      >
        <div className="max-h-60 overflow-y-auto">
          {confessions.map((confession, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 text-sm xs:text-base text-white almendra-font hover:bg-gray-700 focus:outline-none"
              onClick={() => handleSelect(confession)}
            >
              {confession}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className={`almendra-font ${mobile ? 'text-xs whitespace-nowrap px-2 py-2 flex-1 mx-1 text-center' : 'text-sm xs:text-base px-3 xs:px-4 py-2 w-32 text-center'} ${type === 'venial' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-700 hover:bg-red-800'} text-white rounded`}
        disabled={disabled}
      >
        {type === 'venial' ? 'VENIAL SINS' : 'MORTAL SINS'}
      </button>
      
      {isOpen && renderDropdownMenu()}
    </div>
  );
}
