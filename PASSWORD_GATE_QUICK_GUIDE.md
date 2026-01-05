# Password Gate System - Quick Start Guide

## How It Works

### Timeline Example

```
MONDAY, January 6, 2024
├─ 10:00 AM - User logs in to HR Portal
│  └─ Auth token stored with timestamp
│
├─ 10:05 AM - Navigate to Employee Management
│  └─ Password gate checks: "Is 'employee' unlocked?"
│     ├─ Not found in localStorage
│     └─ Shows password form
│        ├─ User enters: hive@2024 ✓
│        └─ Unlock saved with expiry: Tuesday 10:05 AM
│
├─ 10:10 AM - Refresh page (F5)
│  └─ Password gate checks: "Is 'employee' unlocked?"
│     ├─ Found in localStorage
│     ├─ Check expiry: Still valid (less than 24 hours)
│     └─ Auto-unlock ✓ (no password prompt!)
│
├─ 2:00 PM - Navigate to Daily Attendance
│  └─ Different password gate checks: "Is 'attendance' unlocked?"
│     ├─ Not found in localStorage (different gate)
│     └─ Shows password form
│        ├─ User enters: hivetech2024 ✓
│        └─ Unlock saved with expiry: Tuesday 2:00 PM
│
└─ 5:00 PM - Refresh page (F5)
   └─ Both gates check their respective unlocks
      ├─ 'employee': Found, valid → Auto-unlock ✓
      └─ 'attendance': Found, valid → Auto-unlock ✓

─────────────────────────────────────────────────────────

TUESDAY, January 7, 2024 - AFTER 24 HOURS
├─ 10:10 AM - Navigate to Employee Management
│  └─ Password gate checks: "Is 'employee' unlocked?"
│     ├─ Found in localStorage
│     ├─ Check expiry: EXPIRED (24+ hours passed)
│     ├─ Remove from localStorage
│     └─ Shows password form (must re-enter)
│
└─ User must enter password again
   └─ New unlock saved for next 24 hours
```

## Storage Structure

### Initial State (Empty)
```json
{}
```

### After Entering Both Passwords
```json
{
  "passwordUnlocks": {
    "employee": {
      "timestamp": 1704556800000,
      "expiresAt": 1704643200000
    },
    "attendance": {
      "timestamp": 1704573600000,
      "expiresAt": 1704660000000
    }
  }
}
```

### Timestamps Breakdown
```
timestamp:  1704556800000 = Monday Jan 6, 2024, 10:05 AM
expiresAt:  1704643200000 = Tuesday Jan 7, 2024, 10:05 AM
            ─────────────────────────────────
            Difference = 24 hours (86,400,000 ms)
```

## Component Flow

### EmployeePasswordGate Lifecycle

```
┌─────────────────────────────────────────┐
│ EmployeePasswordGate Mounts             │
└────────────────┬────────────────────────┘
                 │
                 ▼
        ┌─────────────────────┐
        │ Check localStorage  │
        │ for 'employee' key  │
        └────┬────────────┬───┘
             │            │
         Found?       Not Found
          YES   ◀────────▶  NO
             │            │
             ▼            ▼
      ┌─────────────┐  ┌────────────────┐
      │ Valid & Not │  │ Show Password  │
      │ Expired?    │  │ Form           │
      └────┬────────┘  └────────────────┘
           │ YES
           ▼
      ┌─────────────┐
      │ Auto-unlock │
      │ Render Kids │
      └─────────────┘

      User enters password:
      ┌─────────────────────┐
      │ Password correct?   │
      ├─────────┬───────────┤
      │         │           │
     YES       NO        ERROR
      │         │           │
      ▼         ▼           ▼
    UNLOCK  SHOW ERROR  SHOW ERROR
    & SAVE  & CLEAR    & CLEAR
    TO LS   FORM      FORM
```

### Independent Gate Tracking

```
EMPLOYEE PASSWORD GATE          ATTENDANCE PASSWORD GATE
─────────────────────────────────────────────────────────

Gate ID: 'employee'              Gate ID: 'attendance'
Password: hive@2024              Password: hivetech2024

Locked ────────┐                Locked ────────┐
               │                               │
      User enters password        User enters password
               │                               │
Unlocked ◀─────┘                 Unlocked ◀────┘
expiresAt: Tuesday 10:05 AM      expiresAt: Tuesday 2:00 PM

Can both be unlocked? YES! ✓
Each has independent expiration
Each has independent password
```

## Browser Console Testing

### Check Current Unlock Status

```javascript
// View all unlocks
localStorage.getItem('passwordUnlocks')

// Should return something like:
{"employee":{"timestamp":1704556800000,"expiresAt":1704643200000},"attendance":{"timestamp":1704573600000,"expiresAt":1704660000000}}

// Check specific gate
JSON.parse(localStorage.getItem('passwordUnlocks')).employee
// Output: {timestamp: 1704556800000, expiresAt: 1704643200000}
```

### Simulate Expiration

```javascript
// View current unlock
const unlocks = JSON.parse(localStorage.getItem('passwordUnlocks'));
console.log('Current:', unlocks);

// Set expiration to 1 hour ago
const pastTime = Date.now() - (60 * 60 * 1000); // 1 hour ago
unlocks.employee.expiresAt = pastTime;

// Save back
localStorage.setItem('passwordUnlocks', JSON.stringify(unlocks));

// Refresh page - password form should reappear!
```

### Clear All Unlocks

```javascript
// Clear everything
localStorage.removeItem('passwordUnlocks');
location.reload();
```

## Passwords Quick Reference

| Feature | Password | 
|---------|----------|
| **Email** | admin@hr-portal.com |
| **Portal Password** | (from backend) |
| **Employee Management** | `hive@2024` |
| **Attendance Marking** | `hivetech2024` |

## Troubleshooting

### "Password prompt appears every time"
**Solution**: Check browser localStorage is enabled
```javascript
// Test localStorage
try {
  localStorage.setItem('test', 'value');
  localStorage.removeItem('test');
  console.log('✓ localStorage works');
} catch(e) {
  console.error('✗ localStorage disabled:', e);
}
```

### "Both gates ask for password"
**This is normal!** Each gate has independent tracking. Unlock one at a time.

### "Can't remember password?"
**Employee**: `hive@2024`  
**Attendance**: `hivetech2024`

### "Want to clear unlocks?"
```javascript
localStorage.removeItem('passwordUnlocks');
location.reload();
```

## Integration Points

### In App.tsx
```tsx
// Wrapped components
<EmployeePasswordGate>
  <EmployeeManagement />
</EmployeePasswordGate>

<AttendancePasswordGate>
  <DailyAttendance />
</AttendancePasswordGate>
```

### Utility Module
```tsx
// src/utils/passwordGateStorage.ts exports:
- isPasswordGateUnlocked(gateId)
- setPasswordGateUnlocked(gateId)
- clearPasswordGateUnlock(gateId)
- clearAllPasswordGateUnlocks()
```

## User Communication

What to tell users:
> "You only need to enter your password once per day for each protected feature. After entering it, you can refresh the page or navigate away and come back without needing to enter it again - until 24 hours pass or you close all browser windows."
