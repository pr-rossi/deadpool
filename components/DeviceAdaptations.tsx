import React, { useEffect, useState } from 'react';
import '../styles/DeviceAdaptations.css';

interface DeviceInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  isStandalone: boolean;
  screenHeight: number;
  screenWidth: number;
}

const useDeviceInfo = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isAndroid: false,
    isMobile: false,
    hasNotch: false,
    hasDynamicIsland: false,
    isStandalone: false,
    screenHeight: 0,
    screenWidth: 0
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isMobile = /Mobi|Android/i.test(userAgent);
    
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    // Detect notch/dynamic island based on screen dimensions and safe areas
    const hasNotch = CSS.supports('padding-top: env(safe-area-inset-top)') &&
                     window.screen.height >= 812; // iPhone X and newer

    // Detect Dynamic Island (iPhone 14 Pro and newer)
    const hasDynamicIsland = isIOS && 
                            window.screen.height >= 932 && 
                            window.devicePixelRatio >= 3;

    setDeviceInfo({
      isIOS,
      isAndroid,
      isMobile,
      hasNotch,
      hasDynamicIsland,
      isStandalone,
      screenHeight: window.screen.height,
      screenWidth: window.screen.width
    });
  }, []);

  return deviceInfo;
};

interface DeviceAdaptationProps {
  children: React.ReactNode;
}

const DeviceAdaptation: React.FC<DeviceAdaptationProps> = ({ children }) => {
  const deviceInfo = useDeviceInfo();

  useEffect(() => {
    // Apply device-specific classes to body
    const classes = [];
    
    if (deviceInfo.isIOS) classes.push('ios-device');
    if (deviceInfo.isAndroid) classes.push('android-device');
    if (deviceInfo.isMobile) classes.push('mobile-device');
    if (deviceInfo.hasNotch) classes.push('has-notch');
    if (deviceInfo.hasDynamicIsland) classes.push('has-dynamic-island');
    if (deviceInfo.isStandalone) classes.push('standalone-app');

    document.body.className = classes.join(' ');

    return () => {
      document.body.className = '';
    };
  }, [deviceInfo]);

  return (
    <div className="device-adaptation">
      {deviceInfo.hasDynamicIsland && <DynamicIslandSpace />}
      {children}
    </div>
  );
};

// Dynamic Island spacer component
const DynamicIslandSpace: React.FC = () => (
  <div className="dynamic-island-space" />
);

// Status bar component for PWA
interface StatusBarProps {
  style?: 'default' | 'light' | 'dark';
  backgroundColor?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  style = 'default', 
  backgroundColor = 'transparent' 
}) => {
  const deviceInfo = useDeviceInfo();

  if (!deviceInfo.isStandalone) return null;

  return (
    <div 
      className={`status-bar ${style}`}
      style={{ backgroundColor }}
    >
      <div className="status-bar-content">
        <div className="status-time">
          {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })}
        </div>
        <div className="status-indicators">
          <div className="signal-indicator">
            <div className="signal-bar"></div>
            <div className="signal-bar"></div>
            <div className="signal-bar"></div>
            <div className="signal-bar"></div>
          </div>
          <div className="wifi-indicator">📶</div>
          <div className="battery-indicator">
            <div className="battery-level"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Safe area wrapper
interface SafeAreaProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export const SafeArea: React.FC<SafeAreaProps> = ({ 
  children, 
  edges = ['top', 'bottom', 'left', 'right'] 
}) => {
  const safeAreaClasses = edges.map(edge => `safe-${edge}`).join(' ');
  
  return (
    <div className={`safe-area ${safeAreaClasses}`}>
      {children}
    </div>
  );
};

// Home indicator for iPhone X and newer
export const HomeIndicator: React.FC = () => {
  const deviceInfo = useDeviceInfo();
  
  if (!deviceInfo.isIOS || !deviceInfo.hasNotch) return null;

  return <div className="home-indicator" />;
};

export { useDeviceInfo };
export default DeviceAdaptation;