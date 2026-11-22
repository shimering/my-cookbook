import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Cloud,
  Download,
  Upload,
  Printer,
  CheckCircle,
  Database,
  ExternalLink,
} from 'lucide-react';
import {
  downloadBackupFile,
  restoreFromBackupFile,
} from '../../services/backupService';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  getSupabaseClient,
} from '../../services/supabaseClient';

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
  const [supabaseConfig, setSupabaseConfig] = useState(getStoredSupabaseConfig());
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const client = getSupabaseClient();
  const isCloudConnected = Boolean(client && supabaseConfig.url && supabaseConfig.anonKey);

  // Lock body scroll on mount
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    saveSupabaseConfig(supabaseConfig.url, supabaseConfig.anonKey);
    setTimeout(() => {
      setIsSavingConfig(false);
      setRestoreMessage('Cloud configuration updated!');
    }, 400);
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

          {/* Section 1: Backup & Restore */}
          <div className="bg-white border border-[#F3D5DC] rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6866] flex items-center space-x-1">
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

          {/* Section 2: Printable Cookbook / PDF */}
          <div className="bg-white border border-[#F3D5DC] rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6866] flex items-center space-x-1">
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

          {/* Section 3: Supabase Cloud Sync */}
          <div className="bg-white border border-[#F3D5DC] rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6866] flex items-center space-x-1">
                <Cloud className="w-3.5 h-3.5 text-[#FF8FA3]" />
                <span>Supabase Cloud Sync</span>
              </h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isCloudConnected
                    ? 'bg-[#E8F5E9] text-[#2E7D32]'
                    : 'bg-[#FFF9E6] text-[#8A6866]'
                }`}
              >
                {isCloudConnected ? 'Connected' : 'Local Storage Mode'}
              </span>
            </div>

            <p className="text-[11px] text-[#8A6866] leading-relaxed">
              Connect your free Supabase project to sync across phone, tablet, and desktop
              automatically.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-2 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-[#8A6866] mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={supabaseConfig.url}
                  onChange={(e) =>
                    setSupabaseConfig({ ...supabaseConfig, url: e.target.value })
                  }
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-1.5 bg-[#FFF9E6] border border-[#F5E6BF] rounded-xl text-xs text-[#4A2C2A] placeholder-[#B89D9B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#8A6866] mb-1">
                  Supabase Anon Public Key
                </label>
                <input
                  type="password"
                  value={supabaseConfig.anonKey}
                  onChange={(e) =>
                    setSupabaseConfig({ ...supabaseConfig, anonKey: e.target.value })
                  }
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  className="w-full px-3 py-1.5 bg-[#FFF9E6] border border-[#F5E6BF] rounded-xl text-xs text-[#4A2C2A] placeholder-[#B89D9B] focus:outline-none"
                />
              </div>

              <div className="pt-1 flex items-center justify-between">
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-[10px] text-[#FF8FA3] hover:underline space-x-1"
                >
                  <span>Get free credentials at Supabase.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>

                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="px-3.5 py-1.5 bg-[#FF8FA3] hover:bg-[#FF758F] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {isSavingConfig ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
