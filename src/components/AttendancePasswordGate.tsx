import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { isPasswordGateUnlocked, setPasswordGateUnlocked } from '../utils/passwordGateStorage';

interface AttendancePasswordGateProps {
  children: React.ReactNode;
}

const ATTENDANCE_PASSWORD = 'hivetech2024';
const GATE_ID = 'attendance';

export function AttendancePasswordGate({ children }: AttendancePasswordGateProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check if already unlocked on mount
  useEffect(() => {
    console.log('[AttendancePasswordGate] Checking unlock status for:', GATE_ID);
    const isUnlocked = isPasswordGateUnlocked(GATE_ID);
    console.log('[AttendancePasswordGate] Is unlocked:', isUnlocked);
    
    if (isUnlocked) {
      console.log('[AttendancePasswordGate] Auto-unlocking based on localStorage');
      setIsUnlocked(true);
    } else {
      console.log('[AttendancePasswordGate] Password required');
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ATTENDANCE_PASSWORD) {
      console.log('[AttendancePasswordGate] Password correct, saving unlock to localStorage');
      setPasswordGateUnlocked(GATE_ID);
      
      // Verify it was saved
      const savedUnlocks = localStorage.getItem('passwordUnlocks');
      console.log('[AttendancePasswordGate] Saved unlocks:', savedUnlocks);
      
      setIsUnlocked(true);
      toast.success('Access granted! Password saved for 24 hours', {
        description: 'You won\'t need to enter it again until tomorrow',
      });
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  if (isLoading) {
    return null;
  }

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-300px)]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-8 py-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Protected Access</h2>
            <p className="text-amber-100 text-sm mb-0">Enter password to access attendance marking</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter password"
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1.5 mb-0">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white py-3.5 rounded-xl font-semibold hover:from-amber-700 hover:to-amber-600 transition-all duration-300 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40"
              >
                Unlock Access
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
