import { useState, useEffect } from 'react';
import { Copy, RefreshCw, Eye, EyeOff, Loader2, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useProjectStore } from '../../../stores/project.store';
import { getStoredApiKey } from '../../../lib/api';

export function DesktopApiKeys() {
  const projectStore = useProjectStore();
  const [showSecret, setShowSecret] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isRotatingSecret, setIsRotatingSecret] = useState(false);
  const [isRotatingKey, setIsRotatingKey] = useState(false);

  useEffect(() => {
    projectStore.fetchProject();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleRotateSecret = async () => {
    setIsRotatingSecret(true);
    const secret = await projectStore.rotateSigningSecret();
    setIsRotatingSecret(false);
    if (secret) {
      toast.success('Signing secret regenerated');
    } else {
      toast.error(projectStore.error ?? 'Rotation failed');
    }
  };

  const handleRotateApiKey = async () => {
    setIsRotatingKey(true);
    const key = await projectStore.rotateApiKey();
    setIsRotatingKey(false);
    if (key) {
      toast.success('API key regenerated and stored');
    } else {
      toast.error(projectStore.error ?? 'Rotation failed');
    }
  };

  const signingSecret = projectStore.project?.player_signing_secret ?? '';
  const apiKey = getStoredApiKey() ?? '';

  return (
    <div className="p-8 space-y-8 max-w-[1000px] mx-auto">
      <div>
        <h2 className="text-[28px] font-bold text-white tracking-tight">API Keys</h2>
        <p className="text-[#8E8E93] text-[15px]">Connection credentials for your servers</p>
      </div>

      {projectStore.isLoading && !projectStore.project ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-[#05b6f8] animate-spin" />
        </div>
      ) : (
        <>
          {/* Signing Secret */}
          <div className="bg-[#1C1C1E] rounded-xl border border-[#38383A] overflow-hidden">
            <div className="h-1 w-full bg-[#FF453A]" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-bold text-white mb-1">PLAYER_SIGNING_SECRET</h3>
                  <p className="text-[#8E8E93] text-[14px]">
                    This secret verifies player authenticity. Never share it.
                  </p>
                </div>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 text-[#8E8E93] hover:text-white transition-colors"
                >
                  {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-[#2C2C2E] rounded-lg px-4 py-3 font-mono text-[14px] text-white flex items-center overflow-hidden">
                  {showSecret ? (signingSecret || 'Not available') : '\u2022'.repeat(32)}
                </div>
                <button
                  onClick={() => copyToClipboard(signingSecret, 'Secret')}
                  disabled={!signingSecret}
                  className="px-4 bg-[#38383A] hover:bg-[#48484A] disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Copy size={16} /> Copy
                </button>
                <button
                  onClick={handleRotateSecret}
                  disabled={isRotatingSecret}
                  className="px-4 bg-[#FF453A]/10 hover:bg-[#FF453A]/20 text-[#FF453A] rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isRotatingSecret ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Rotation
                </button>
              </div>
            </div>
          </div>

          {/* API Key */}
          <div className="bg-[#1C1C1E] rounded-xl border border-[#38383A] overflow-hidden">
            <div className="h-1 w-full bg-[#05b6f8]" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-bold text-white mb-1 flex items-center gap-2">
                    <Key size={18} /> API KEY
                  </h3>
                  <p className="text-[#8E8E93] text-[14px]">
                    Key used by the dashboard and your servers to access the v1 API. Prefix <code className="text-[#05b6f8]">mw_</code>.
                  </p>
                </div>
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-2 text-[#8E8E93] hover:text-white transition-colors"
                >
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-[#2C2C2E] rounded-lg px-4 py-3 font-mono text-[14px] text-white flex items-center overflow-hidden">
                  {showApiKey ? (apiKey || 'Not stored locally') : '\u2022'.repeat(32)}
                </div>
                <button
                  onClick={() => copyToClipboard(apiKey, 'API key')}
                  disabled={!apiKey}
                  className="px-4 bg-[#38383A] hover:bg-[#48484A] disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Copy size={16} /> Copy
                </button>
                <button
                  onClick={handleRotateApiKey}
                  disabled={isRotatingKey}
                  className="px-4 bg-[#05b6f8]/10 hover:bg-[#05b6f8]/20 text-[#05b6f8] rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isRotatingKey ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  Rotation
                </button>
              </div>

              <p className="mt-3 text-[12px] text-[#8E8E93]">
                Warning: rotation generates a new key. The old one will be immediately invalidated.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
