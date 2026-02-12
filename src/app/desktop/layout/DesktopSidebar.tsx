import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Brain,
  MessageCircle,
  BarChart3,
  Settings,
  Key,
  UserPlus,
  Radio,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export type DesktopRoute = 'overview' | 'npcs' | 'memories' | 'conversations' | 'analytics' | 'settings' | 'api-keys' | 'team' | 'channels';

interface DesktopSidebarProps {
  currentRoute: DesktopRoute;
  onChangeRoute: (route: DesktopRoute) => void;
}

export function DesktopSidebar({ currentRoute, onChangeRoute }: DesktopSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  interface NavItemDef {
    id: DesktopRoute;
    label: string;
    icon: React.ElementType;
  }

  const menuItems: NavItemDef[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'npcs', label: 'NPCs', icon: Users },
    { id: 'memories', label: 'Memories', icon: Brain },
    { id: 'conversations', label: 'Conversations', icon: MessageCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const adminItems: NavItemDef[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'channels', label: 'Channels', icon: Radio },
    { id: 'team', label: 'Team', icon: UserPlus },
  ];

  const NavItem = ({ item }: { item: NavItemDef }) => {
    const isActive = currentRoute === item.id;
    const Icon = item.icon;
    
    return (
      <button
        onClick={() => onChangeRoute(item.id as DesktopRoute)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative
          ${isActive 
            ? 'bg-[#05b6f8]/15 text-[#05b6f8]' 
            : 'text-[#8E8E93] hover:bg-white/5 hover:text-white'
          }
        `}
      >
        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        {!collapsed && (
          <span className={`text-[14px] font-medium whitespace-nowrap ${isActive ? 'font-semibold' : ''}`}>
            {item.label}
          </span>
        )}
        {isActive && !collapsed && (
          <motion.div 
            layoutId="active-indicator"
            className="absolute left-0 w-1 h-5 bg-[#05b6f8] rounded-r-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </button>
    );
  };

  return (
    <motion.div 
      className="h-screen flex flex-col border-r border-[#38383A] bg-[#1C1C1E]/85 backdrop-blur-2xl relative z-50 transition-all duration-300 ease-in-out"
      style={{ width: collapsed ? 80 : 260 }}
    >
      {/* Logo Area */}
      <div className="h-[64px] flex items-center px-6 mb-4 border-b border-[#38383A]/50">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#05b6f8] to-[#0498d0] flex items-center justify-center shadow-lg shadow-[#05b6f8]/20 shrink-0">
          <span className="text-white text-lg">🧠</span>
        </div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="ml-3"
          >
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">ClawdBlox</h1>
            <p className="text-[11px] text-[#8E8E93] font-medium">MemoryWeave</p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {menuItems.map((item) => <NavItem key={item.id} item={item} />)}
        </div>

        <div>
          {!collapsed && (
            <h3 className="px-3 mb-2 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Admin
            </h3>
          )}
          <div className="space-y-1">
            {adminItems.map((item) => <NavItem key={item.id} item={item} />)}
          </div>
        </div>
      </div>

      {/* User / Logout */}
      <div className="p-3 border-t border-[#38383A]/50">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 transition-colors text-[#FF453A]">
          <LogOut size={20} />
          {!collapsed && <span className="text-[14px] font-medium">Sign out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#2C2C2E] border border-[#38383A] flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors z-50 shadow-lg"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.div>
  );
}
