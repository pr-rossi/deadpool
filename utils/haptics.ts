// Haptic Feedback Utility for Web
// Simulates native haptic feedback patterns using vibration API and visual cues

interface HapticPattern {
  vibration?: number | number[];
  visualFeedback?: boolean;
  audioFeedback?: boolean;
}

export enum HapticType {
  LIGHT = 'light',
  MEDIUM = 'medium',
  HEAVY = 'heavy',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SELECTION = 'selection'
}

const HAPTIC_PATTERNS: Record<HapticType, HapticPattern> = {
  [HapticType.LIGHT]: {
    vibration: 10,
    visualFeedback: true
  },
  [HapticType.MEDIUM]: {
    vibration: 20,
    visualFeedback: true
  },
  [HapticType.HEAVY]: {
    vibration: 40,
    visualFeedback: true
  },
  [HapticType.SUCCESS]: {
    vibration: [10, 50, 10],
    visualFeedback: true
  },
  [HapticType.WARNING]: {
    vibration: [20, 100, 20],
    visualFeedback: true
  },
  [HapticType.ERROR]: {
    vibration: [30, 100, 30, 100, 30],
    visualFeedback: true
  },
  [HapticType.SELECTION]: {
    vibration: 5,
    visualFeedback: false
  }
};

class HapticManager {
  private isEnabled: boolean = true;
  private supportsVibration: boolean = false;

  constructor() {
    this.supportsVibration = 'vibrate' in navigator;
    
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.isEnabled = false;
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isHapticEnabled(): boolean {
    return this.isEnabled && (this.supportsVibration || this.canUseVisualFeedback());
  }

  private canUseVisualFeedback(): boolean {
    return typeof document !== 'undefined';
  }

  public trigger(type: HapticType, element?: HTMLElement): void {
    if (!this.isEnabled) return;

    const pattern = HAPTIC_PATTERNS[type];
    
    // Trigger vibration if supported
    if (this.supportsVibration && pattern.vibration) {
      try {
        navigator.vibrate(pattern.vibration);
      } catch (error) {
        console.warn('Haptic vibration failed:', error);
      }
    }

    // Trigger visual feedback
    if (pattern.visualFeedback && this.canUseVisualFeedback()) {
      this.triggerVisualFeedback(type, element);
    }
  }

  private triggerVisualFeedback(type: HapticType, element?: HTMLElement): void {
    const target = element || document.body;
    
    // Add haptic class for CSS animations
    const hapticClass = `haptic-${type}`;
    target.classList.add(hapticClass);
    
    // Remove class after animation
    setTimeout(() => {
      target.classList.remove(hapticClass);
    }, 200);

    // Add ripple effect for touch interactions
    if (element && (type === HapticType.LIGHT || type === HapticType.MEDIUM)) {
      this.createRippleEffect(element);
    }
  }

  private createRippleEffect(element: HTMLElement): void {
    const ripple = document.createElement('div');
    ripple.className = 'haptic-ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (rect.width / 2 - size / 2) + 'px';
    ripple.style.top = (rect.height / 2 - size / 2) + 'px';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 300);
  }

  // Convenience methods
  public light(element?: HTMLElement): void {
    this.trigger(HapticType.LIGHT, element);
  }

  public medium(element?: HTMLElement): void {
    this.trigger(HapticType.MEDIUM, element);
  }

  public heavy(element?: HTMLElement): void {
    this.trigger(HapticType.HEAVY, element);
  }

  public success(element?: HTMLElement): void {
    this.trigger(HapticType.SUCCESS, element);
  }

  public warning(element?: HTMLElement): void {
    this.trigger(HapticType.WARNING, element);
  }

  public error(element?: HTMLElement): void {
    this.trigger(HapticType.ERROR, element);
  }

  public selection(element?: HTMLElement): void {
    this.trigger(HapticType.SELECTION, element);
  }
}

// Export singleton instance
export const haptics = new HapticManager();

// React hook for haptic feedback
export const useHaptics = () => {
  return {
    trigger: haptics.trigger.bind(haptics),
    light: haptics.light.bind(haptics),
    medium: haptics.medium.bind(haptics),
    heavy: haptics.heavy.bind(haptics),
    success: haptics.success.bind(haptics),
    warning: haptics.warning.bind(haptics),
    error: haptics.error.bind(haptics),
    selection: haptics.selection.bind(haptics),
    isEnabled: haptics.isHapticEnabled.bind(haptics),
    setEnabled: haptics.setEnabled.bind(haptics)
  };
};

export default haptics;