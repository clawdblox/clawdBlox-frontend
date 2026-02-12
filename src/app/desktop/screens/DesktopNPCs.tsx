import { useState, useEffect } from 'react';
import { MacCard, MacTable, MacTableRow } from '../components/MacUI';
import { useNpcStore } from '../../../stores/npc.store';
import { Search, Plus, Pencil, Trash2, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  ResponsiveContainer
} from 'recharts';
import { DesktopNPCDetail } from './DesktopNPCDetail';
import { DesktopNPCCreate } from './DesktopNPCCreate';
import { toast } from 'sonner';

const AVATAR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function DesktopNPCs() {
  const [search, setSearch] = useState('');
  const [selectedNPCId, setSelectedNPCId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const npcStore = useNpcStore();

  useEffect(() => {
    npcStore.fetchNpcs();
  }, []);

  const filtered = npcStore.npcs.filter(n => {
    const query = search.toLowerCase();
    return n.name.toLowerCase().includes(query) ||
      n.backstory.toLowerCase().includes(query);
  });

  async function handleDelete(id: string): Promise<void> {
    const success = await npcStore.deleteNpc(id);
    if (success) {
      toast.success('NPC deleted successfully');
    } else {
      toast.error(npcStore.error ?? 'Deletion failed');
    }
  }

  if (isCreating) {
    return <DesktopNPCCreate onBack={() => setIsCreating(false)} />;
  }

  if (selectedNPCId) {
    return (
      <DesktopNPCDetail
        npcId={selectedNPCId}
        onBack={() => setSelectedNPCId(null)}
      />
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-white tracking-tight">NPCs</h2>
          <p className="text-[#8E8E93] text-[15px]">{filtered.length} active characters</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[#1C1C1E] border border-[#38383A] rounded-lg text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#05b6f8] w-[240px] transition-colors"
            />
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#05b6f8] hover:bg-[#0498d0] text-white rounded-lg font-semibold transition-colors shadow-lg shadow-[#05b6f8]/20 active:translate-y-0.5"
          >
            <Plus size={18} />
            Create NPC
          </button>
        </div>
      </div>

      {/* Error banner */}
      {npcStore.error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-[#FF453A]/10 border border-[#FF453A]/30 rounded-lg">
          <AlertCircle size={18} className="text-[#FF453A] flex-shrink-0" />
          <p className="text-[#FF453A] text-[14px]">{npcStore.error}</p>
          <button
            onClick={() => npcStore.clearError()}
            className="ml-auto text-[#8E8E93] hover:text-white text-[13px] transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Loading state */}
      {npcStore.isLoading && npcStore.npcs.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#05b6f8]" />
            <p className="text-[#8E8E93] text-[15px]">Loading NPCs...</p>
          </div>
        </div>
      )}

      {/* Table */}
      {!(npcStore.isLoading && npcStore.npcs.length === 0) && (
        <MacCard className="flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <MacTable headers={['Avatar', 'Name / Backstory', 'Personality', 'Actions']}>
              {filtered.map((npc) => {
                const avatarColor = getAvatarColor(npc.name);
                const initial = npc.name.charAt(0).toUpperCase();

                return (
                  <MacTableRow key={npc.id} onClick={() => setSelectedNPCId(npc.id)}>
                    {/* Avatar */}
                    <div className="flex-none w-[60px]">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[16px] font-bold text-white shadow-inner"
                        style={{ backgroundColor: avatarColor + '33', color: avatarColor }}
                      >
                        {initial}
                      </div>
                    </div>

                    {/* Name & Backstory */}
                    <div className="flex-1 min-w-[200px] pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-white">{npc.name}</span>
                        {npc.is_active && (
                          <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_8px_rgba(52,199,89,0.5)]" />
                        )}
                      </div>
                      <p className="text-[13px] text-[#8E8E93] truncate max-w-[300px]">{npc.backstory}</p>
                    </div>

                    {/* Personality Radar */}
                    <div className="flex-none w-[120px]">
                      <div className="w-[60px] h-[60px] -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={[
                            { trait: 'O', value: npc.personality.openness },
                            { trait: 'C', value: npc.personality.conscientiousness },
                            { trait: 'E', value: npc.personality.extraversion },
                            { trait: 'A', value: npc.personality.agreeableness },
                            { trait: 'N', value: npc.personality.neuroticism },
                          ]}>
                            <PolarGrid stroke="#383B44" />
                            <Radar dataKey="value" stroke="#05b6f8" fill="#05b6f8" fillOpacity={0.3} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-none w-[120px] flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-2 rounded-lg hover:bg-white/10 text-[#8E8E93] hover:text-[#05b6f8] transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedNPCId(npc.id); }}
                        className="p-2 rounded-lg hover:bg-white/10 text-[#8E8E93] hover:text-[#34C759] transition-colors"
                      >
                        <MessageCircle size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(npc.id); }}
                        className="p-2 rounded-lg hover:bg-white/10 text-[#8E8E93] hover:text-[#FF453A] transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </MacTableRow>
                );
              })}
            </MacTable>

            {/* Empty state */}
            {filtered.length === 0 && !npcStore.isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-[#8E8E93] text-[15px]">
                  {search ? 'No NPCs match your search.' : 'No NPCs yet.'}
                </p>
              </div>
            )}
          </div>
        </MacCard>
      )}
    </div>
  );
}
