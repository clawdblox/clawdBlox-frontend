import { motion } from 'motion/react';
import { Home, Users, MessageCircle, MoreHorizontal } from 'lucide-react';
import { useUIStore, type TabId } from './app-store';
import { useNpcStore } from '../../stores/npc.store';

const tabDefs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'npcs', label: 'NPCs', icon: Users },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'more', label: 'Plus', icon: MoreHorizontal },
];

export function BottomTabBar() {
  const { activeTab, setTab, showTabBar } = useUIStore();
  const npcCount = useNpcStore((s) => s.npcs.length);

  if (!showTabBar) return null;

  const getBadge = (id: TabId): number | undefined => {
    if (id === 'npcs' && npcCount > 0) return npcCount;
    return undefined;
  };

  return (
    <div className="flex-shrink-0 relative z-50 h-[84px] pb-[20px]">
      {/* Glass background */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-xl border-t border-white/10" />

      <div className="relative flex items-start justify-around px-2 pt-1">
        {tabDefs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const badge = getBadge(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="flex flex-col items-center gap-1 min-w-[68px] py-1.5 relative outline-none touch-manipulation"
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    className="absolute -inset-4 rounded-full bg-primary/10 blur-xl"
                    layoutId="tabGlow"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ y: isActive ? -2 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-500'}`}
                    fill={isActive ? 'currentColor' : 'none'}
                    fillOpacity={isActive ? 0.2 : 0}
                  />
                </motion.div>
                {badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 bg-red-500 text-white text-[10px] font-bold shadow-sm border-[1.5px] border-background">
                    {badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-500'}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
