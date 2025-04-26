import { useState, useRef, useEffect } from "react";

interface ConfessionDropdownProps {
  onSelect: (confession: string) => void;
  disabled: boolean;
  type?: 'venial' | 'mortal';
}

export function ConfessionDropdown({ onSelect, disabled, type = 'venial' }: ConfessionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropDirection, setDropDirection] = useState<'down' | 'up'>('down');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // List of venial sins
  const venialSins = [
    "I got a tattoo",
    "I was on my phone during Mass",
    "I got married in a Protestant chapel",
    "I got $150 in free Bonus Bets on Fan Duel",
    "I missed church to attend your funeral",
    "I parented my children too strictly",
    "I did not parent my children strictly enough",
    "I grabbed my dog by its hind legs and pushed it around like a vacuum cleaner",
    "I never got to say \"I love you\""
  ];

  // List of mortal sins
  const mortalSins = [
    "I actively harbor resentment toward the elderly",
    "I defrauded my local parish through a highly-complicated embezzlement scheme for my own personal enrichment",
    "I observed the Sabbath day on a Wednesday",
    "I used my $150 in free Bonus Bets on Fan Duel to participate in rigging the World Series",
    "I lied to the Pope about how I used my $150 in free bonus bets on Fan Duel",
    "I got baptized at 4 different churches and 2 different county jails",
    "I convinced my friend that there is a book in the Bible called \"Mitchell\"",
    "I defrauded my local parish through a highly-complicated embezzlement scheme for my own personal enrichment again"
  ];

  // Select the appropriate list based on type
  const confessions = type === 'venial' ? venialSins : mortalSins;

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

  // Determine dropdown direction based on available space
  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      
      // If there's not enough space below, position the dropdown above the button
      if (spaceBelow < menuHeight && buttonRect.top > menuHeight) {
        setDropDirection('up');
      } else {
        setDropDirection('down');
      }
    }
  }, [isOpen]);

  const handleSelect = (confession: string) => {
    onSelect(confession);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className={`almendra-font px-4 py-2 ${type === 'venial' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-700 hover:bg-red-800'} text-white rounded`}
        disabled={disabled}
      >
        {type === 'venial' ? 'VENIAL SINS' : 'MORTAL SINS'}
      </button>
      
      {isOpen && (
        <div 
          ref={menuRef}
          className={`absolute z-50 w-64 bg-gray-800 border border-yellow-700 rounded-md shadow-lg overflow-hidden ${
            dropDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="max-h-60 overflow-y-auto">
            {confessions.map((confession, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-2 text-white almendra-font hover:bg-gray-700 focus:outline-none"
                onClick={() => handleSelect(confession)}
              >
                {confession}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
