import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import '../styles/ProfileHeader.css';

interface ProfileHeaderProps {
    userEmail: string;
    userName: string;
    onLogout: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    userEmail,
    userName,
    onLogout
}) => {
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
        <div className="profile-header" ref={dropdownRef}>
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
    );
};

export default ProfileHeader; 