import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import '../styles/DropdownMenu.css';

interface DropdownMenuProps {
    items: {
        label: string;
        icon?: any;
        onClick: () => void;
        className?: string;
    }[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="dropdown-container" ref={dropdownRef}>
            <button className="more-button" onClick={toggleDropdown}>
                <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
            {isOpen && (
                <div className="dropdown-menu">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            className={`dropdown-item ${item.className || ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                item.onClick();
                                setIsOpen(false);
                            }}
                        >
                            {item.icon && <FontAwesomeIcon icon={item.icon} />}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu; 