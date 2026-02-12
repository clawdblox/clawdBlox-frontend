import { useState, useEffect } from 'react';
import { MacCard, MacTable, MacTableRow } from '../components/MacUI';
import { Search, Zap, Loader2 } from 'lucide-react';
import { useNpcStore } from '../../../stores/npc.store';
import { useMemoryStore } from '../../../stores/memory.store';
import type { MemoryResponse } from '../../../lib/api';

export function DesktopMemories() {
  const npcStore = useNpcStore();
  const memoryStore = useMemoryStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

  useEffect(() => {
    if (npcStore.npcs.length === 0) npcStore.fetchNpcs();
  }, []);

  useEffect(() => {
    if (selectedNpcId) {
      memoryStore.fetchMemories(selectedNpcId, 1, 50);
    }
  }, [selectedNpcId]);

  // Auto-select first NPC
  useEffect(() => {
    if (!selectedNpcId && npcStore.npcs.length > 0) {
      setSelectedNpcId(npcStore.npcs[0].id);
    }
  }, [npcStore.npcs, selectedNpcId]);

  const filters = ['episodic', 'semantic', 'procedural', 'emotional'];

  const filtered = memoryStore.memories.filter(m =>
    (filterType ? m.type === filterType : true) &&
    m.content.toLowerCase().includes(search.toLowerCase())
  );

  const npcName = (npcId: string) => npcStore.npcs.find(n => n.id === npcId)?.name ?? 'NPC';

  const vividnessPercent = (v: number) => Math.round(v * 100);

  const getRelativeTime = (dateStr: string): string => {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto h-full flex flex-col">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-white tracking-tight">Memories</h2>
          <p className="text-[#8E8E93] text-[15px]">Semantic Cortex Explorer</p>
        </div>

        <div className="flex items-center gap-4">
          {/* NPC Selector */}
          <select
            value={selectedNpcId ?? ''}
            onChange={(e) => setSelectedNpcId(e.target.value || null)}
            className="px-3 py-2 bg-[#1C1C1E] border border-[#38383A] rounded-lg text-white text-[13px] outline-none focus:border-[#05b6f8]"
          >
            {npcStore.npcs.map(npc => (
              <option key={npc.id} value={npc.id}>{npc.name}</option>
            ))}
          </select>

          <div className="flex bg-[#1C1C1E] p-1 rounded-lg border border-[#38383A]">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilterType(filterType === f ? null : f)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium capitalize transition-all ${
                  filterType === f ? 'bg-[#05b6f8] text-white shadow-lg' : 'text-[#8E8E93] hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

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
        </div>
      </div>

      {memoryStore.isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="text-[#05b6f8] animate-spin" />
        </div>
      ) : memoryStore.error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400 text-[14px]">{memoryStore.error}</p>
        </div>
      ) : (
        <MacCard className="flex-1 flex flex-col min-h-0">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-[#8E8E93] text-[14px]">
                {selectedNpcId ? 'No memories found' : 'Select an NPC'}
              </div>
            ) : (
              <MacTable headers={['Type', 'Content', 'Vividness', 'Importance', 'Date']}>
                {filtered.map((mem) => (
                  <MacTableRow key={mem.id} onClick={() => {}}>
                    <div className="flex-none w-[120px] flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        mem.type === 'episodic' ? 'bg-[#05b6f8]' :
                        mem.type === 'semantic' ? 'bg-[#AF52DE]' :
                        mem.type === 'emotional' ? 'bg-[#FF453A]' : 'bg-[#FF9500]'
                      }`} />
                      <span className="text-[14px] font-medium text-white capitalize">{mem.type}</span>
                    </div>

                    <div className="flex-1 pr-8">
                      <p className="text-[14px] text-[#EBEBF5] line-clamp-2">{mem.content}</p>
                    </div>

                    <div className="flex-none w-[150px] pr-8">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap size={12} className={vividnessPercent(mem.vividness) > 70 ? 'text-[#34C759]' : 'text-[#8E8E93]'} />
                        <span className="text-[12px] font-mono text-[#8E8E93]">{vividnessPercent(mem.vividness)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#38383A] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${vividnessPercent(mem.vividness)}%`,
                            backgroundColor: vividnessPercent(mem.vividness) > 80 ? '#34C759' : vividnessPercent(mem.vividness) > 40 ? '#FF9500' : '#8E8E93'
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex-none w-[100px]">
                      <span className={`text-[12px] font-medium px-2 py-0.5 rounded capitalize ${
                        mem.importance === 'critical' ? 'bg-[#FF453A]/10 text-[#FF453A]' :
                        mem.importance === 'significant' ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                        'bg-[#38383A] text-[#8E8E93]'
                      }`}>
                        {mem.importance}
                      </span>
                    </div>

                    <div className="flex-none w-[100px] text-right">
                      <span className="text-[13px] text-[#8E8E93]">{getRelativeTime(mem.created_at)}</span>
                    </div>
                  </MacTableRow>
                ))}
              </MacTable>
            )}
          </div>
        </MacCard>
      )}
    </div>
  );
}
