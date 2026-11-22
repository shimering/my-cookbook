import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Cloud,
  Download,
  Upload,
  Printer,
  CheckCircle,
  Database,
  RefreshCw,
  LogOut,
  Mail,
  Lock,
} from 'lucide-react';
import {
  downloadBackupFile,
  restoreFromBackupFile,
} from '../../services/backupService';
import {
  cloudflareAuth,
  type CloudflareUser,
} from '../../services/cloudflareAuthService';
import {
  cloudflareSync,
  type SyncState,
} from '../../services/cloudflareSyncService';

interface SyncBackupModalProps {
  onClose: () => void;
  onDataRestored: () => void;
  onPrintAll: () => void;
}

export const SyncBackupModal: React.FC<SyncBackupModalProps> = ({
  onClose,
  onDataRestored,
  onPrintAll,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<CloudflareUser | null>(
    cloudflareAuth.getAuthUser()
  );
  const [syncState, setSyncState] = useState<SyncState>(
    cloudflareSync.getSyncState()
  );

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lock body scroll on mount
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const unsubAuth = cloudflareAuth.onAuthStateChange((user) => {
      setCurrentUser(user);
    });

    const unsubSync = cloudflareSync.onSyncStateChange((s) => {
      setSyncState(s);
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      unsubAuth();
      unsubSync();
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        await cloudflareAuth.register(email, password);
        setRestoreMessage('Account created and signed in successfully!');
      } else {
        await cloudflareAuth.login(email, password);
        setRestoreMessage('Signed in successfully!');
      }
      setEmail('');
      setPassword('');
      // Trigger instant sync upon login
      cloudflareSync.syncNow();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await cloudflareAuth.logout();
    setRestoreMessage('Signed out from Cloudflare account.');
  };

  const handleManualSync = async () => {
    await cloudflareSync.syncNow();
    if (!cloudflareSync.getSyncState().error) {
      setRestoreMessage('Sync complete! All devices are up to date.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      const result = await restoreFromBackupFile(file);
      setRestoreMessage(
        `Successfully restored ${result.recipesCount} recipes and ${result.mealPlansCount} meal plans!`
      );
      onDataRestored();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to restore backup file');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#4A2C2A]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden overscroll-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#FFF5F7] w-full max-w-md max-h-[90vh] rounded-3xl border border-[#F3D5DC] shadow-cozy-lg flex flex-col overflow-hidden overscroll-contain animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F3D5DC] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF0F3] text-[#FF8FA3] flex items-center justify-center">
              <Cloud className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#4A2C2A]">
              Sync, Backup & Export
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#FFF0F3] text-[#8A6866] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[#4A2C2A]">
          {restoreMessage && (
            <div className="p-3 bg-[#E8F5E9] border border-[#C8E6C9] rounded-2xl flex items-center space-x-2 text-xs font-semibold text-[#2E7D32]">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{restoreMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-600">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Native Cloudflare Email Account & Sync */}
          <div className="bg-white border border-[#F3D5DC] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6866] flex items-center space-x-1.5">
                <Cloud className="w-4 h-4 text-[#FF8FA3]" />
                <span>Cloudflare Cloud Sync</span>
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentUser
                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                    : 'bg-[#FFF9E6] text-[#8A6866]'
                }`}
              >
                {currentUser ? 'Connected' : 'Offline / Local'}
              </span>
            </div>

            {currentUser ? (
              /* Logged In State */
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-[#FFF9E6] border border-[#F5E6BF] rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-[#8A6866]">Signed in as:</p>
                    <p className="text-xs font-bold text-[#4A2C2A]">{currentUser.email}</p>
                    <p className="text-[10px] text-[#8A6866] mt-0.5">
                      {syncState.lastSyncedAt
                        ? `Last synced: ${new Date(syncState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Not synced yet'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={syncState.isSyncing}
                      className="p-2 bg-white hover:bg-[#FFF0F3] border border-[#F3D5DC] rounded-xl text-[#FF8FA3] transition-colors shadow-xs"
                      title="Sync Now"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin' : ''}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-2 bg-white hover:bg-red-50 border border-red-100 rounded-xl text-red-500 transition-colors shadow-xs"
                      title="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {syncState.error && (
                  <p className="text-[11px] text-red-500 font-medium">{syncState.error}</p>
                )}
              </div>
            ) : (
              /* Logged Out / Form State */
              <div className="space-y-3 pt-1">
                <p className="text-[11px] text-[#8A6866] leading-relaxed">
                  Sign in with your email to sync recipes, meal plans, and ingredient photos
                  automatically across all your devices via Cloudflare D1 & R2.
                </p>

                {/* Tab Switcher */}
                <div className="flex bg-[#FFF5F7] p-1 rounded-xl border border-[#F3D5DC]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                      authMode === 'login'
                        ? 'bg-white text-[#4A2C2A] shadow-xs'
                        : 'text-[#8A6866] hover:text-[#4A2C2A]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError(null);
                    }}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                      authMode === 'register'
                        ? 'bg-white text-[#4A2C2A] shadow-xs'
                        : 'text-[#8A6866] hover:text-[#4A2C2A]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <p className="text-[11px] text-red-500 font-semibold">{authError}</p>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-2.5">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A6866]">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#FFF9E6] border border-[#F5E6BF] rounded-xl text-xs text-[#4A2C2A] placeholder-[#B89D9B] focus:outline-none focus:ring-2 focus:ring-[#FF8FA3]/50"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8A6866]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 characters)"
                      className="w-full pl-9 pr-3 py-2 bg-[#FFF9E6] border border-[#F5E6BF] rounded-xl text-xs text-[#4A2C2A] placeholder-[#B89D9B] focus:outline-none focus:ring-2 focus:ring-[#FF8FA3]/50"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2 px-4 bg-[#FF8FA3] hover:bg-[#FF758F] active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                  >
                    {authLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{authMode === 'register' ? 'Create Account' : 'Sign In'}</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Section 2: Backup & Restore */}
          <div className="bg-white border border-[#F3D5DC] rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6866] flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-[#FF8FA3]" />
              <span>Offline Backup & Restore</span>
            </h4>
            <p className="text-xs text-[#8A6866] leading-relaxed">
              Export all your recipes, meal plans, and grocery lists into a portable JSON archive.
              You can restore it on any device at any time.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={downloadBackupFile}
                className="py-2.5 px-3 bg-[#FFF9E6] hover:bg-[#FFE599] border border-[#F5E6BF] text-[#4A2C2A] text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4 text-[#8A6866]" />
                <span>Export (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 bg-[#FFE4E9] hover:bg-[#FFD2DC] border border-[#F3D5DC] text-[#4A2C2A] text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <Upload className="w-4 h-4 text-[#FF8FA3]" />
                <span>Restore Backup</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Section 3: Printable Cookbook / PDF */}
          <div className="bg-white border border-[#F3D5DC] rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6866] flex items-center space-x-1.5">
              <Printer className="w-3.5 h-3.5 text-[#FF8FA3]" />
              <span>Printable Cookbook / PDF</span>
            </h4>
            <p className="text-xs text-[#8A6866] leading-relaxed">
              Generate a clean, beautifully formatted view of all your recipes ready to print
              or save as a physical keepsake cookbook PDF.
            </p>

            <button
              type="button"
              onClick={onPrintAll}
              className="w-full py-2.5 px-3 bg-[#FFF0F3] hover:bg-[#FFE4E9] border border-[#F3D5DC] text-[#4A2C2A] text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-[#FF8FA3]" />
              <span>Print Complete Cookbook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
