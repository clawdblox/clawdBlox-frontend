import { useEffect } from 'react';
import { MacCard } from '../components/MacUI';
import { Users, MessageCircle, Brain, Heart, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { useStatsStore } from '../../../stores/stats.store';
import { useNpcStore } from '../../../stores/npc.store';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function DesktopOverview() {
  const statsStore = useStatsStore();
  const npcStore = useNpcStore();

  useEffect(() => {
    statsStore.fetchStats();
    npcStore.fetchNpcs();
  }, []);

  const isLoading = statsStore.isLoading || npcStore.isLoading;
  const error = statsStore.error || npcStore.error;

  if (isLoading && !statsStore.stats && npcStore.npcs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#05b6f8]" />
      </div>
    );
  }

  if (error && !statsStore.stats && npcStore.npcs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3">
        <AlertCircle size={32} className="text-[#FF453A]" />
        <p className="text-[15px] text-[#FF453A]">{error}</p>
      </div>
    );
  }

  const stats = statsStore.stats;

  const statCards = [
    { label: 'Active NPCs', value: stats?.npcs.total ?? 0, icon: Users, color: '#05b6f8' },
    { label: 'Conversations', value: stats?.conversations.total ?? 0, icon: MessageCircle, color: '#34C759' },
    { label: 'Memories', value: stats?.memories.total ?? 0, icon: Brain, color: '#FF9500' },
    { label: 'Relationships', value: stats?.relationships.total ?? 0, icon: Heart, color: '#AF52DE' },
  ];

  const chartData = npcStore.npcs.slice(0, 5).map((npc) => ({
    name: npc.name.split(' ')[0],
    active: npc.is_active ? 1 : 0,
  }));

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-[28px] font-bold text-white tracking-tight">Overview</h2>
        <p className="text-[#8E8E93] text-[15px]">Welcome to your dashboard, Admin.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#FF453A]/10 border border-[#FF453A]/20">
          <AlertCircle size={16} className="text-[#FF453A]" />
          <p className="text-[13px] text-[#FF453A]">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div data-tutorial="stats-grid" className="grid grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <MacCard key={i} hover className="relative overflow-hidden group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-[${stat.color}]/10`}>
                    <Icon size={24} style={{ color: stat.color }} />
                  </div>
                </div>
                <div>
                  <div className="text-[32px] font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-[13px] font-medium text-[#8E8E93] uppercase tracking-wide">{stat.label}</div>
                </div>
                <div
                  className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity"
                  style={{ backgroundColor: stat.color }}
                />
              </div>
            </MacCard>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6 h-[400px]">
        {/* NPC List */}
        <div data-tutorial="recent-npcs" className="col-span-2 h-full">
          <MacCard title="Recent NPCs" className="h-full flex flex-col">
            <div className="overflow-y-auto flex-1 h-full max-h-[340px] custom-scrollbar">
              {npcStore.npcs.length === 0 && (
                <div className="flex items-center justify-center h-full text-[14px] text-[#8E8E93]">
                  No NPCs yet.
                </div>
              )}
              {npcStore.npcs.slice(0, 6).map((npc) => (
                <div key={npc.id} className="flex items-center gap-4 px-6 py-4 border-b border-[#38383A]/50 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-[14px] font-bold text-[#8E8E93] group-hover:scale-110 transition-transform">
                    {npc.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-white">{npc.name}</span>
                        <span className={`w-2 h-2 rounded-full ${npc.is_active ? 'bg-[#34C759]' : 'bg-[#8E8E93]'}`} />
                      </div>
                      <span className="text-[12px] text-[#8E8E93] capitalize">{npc.mood}</span>
                    </div>
                    <p className="text-[14px] text-[#8E8E93] truncate">
                      {truncate(npc.backstory, 80)}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </MacCard>
        </div>

        {/* Top NPC Chart */}
        <div className="col-span-1 h-full">
          <MacCard title="Top NPCs (Status)" className="h-full flex flex-col">
            <div className="flex-1 p-4">
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[14px] text-[#8E8E93]">
                  No data.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#383B44" />
                    <XAxis type="number" hide domain={[0, 1]} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#8E8E93', fontSize: 12 }} width={80} axisLine={false} tickLine={false} />
                    <Bar dataKey="active" fill="#05b6f8" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </MacCard>
        </div>
      </div>
    </div>
  );
}
