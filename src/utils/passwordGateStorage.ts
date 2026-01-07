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
    console.log('[passwordGateStorage] Checking unlock for:', gateId);
    console.log('[passwordGateStorage] Raw localStorage value:', unlocksJson);
    
    if (!unlocksJson) return false;

    const unlocks = JSON.parse(unlocksJson) as Record<string, PasswordUnlock>;
    const unlock = unlocks[gateId];
    console.log('[passwordGateStorage] Unlock data for', gateId, ':', unlock);

    if (!unlock) return false;

    const currentTime = Date.now();
    console.log('[passwordGateStorage] Current time:', currentTime);
    console.log('[passwordGateStorage] Expires at:', unlock.expiresAt);
    console.log('[passwordGateStorage] Time remaining (hours):', ((unlock.expiresAt - currentTime) / (60 * 60 * 1000)).toFixed(2));
    
    if (currentTime > unlock.expiresAt) {
      // Unlock has expired, remove it
      console.log('[passwordGateStorage] Unlock has expired, removing');
      delete unlocks[gateId];
      localStorage.setItem(PASSWORD_UNLOCK_KEY, JSON.stringify(unlocks));
      return false;
    }

    console.log('[passwordGateStorage] Unlock is valid');
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
    console.log('[passwordGateStorage] Setting unlock for:', gateId);
    const unlocksJson = localStorage.getItem(PASSWORD_UNLOCK_KEY);
    const unlocks = unlocksJson ? JSON.parse(unlocksJson) : {};

    const now = Date.now();
    unlocks[gateId] = {
      timestamp: now,
      expiresAt: now + UNLOCK_DURATION,
    };

    console.log('[passwordGateStorage] Saving unlock data:', unlocks[gateId]);
    console.log('[passwordGateStorage] Will expire in 24 hours at:', new Date(unlocks[gateId].expiresAt).toLocaleString());
    
    localStorage.setItem(PASSWORD_UNLOCK_KEY, JSON.stringify(unlocks));
    console.log('[passwordGateStorage] Saved to localStorage successfully');
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
