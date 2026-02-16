import { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import MobileApp from './MobileApp';
import DesktopApp from './desktop/DesktopApp';
import { useAuthStore } from '../stores/auth.store';
import { LoginScreen } from './components/LoginScreen';
import { Toaster } from 'sonner';

export default function App() {
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const { isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#24272F]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 animate-pulse">
            <img src="/logo.png" alt="ClawdBlox" className="w-full h-full object-contain" />
          </div>
          <p className="text-[#8E8E93] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-center" richColors />
        <LoginScreen />
      </>
    );
  }

  return isDesktop ? <DesktopApp /> : <MobileApp />;
}
