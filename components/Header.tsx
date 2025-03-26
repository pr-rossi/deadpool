import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';

interface HeaderProps {
    title: string;
    onLogout: () => void;
    userEmail?: string;
    userName?: string;
}

const Header: React.FC<HeaderProps> = ({ title, onLogout, userEmail, userName }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="header">
            <h1 className="title">{title}</h1>
            <div className="profile-container" ref={dropdownRef}>
                <button 
                    className="profile-button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <FontAwesomeIcon icon={faUser} />
                </button>
                <div className={`profile-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                    <div className="dropdown-name">{userName}</div>
                    <div className="dropdown-email">{userEmail}</div>
                    <button className="dropdown-item" onClick={onLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header; 