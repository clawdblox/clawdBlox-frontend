import { useEffect } from 'react';
import { MacCard } from '../components/MacUI';
import { Users, MessageCircle, Brain, Heart, Loader2, AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { useStatsStore } from '../../../stores/stats.store';

export function DesktopAnalytics() {
  const statsStore = useStatsStore();

  useEffect(() => {
    statsStore.fetchStats();
  }, []);

  if (statsStore.isLoading && !statsStore.stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#05b6f8]" />
      </div>
    );
  }

  if (statsStore.error && !statsStore.stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-3">
        <AlertCircle size={32} className="text-[#FF453A]" />
        <p className="text-[15px] text-[#FF453A]">{statsStore.error}</p>
      </div>
    );
  }

  const stats = statsStore.stats;

  const metricCards = [
    { label: 'Total NPCs', value: stats?.npcs.total ?? 0, icon: Users, color: '#05b6f8' },
    { label: 'Total Conversations', value: stats?.conversations.total ?? 0, icon: MessageCircle, color: '#34C759' },
    { label: 'Active Conversations', value: stats?.conversations.active ?? 0, icon: Activity, color: '#FF9500' },
    { label: 'Total Memories', value: stats?.memories.total ?? 0, icon: Brain, color: '#AF52DE' },
    { label: 'Total Relationships', value: stats?.relationships.total ?? 0, icon: Heart, color: '#FF453A' },
  ];

  const detailMetrics = [
    { label: 'Avg Vividness', value: stats?.memories.avg_vividness != null ? `${Math.round(stats.memories.avg_vividness * 100)}%` : 'N/A', color: '#AF52DE' },
    { label: 'Avg Affinity', value: stats?.relationships.avg_affinity != null ? `${Math.round(stats.relationships.avg_affinity * 100)}%` : 'N/A', color: '#34C759' },
    { label: 'Avg Trust', value: stats?.relationships.avg_trust != null ? `${Math.round(stats.relationships.avg_trust * 100)}%` : 'N/A', color: '#05b6f8' },
    { label: 'Avg Familiarity', value: stats?.relationships.avg_familiarity != null ? `${Math.round(stats.relationships.avg_familiarity * 100)}%` : 'N/A', color: '#FF9F0A' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-[28px] font-bold text-white tracking-tight">Analytics</h2>
        <p className="text-[#8E8E93] text-[15px]">World performance metrics</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-5 gap-4">
        {metricCards.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <MacCard key={i} className="relative overflow-hidden group">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: metric.color + '1A' }}>
                    <Icon size={20} style={{ color: metric.color }} />
                  </div>
                </div>
                <div className="text-[28px] font-bold text-white mb-1">{metric.value}</div>
                <div className="text-[12px] font-medium text-[#8E8E93] uppercase tracking-wide">{metric.label}</div>
                <div
                  className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-[50px] opacity-15 pointer-events-none"
                  style={{ backgroundColor: metric.color }}
                />
              </div>
            </MacCard>
          );
        })}
      </div>

      {/* Detailed Metrics */}
      <div>
        <h3 className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={14} />
          System Averages
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {detailMetrics.map((metric, i) => (
            <MacCard key={i} className="p-5">
              <div className="text-[24px] font-bold text-white mb-1" style={{ color: metric.color }}>
                {metric.value}
              </div>
              <div className="text-[12px] font-medium text-[#8E8E93] uppercase tracking-wide">{metric.label}</div>
            </MacCard>
          ))}
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-[#1C1C1E] border border-[#38383A] rounded-xl p-5">
        <p className="text-[14px] text-[#8E8E93]">
          Temporal charts (conversations/day, players/week) will be available in a future API update.
          The metrics above reflect real-time totals and averages.
        </p>
      </div>
    </div>
  );
}
