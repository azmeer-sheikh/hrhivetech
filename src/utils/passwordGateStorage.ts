// Password Gate Storage Utility
// Manages password unlock status with 24-hour expiration

const PASSWORD_UNLOCK_KEY = 'passwordUnlocks';
const UNLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface PasswordUnlock {
  timestamp: number;
  expiresAt: number;
}

/**
 * Check if a password gate is unlocked and still valid
 * @param gateId - Unique identifier for the password gate (e.g., 'employee', 'attendance')
 * @returns true if the gate is unlocked and not expired
 */
export const isPasswordGateUnlocked = (gateId: string): boolean => {
  try {
    const unlocksJson = localStorage.getItem(PASSWORD_UNLOCK_KEY);
    if (!unlocksJson) return false;

    const unlocks = JSON.parse(unlocksJson) as Record<string, PasswordUnlock>;
    const unlock = unlocks[gateId];

    if (!unlock) return false;

    const currentTime = Date.now();
    if (currentTime > unlock.expiresAt) {
      // Unlock has expired, remove it
      delete unlocks[gateId];
      localStorage.setItem(PASSWORD_UNLOCK_KEY, JSON.stringify(unlocks));
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking password unlock status:', error);
    return false;
  }
};

/**
 * Mark a password gate as unlocked for 24 hours
 * @param gateId - Unique identifier for the password gate (e.g., 'employee', 'attendance')
 */
export const setPasswordGateUnlocked = (gateId: string): void => {
  try {
    const unlocksJson = localStorage.getItem(PASSWORD_UNLOCK_KEY);
    const unlocks = unlocksJson ? JSON.parse(unlocksJson) : {};

    const now = Date.now();
    unlocks[gateId] = {
      timestamp: now,
      expiresAt: now + UNLOCK_DURATION,
    };

    localStorage.setItem(PASSWORD_UNLOCK_KEY, JSON.stringify(unlocks));
  } catch (error) {
    console.error('Error setting password unlock:', error);
  }
};

/**
 * Clear unlock status for a specific gate
 * @param gateId - Unique identifier for the password gate
 */
export const clearPasswordGateUnlock = (gateId: string): void => {
  try {
    const unlocksJson = localStorage.getItem(PASSWORD_UNLOCK_KEY);
    if (!unlocksJson) return;

    const unlocks = JSON.parse(unlocksJson) as Record<string, PasswordUnlock>;
    delete unlocks[gateId];
    localStorage.setItem(PASSWORD_UNLOCK_KEY, JSON.stringify(unlocks));
  } catch (error) {
    console.error('Error clearing password unlock:', error);
  }
};

/**
 * Clear all password gate unlocks
 */
export const clearAllPasswordGateUnlocks = (): void => {
  try {
    localStorage.removeItem(PASSWORD_UNLOCK_KEY);
  } catch (error) {
    console.error('Error clearing all password unlocks:', error);
  }
};
