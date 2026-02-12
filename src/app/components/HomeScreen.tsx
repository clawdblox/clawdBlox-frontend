import { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  MessageCircle,
  Brain,
  Heart,
  RefreshCw,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { NavigationHeader } from './NavigationHeader';
import { useUIStore } from './app-store';
import { useStatsStore } from '../../stores/stats.store';
import { useNpcStore } from '../../stores/npc.store';
import { getRelativeTime, getNpcAvatar, buildOceanData } from '../../lib/utils';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';

function MiniRadarChart({ personality }: { personality: Record<string, number> }) {
  const data = buildOceanData(personality, 'short');

  return (
    <RadarChart width={80} height={80} data={data} cx="50%" cy="50%">
      <PolarGrid stroke="rgba(5,182,248,0.15)" strokeWidth={0.5} />
      <PolarAngleAxis dataKey="trait" tick={{ fontSize: 9, fill: '#8E8E93' }} />
      <Radar
        dataKey="value"
        stroke="#05b6f8"
        fill="#05b6f8"
        fillOpacity={0.2}
        strokeWidth={1.5}
      />
    </RadarChart>
  );
}

export function HomeScreen() {
  const { setTab, pushScreen, setSelectedNpcId } = useUIStore();
  const { stats, fetchStats, isLoading: statsLoading } = useStatsStore();
  const { npcs, fetchNpcs, isLoading: npcsLoading } = useNpcStore();

  useEffect(() => {
    fetchStats();
    fetchNpcs();
  }, [fetchStats, fetchNpcs]);

  const isLoading = statsLoading || npcsLoading;

  const handleRefresh = () => {
    fetchStats();
    fetchNpcs();
  };

  const statCards = [
    { label: 'Active NPCs', value: stats?.npcs.total ?? '-', icon: Users, color: '#05b6f8' },
    { label: 'Active conv.', value: stats?.conversations.active ?? '-', icon: MessageCircle, color: '#34C759' },
    { label: 'Memories', value: stats?.memories.total ?? '-', icon: Brain, color: '#FF9500' },
    { label: 'Relationships', value: stats?.relationships.total ?? '-', icon: Heart, color: '#AF52DE' },
  ];

  const activeNpcs = npcs.filter((n) => n.is_active);
  const displayedNpcs = activeNpcs.slice(0, 5);
  const topNpcs = activeNpcs.slice(0, 3);

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <NavigationHeader
        title="Overview"
        largeTitle
        rightAction={
          <button
            onClick={handleRefresh}
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/5 transition-colors"
          >
            <RefreshCw
              size={20}
              className={`text-primary ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        }
      />

      <div className="flex-1 min-h-0 pb-6 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar">
        {/* Loading overlay */}
        {isLoading && !stats && npcs.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        )}

        {/* Stat Cards */}
        <div className="px-4 pt-3">
          <div className="flex gap-3 pb-3 overflow-x-auto snap-x snap-mandatory touch-pan-x no-scrollbar">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  className="flex-shrink-0 p-4 rounded-2xl relative overflow-hidden bg-card border border-white/5 snap-center shadow-sm"
                  style={{ width: '155px' }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    className="absolute top-0 right-0 w-20 h-20 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${card.color}15 0%, transparent 70%)`,
                      transform: 'translate(30%, -30%)',
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${card.color}18` }}
                  >
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                  <p className="text-[28px] font-bold text-foreground leading-none tracking-tight">
                    {card.value}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[13px] text-muted-foreground">
                      {card.label}
                    </p>
                    {stats && (
                      <span className="flex items-center gap-0.5 text-[11px] font-semibold text-[#34C759]">
                        <TrendingUp size={10} />
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Active NPCs List */}
        <div className="px-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[20px] font-bold text-foreground tracking-tight">
              Active NPCs
            </h2>
            <button
              className="flex items-center gap-1 text-[14px] text-primary font-medium active:opacity-60 transition-opacity"
              onClick={() => setTab('npcs')}
            >
              View all
            </button>
          </div>
          <div className="rounded-2xl overflow-hidden bg-card border border-white/5 shadow-sm">
            {npcs.length === 0 && !npcsLoading && (
              <div className="px-4 py-8 text-center text-muted-foreground text-[14px]">
                No NPCs yet
              </div>
            )}
            {displayedNpcs.map((npc, i, arr) => (
              <motion.button
                key={npc.id}
                className={`w-full flex items-center gap-3 px-4 active:bg-white/5 text-left transition-colors min-h-[64px] ${
                  i < arr.length - 1 ? 'border-b border-white/5' : ''
                }`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  setTab('npcs');
                  setSelectedNpcId(npc.id);
                  pushScreen('npc-detail', npc.name);
                }}
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-background text-[22px]">
                  {getNpcAvatar(npc.name)}
                </div>
                <div className="flex-1 min-w-0 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-semibold text-foreground">
                      {npc.name}
                    </span>
                    <span className="text-[12px] text-zinc-500 flex-shrink-0">
                      {getRelativeTime(npc.updated_at)}
                    </span>
                  </div>
                  <p className="truncate text-[14px] text-muted-foreground">
                    {npc.mood || npc.backstory.slice(0, 60)}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Top NPCs with Radar Charts */}
        <div className="px-4 mt-6 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[20px] font-bold text-foreground tracking-tight">
              Top NPCs
            </h2>
          </div>
          <div className="flex gap-3 pb-3 overflow-x-auto snap-x snap-mandatory touch-pan-x no-scrollbar">
            {topNpcs.map((npc, i) => (
              <motion.button
                key={npc.id}
                className="flex-shrink-0 rounded-2xl text-left active:scale-[0.97] transition-transform overflow-hidden snap-center w-[200px] border border-white/5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => {
                  setTab('npcs');
                  setSelectedNpcId(npc.id);
                  pushScreen('npc-detail', npc.name);
                }}
              >
                <div className="px-4 pt-4 pb-3 bg-gradient-to-br from-background via-[#1c1e24] to-[#15171b]">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/10 text-[22px] backdrop-blur-md">
                      {getNpcAvatar(npc.name)}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">
                        {npc.name}
                      </p>
                      <p className="text-[12px] text-primary/80 font-medium">
                        {getRelativeTime(npc.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 pt-2 pb-3 flex items-center justify-center bg-card shadow-sm">
                  <MiniRadarChart personality={npc.personality} />
                </div>
              </motion.button>
            ))}
            {activeNpcs.length === 0 && !npcsLoading && (
              <div className="flex-1 py-8 text-center text-muted-foreground text-[14px]">
                No active NPCs
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
