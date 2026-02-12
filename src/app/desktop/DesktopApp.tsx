import { useState } from 'react';
import { DesktopSidebar, DesktopRoute } from './layout/DesktopSidebar';
import { DesktopOverview } from './screens/DesktopOverview';
import { DesktopNPCs } from './screens/DesktopNPCs';
import { DesktopMemories } from './screens/DesktopMemories';
import { DesktopConversations } from './screens/DesktopConversations';
import { DesktopAnalytics } from './screens/DesktopAnalytics';
import { DesktopSettings } from './screens/DesktopSettings';
import { DesktopApiKeys } from './screens/DesktopApiKeys';
import { DesktopTeam } from './screens/DesktopTeam';
import { DesktopChannels } from './screens/DesktopChannels';
import { useAuthStore } from '../../stores/auth.store';
import { Toaster } from 'sonner';
import { AnimatePresence, motion } from 'motion/react';

export default function DesktopApp() {
  const [currentRoute, setCurrentRoute] = useState<DesktopRoute>('overview');
  const { isAuthenticated } = useAuthStore();

  const renderContent = () => {
    switch (currentRoute) {
      case 'overview':
        return <DesktopOverview />;
      case 'npcs':
        return <DesktopNPCs />;
      case 'memories':
        return <DesktopMemories />;
      case 'conversations':
        return <DesktopConversations />;
      case 'analytics':
        return <DesktopAnalytics />;
      case 'settings':
        return <DesktopSettings />;
      case 'api-keys':
        return <DesktopApiKeys />;
      case 'team':
        return <DesktopTeam />;
      case 'channels':
        return <DesktopChannels />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-[#8E8E93]">
            <div className="text-center">
              <h3 className="text-xl font-medium text-white mb-2">Not Found</h3>
              <p>The requested page does not exist.</p>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
     // For now, reuse the mobile login but we could make a desktop one
     // The mobile login is responsive enough for a centered card look
     return null; 
  }

  return (
    <div className="flex w-full h-screen bg-[#24272F] font-sans text-white overflow-hidden selection:bg-[#05b6f8]/30">
      <Toaster position="bottom-right" theme="dark" richColors />
      
      {/* Sidebar */}
      <DesktopSidebar 
        currentRoute={currentRoute} 
        onChangeRoute={setCurrentRoute} 
      />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden relative">
        {/* Top Gradient Mesh for atmosphere */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#05b6f8]/5 to-transparent pointer-events-none" />
        
        <div className="h-full overflow-y-auto overscroll-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
