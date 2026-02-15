import { useState, useEffect } from 'react';
import { MacCard } from '../components/MacUI';
import { MessageCircle, User, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useNpcStore } from '../../../stores/npc.store';
import { useConversationStore } from '../../../stores/conversation.store';

export function DesktopConversations() {
  const npcStore = useNpcStore();
  const convStore = useConversationStore();
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);

  useEffect(() => {
    if (npcStore.npcs.length === 0) npcStore.fetchNpcs();
  }, []);

  useEffect(() => {
    if (!selectedNpcId && npcStore.npcs.length > 0) {
      setSelectedNpcId(npcStore.npcs[0].id);
    }
  }, [npcStore.npcs, selectedNpcId]);

  useEffect(() => {
    if (selectedNpcId) {
      convStore.fetchConversations(selectedNpcId);
    }
  }, [selectedNpcId]);

  const getRelativeTime = (dateStr: string): string => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const npcName = (npcId: string) => npcStore.npcs.find(n => n.id === npcId)?.name ?? 'NPC';

  return (
    <div className="p-8 space-y-6 max-w-[1000px] mx-auto h-full flex flex-col">
      <div data-tutorial="conversations-list" className="flex items-end justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-white tracking-tight">Conversations</h2>
          <p className="text-[#8E8E93] text-[15px]">Complete Player-NPC interaction history</p>
        </div>

        <select
          value={selectedNpcId ?? ''}
          onChange={(e) => setSelectedNpcId(e.target.value || null)}
          className="px-3 py-2 bg-[#1C1C1E] border border-[#38383A] rounded-lg text-white text-[13px] outline-none focus:border-[#05b6f8]"
        >
          {npcStore.npcs.map(npc => (
            <option key={npc.id} value={npc.id}>{npc.name}</option>
          ))}
        </select>
      </div>

      {convStore.isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="text-[#05b6f8] animate-spin" />
        </div>
      ) : convStore.error ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-400 text-[14px]">{convStore.error}</p>
        </div>
      ) : convStore.conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#8E8E93] text-[14px]">
          {selectedNpcId ? 'No conversations found' : 'Select an NPC'}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-8">
          {convStore.conversations.map((conv) => (
            <MacCard key={conv.id} hover className="group" onClick={() => {}}>
              <div className="p-5 flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-[16px] font-bold text-[#8E8E93] shrink-0 border border-[#38383A]">
                  {npcName(conv.npc_id).charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-bold text-white">{npcName(conv.npc_id)}</span>
                      <span className="text-[#8E8E93] text-[13px] flex items-center gap-1">
                        with <User size={12} /> {conv.player_id}
                      </span>
                    </div>
                    <span className="text-[13px] text-[#8E8E93] flex items-center gap-1.5">
                      <Clock size={12} />
                      {getRelativeTime(conv.created_at)}
                    </span>
                  </div>

                  {conv.summary && (
                    <div className="bg-[#2C2C2E]/50 rounded-lg p-3 border border-[#38383A]/30">
                      <p className="text-[15px] text-[#EBEBF5] leading-relaxed line-clamp-2">
                        {conv.summary}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-[13px] text-[#8E8E93]">
                    <span className="flex items-center gap-1.5">
                      <MessageCircle size={14} /> {conv.message_count} exchanges
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[12px] capitalize ${
                      conv.status === 'active' ? 'bg-[#34C759]/10 text-[#34C759]' :
                      conv.status === 'ended' ? 'bg-[#8E8E93]/10 text-[#8E8E93]' :
                      'bg-[#FF9500]/10 text-[#FF9500]'
                    }`}>
                      {conv.status}
                    </span>
                  </div>
                </div>

                <div className="self-center pl-2">
                  <ChevronRight className="text-[#8E8E93] opacity-30 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </div>
              </div>
            </MacCard>
          ))}
        </div>
      )}
    </div>
  );
}
