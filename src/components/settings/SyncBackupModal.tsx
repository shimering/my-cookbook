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
  Globe,
  Loader2,
} from 'lucide-react';
import type { Recipe } from '../../types';
import { db } from '../../db/cookbookDb';
import { getStoredUnitSystem } from '../../utils/unitConverter';
import { exportCookbookAsHtml } from '../../utils/htmlRecipeExporter';
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
  recipes?: Recipe[];
}

export const SyncBackupModal: React.FC<SyncBackupModalProps> = ({
  onClose,
  onDataRestored,
  onPrintAll,
  recipes,
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
  const [isExportingHtml, setIsExportingHtml] = useState(false);

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
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed');
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
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to restore backup file');
    }
  };

  const handleExportHtml = async () => {
    try {
      setIsExportingHtml(true);
      setErrorMessage(null);
      setRestoreMessage(null);

      const allRecipes = recipes && recipes.length > 0 ? recipes : await db.recipes.toArray();
      if (!allRecipes || allRecipes.length === 0) {
        setErrorMessage('No recipes found in your cookbook to export.');
        return;
      }

      const unitPref = getStoredUnitSystem();
      const res = await exportCookbookAsHtml(allRecipes, { unitSystem: unitPref });
      setRestoreMessage(`Successfully exported ${res.recipeCount} recipes to "${res.filename}"!`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to export HTML cookbook');
    } finally {
      setIsExportingHtml(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3D231D]/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-hidden overscroll-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#FFF8F6] w-full max-w-md max-h-[90vh] rounded-3xl border border-[#F3E5D8] shadow-cozy-lg flex flex-col overflow-hidden overscroll-contain animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-modal-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#F3E5D8] bg-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#FDE8EA] text-[#E85D75] flex items-center justify-center">
              <Cloud className="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 id="sync-modal-title" className="font-brand text-base font-bold text-[#3D231D]">
              Sync, Backup & Export
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#FDE8EA] text-[#8C726B] active:scale-95 transition-all cursor-pointer"
            aria-label="Close backup and sync settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[#3D231D]">
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
          <div className="bg-white border border-[#F3E5D8] rounded-2xl p-4 shadow-cozy space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C726B] flex items-center space-x-1.5">
                <Cloud className="w-4 h-4 text-[#E85D75]" />
                <span>Cloudflare Cloud Sync</span>
              </h4>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  currentUser
                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                    : 'bg-[#FDECC8] text-[#3D231D]'
                }`}
              >
                {currentUser ? 'Connected' : 'Offline / Local'}
              </span>
            </div>

            {currentUser ? (
              /* Logged In State */
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-[#FFF8F6] border border-[#F3E5D8] rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-[#8C726B]">Signed in as:</p>
                    <p className="text-xs font-bold text-[#3D231D]">{currentUser.email}</p>
                    <p className="text-[10px] text-[#8C726B] mt-0.5">
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
                      className="p-2 bg-white hover:bg-[#FDE8EA] border border-[#F3E5D8] rounded-full text-[#E85D75] transition-colors shadow-xs cursor-pointer"
                      title="Sync Now"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${syncState.isSyncing ? 'animate-spin' : ''}`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="p-2 bg-white hover:bg-red-50 border border-red-100 rounded-full text-red-500 transition-colors shadow-xs cursor-pointer"
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
                <p className="text-[11px] text-[#8C726B] leading-relaxed">
                  Sign in with your email to sync recipes, meal plans, and ingredient photos
                  automatically across all your devices via Cloudflare D1 & R2.
                </p>

                {/* Tab Switcher */}
                <div className="flex bg-[#FFF8F6] p-1 rounded-full border border-[#F3E5D8]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className={`flex-1 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'bg-white text-[#3D231D] shadow-xs'
                        : 'text-[#8C726B] hover:text-[#3D231D]'
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
                    className={`flex-1 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white text-[#3D231D] shadow-xs'
                        : 'text-[#8C726B] hover:text-[#3D231D]'
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
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C726B]">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#FFF8F6] border border-[#F3E5D8] rounded-xl text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C726B]">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 characters)"
                      className="w-full pl-9 pr-3 py-2 bg-[#FFF8F6] border border-[#F3E5D8] rounded-xl text-xs text-[#3D231D] placeholder-[#8C726B]/50 focus:outline-none focus:ring-2 focus:ring-[#E85D75]/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 px-4 bg-[#E85D75] hover:bg-[#D94C65] active:scale-98 text-white text-xs font-bold rounded-full shadow-strawberry transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
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

          {/* Section 2: Backup & Export */}
          <div className="bg-white border border-[#F3E5D8] rounded-2xl p-4 shadow-cozy space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C726B] flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-[#E85D75]" />
              <span>Offline Backup & Webpage Export</span>
            </h4>
            <p className="text-xs text-[#8C726B] leading-relaxed">
              Export all your recipes into a beautiful standalone HTML file with images and steps, or save a complete JSON backup.
            </p>

            <div className="space-y-2 pt-1">
              {/* Standalone HTML File Export Button */}
              <button
                type="button"
                onClick={handleExportHtml}
                disabled={isExportingHtml}
                className="w-full py-2.5 px-4 bg-[#E85D75] hover:bg-[#D44760] active:scale-98 text-white text-xs font-bold rounded-full flex items-center justify-center space-x-2 transition-all shadow-strawberry cursor-pointer disabled:opacity-50"
              >
                {isExportingHtml ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Packaging HTML Cookbook...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Export Recipes as Standalone HTML</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={downloadBackupFile}
                  className="py-2.5 px-3 bg-[#FDECC8] hover:bg-[#F4A261] hover:text-white border border-[#F3E5D8] text-[#3D231D] text-xs font-bold rounded-full flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#3D231D]" />
                  <span>Backup (.json)</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2.5 px-3 bg-[#FDE8EA] hover:bg-[#FCD2D8] border border-[#F3E5D8] text-[#3D231D] text-xs font-bold rounded-full flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#E85D75]" />
                  <span>Restore (.json)</span>
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
          </div>

          {/* Section 3: Printable Cookbook / PDF */}
          <div className="bg-white border border-[#F3E5D8] rounded-2xl p-4 shadow-cozy space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C726B] flex items-center space-x-1.5">
              <Printer className="w-3.5 h-3.5 text-[#E85D75]" />
              <span>Printable Cookbook / PDF</span>
            </h4>
            <p className="text-xs text-[#8C726B] leading-relaxed">
              Generate a clean, beautifully formatted view of all your recipes ready to print
              or save as a physical keepsake cookbook PDF.
            </p>

            <button
              type="button"
              onClick={onPrintAll}
              className="w-full py-2.5 px-3 bg-[#FDE8EA] hover:bg-[#FCD2D8] border border-[#F3E5D8] text-[#3D231D] text-xs font-bold rounded-full flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#E85D75]" />
              <span>Print Complete Cookbook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
