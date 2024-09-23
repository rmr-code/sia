import { useState, useRef, useEffect, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { HiMenu } from 'react-icons/hi';
import logo from '../assets/logo.png';

interface Option {
  label: string; // Each option has a label property
}

interface HeaderWithMenuProps {
  options: Option[]; // An array of options to be displayed in the menu
  onMenuClick: (index: number) => void; // Function to handle menu click, receiving the index
}

const HeaderWithMenu: React.FC<HeaderWithMenuProps> = ({
  options,
  onMenuClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false); // State to toggle the dropdown menu
  const menuRef = useRef<HTMLDivElement>(null); // Reference to the menu element

  // Handle clicks outside of the dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | Event) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false); // Close the dropdown if clicked outside
      }
    };

    // Add event listener for clicks
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const menuClick = (index: number) => {
    setMenuOpen(false);
    onMenuClick(index); // Trigger the menu click handler
  };

  return (
    <header className="bg-gray-50 text-blue-600 p-4">
      <div className="container max-w-4xl mx-auto flex justify-between items-center">
        <img src={logo} alt="Logo" width={48} height={48} />

        {/* Menu Icon */}
        <div className="relative" ref={menuRef}>
          <button
            className="text-gray-800 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <HiMenu className="w-6 h-6 cursor-pointer" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 min-w-48 bg-white rounded-lg shadow-lg">
              <nav className="space-y-2">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="cursor-pointer block px-4 py-2 font-normal text-md text-blue-700 hover:bg-gray-100 whitespace-nowrap"
                    onClick={() => menuClick(index)}
                  >
                    {option.label}
                  </div>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderWithMenu;
