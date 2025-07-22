import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCalendarWeek, faUser, faDumbbell } from '@fortawesome/free-solid-svg-icons';
import '../styles/TabBar.css';

interface TabBarProps {
  activeTab: 'home' | 'weeks' | 'workout' | 'profile';
  onTabChange: (tab: 'home' | 'weeks' | 'workout' | 'profile') => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as const, icon: faHome, label: 'Home' },
    { id: 'weeks' as const, icon: faCalendarWeek, label: 'Weeks' },
    { id: 'workout' as const, icon: faDumbbell, label: 'Workout' },
    { id: 'profile' as const, icon: faUser, label: 'Profile' }
  ];

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
          aria-label={tab.label}
        >
          <FontAwesomeIcon icon={tab.icon} className="tab-icon" />
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabBar;