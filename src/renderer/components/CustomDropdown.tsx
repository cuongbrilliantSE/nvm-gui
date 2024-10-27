import React, { useState, useEffect, useRef } from 'react';

interface Props {
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

export default function CustomDropdown({ totalPages, currentPage, handlePageChange }: Props) {
  const [isOpen, setIsOpen] = useState(false); // For toggling dropdown visibility
  const [selectedValue, setSelectedValue] = useState(currentPage);
  const dropdownRef = useRef<HTMLDivElement>(null); // Reference to the dropdown container
  const selectedItemRef = useRef<HTMLLIElement>(null); // Reference to the selected list item

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (page: number) => {
    setSelectedValue(page);
    handlePageChange(page);
    setIsOpen(false); // Hide the dropdown after selection
  };

  // Scroll the selected item into view when the dropdown opens
  useEffect(() => {
    if (isOpen && selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isOpen]);

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        type="button"
        className="px-2 py-1 border border-gray-300 rounded bg-white flex items-center justify-between w-full"
        onClick={toggleDropdown}
      >
        <span>Page {selectedValue}</span>
        {/* Arrow Icon */}
        <span className="ml-2">
          {isOpen ? (
            // Arrow up when open
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            // Arrow down when closed
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </span>
      </button>

      {/* Dropdown menu, hidden via CSS when closed */}
      <ul
        className={`absolute left-0 w-full mb-1 bg-white border border-gray-300 rounded shadow-lg max-h-52 overflow-y-auto transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ bottom: '100%' }} // Position the dropdown above the button
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <li
            key={i + 1}
            ref={selectedValue === i + 1 ? selectedItemRef : null} // Reference the selected item
            className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
              selectedValue === i + 1 ? 'bg-gray-300' : ''
            }`}
            onClick={() => handleSelect(i + 1)}
          >
            {i + 1}
          </li>
        ))}
      </ul>
    </div>
  );
}
