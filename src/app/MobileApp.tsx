import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { useUIStore } from './components/app-store';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { NPCListScreen } from './components/NPCListScreen';
import { NPCDetailScreen } from './components/NPCDetailScreen';
import { CreateNPCScreen } from './components/CreateNPCScreen';
import { ChatSelectScreen, ChatLiveScreen } from './components/ChatScreen';
import { MoreScreen } from './components/MoreScreen';
import { BottomTabBar } from './components/BottomTabBar';
import type { ScreenId } from './components/app-store';

function ScreenRenderer() {
  const { activeTab, stacks } = useUIStore();
  const stack = stacks[activeTab];
  const currentScreen = stack[stack.length - 1];

  const screenComponent = (screenId: ScreenId): React.ReactNode => {
    switch (screenId) {
      case 'overview':
        return <HomeScreen />;
      case 'npc-list':
        return <NPCListScreen />;
      case 'npc-detail':
        return <NPCDetailScreen />;
      case 'npc-create':
        return <CreateNPCScreen />;
      case 'chat-select':
        return <ChatSelectScreen />;
      case 'chat-live':
        return <ChatLiveScreen />;
      case 'more-menu':
        return <MoreScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activeTab}-${currentScreen.screen}-${stack.length}`}
        className="w-full h-full bg-background"
        initial={{ opacity: 0, x: stack.length > 1 ? 40 : 0 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: stack.length > 1 ? 40 : 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {screenComponent(currentScreen.screen)}
      </motion.div>
    </AnimatePresence>
  );
}

export default function MobileApp() {
  const { showTabBar } = useUIStore();

  return (
    <div
      className="relative w-full h-dvh flex flex-col mx-auto bg-background shadow-2xl overflow-hidden font-sans dark"
      style={{
        maxWidth: '428px',
        // In a real mobile app, we might not want this shadow/margin, but for web preview it's good
      }}
    >
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          className: "rounded-2xl shadow-lg",
          style: {
            fontFamily: 'inherit',
            fontSize: '14px',
          },
        }}
      />

      {/* Screen content area — flex-1 takes remaining space after tab bar */}
      <div className="flex-1 min-h-0 relative">
        <ScreenRenderer />
      </div>

      {/* Bottom Tab Bar — fixed height, never shrinks */}
      {showTabBar && <BottomTabBar />}
    </div>
  );
}
