import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, MessageCircle, BarChart3, Settings, Key, Users, Radio, LogOut, ChevronRight, Search, Copy, RotateCw, Eye, EyeOff, Plus, Trash2, Shield, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { NavigationHeader } from './NavigationHeader';
import { useAuthStore } from '../../stores/auth.store';
import { useMemoryStore } from '../../stores/memory.store';
import { useConversationStore } from '../../stores/conversation.store';
import { useStatsStore } from '../../stores/stats.store';
import { useProjectStore } from '../../stores/project.store';
import { useTeamStore } from '../../stores/team.store';
import { useNpcStore } from '../../stores/npc.store';
import { getRelativeTime, getNpcAvatar } from '../../lib/utils';
import { useChannelStore } from '../../stores/channel.store';
import type { MemoryResponse } from '../../lib/api';
import { toast } from 'sonner';

type MoreScreenId = 'menu' | 'memories' | 'conversations' | 'analytics' | 'settings' | 'api-keys' | 'team' | 'channels';

const MEMORY_TYPE_LABELS: Record<string, string> = {
  episodic: 'Episodic', semantic: 'Semantic', procedural: 'Procedural', emotional: 'Emotional',
};
const MEMORY_TYPE_COLORS: Record<string, string> = {
  episodic: '#05b6f8', semantic: '#34C759', procedural: '#FF9500', emotional: '#FF6B6B',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'Active', ended: 'Ended', archived: 'Archived',
};
const STATUS_COLORS: Record<string, string> = {
  active: '#34C759', ended: '#8E8E93', archived: '#FF9500',
};

const menuItems = [
  { id: 'memories' as MoreScreenId, label: 'Memories', icon: Brain, section: 'Data' },
  { id: 'conversations' as MoreScreenId, label: 'Conversations', icon: MessageCircle, section: 'Data' },
  { id: 'analytics' as MoreScreenId, label: 'Analytics', icon: BarChart3, section: 'Data' },
  { id: 'settings' as MoreScreenId, label: 'Settings', icon: Settings, section: 'Admin' },
  { id: 'api-keys' as MoreScreenId, label: 'API Keys', icon: Key, section: 'Admin' },
  { id: 'channels' as MoreScreenId, label: 'Channels', icon: Radio, section: 'Admin' },
  { id: 'team' as MoreScreenId, label: 'Team', icon: Users, section: 'Admin' },
];

function findNpcName(npcs: { id: string; name: string }[], npcId: string): string {
  return npcs.find((n) => n.id === npcId)?.name ?? 'Unknown NPC';
}

function LoadingSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Loader2 size={24} className="animate-spin text-primary" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-[15px] text-muted-foreground">{message}</p>
    </div>
  );
}

function NpcSelector({ selectedNpcId, onSelect }: { selectedNpcId: string | null; onSelect: (id: string) => void }) {
  const { npcs, fetchNpcs, isLoading } = useNpcStore();

  useEffect(() => {
    fetchNpcs();
  }, [fetchNpcs]);

  if (isLoading && npcs.length === 0) {
    return (
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto touch-pan-x no-scrollbar">
        <div className="px-3 py-1.5 rounded-full flex-shrink-0 text-[13px] font-medium bg-white/10 text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (npcs.length === 0) {
    return (
      <div className="px-4 pb-3">
        <p className="text-[13px] text-muted-foreground">No NPCs available</p>
      </div>
    );
  }

  return (
    <div className="flex gap-2 px-4 pb-3 overflow-x-auto touch-pan-x no-scrollbar">
      {npcs.map((npc) => (
        <button
          key={npc.id}
          className="px-3 py-1.5 rounded-full flex-shrink-0 text-[13px] font-medium transition-colors flex items-center gap-1.5"
          style={{
            backgroundColor: selectedNpcId === npc.id ? '#05b6f8' : 'rgba(255,255,255,0.06)',
            color: selectedNpcId === npc.id ? '#FFFFFF' : '#8E8E93'
          }}
          onClick={() => onSelect(npc.id)}
        >
          <span>{getNpcAvatar(npc.name)}</span>
          {npc.name}
        </button>
      ))}
    </div>
  );
}

export function MoreScreen() {
  const { logout } = useAuthStore();
  const [subScreen, setSubScreen] = useState<MoreScreenId>('menu');

  const goBack = () => setSubScreen('menu');

  if (subScreen !== 'menu') {
    switch (subScreen) {
      case 'memories': return <MemoriesView onBack={goBack} />;
      case 'conversations': return <ConversationsView onBack={goBack} />;
      case 'analytics': return <AnalyticsView onBack={goBack} />;
      case 'settings': return <SettingsView onBack={goBack} />;
      case 'api-keys': return <ApiKeysView onBack={goBack} />;
      case 'channels': return <ChannelsView onBack={goBack} />;
      case 'team': return <TeamView onBack={goBack} />;
    }
  }

  const sections = ['Data', 'Admin'];

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <NavigationHeader title="More" largeTitle />
      <div className="flex-1 min-h-0 pb-6 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar">
        {sections.map((section) => (
          <div key={section} className="mt-6">
            <p className="px-5 mb-2 text-[13px] text-muted-foreground uppercase tracking-wider font-medium">
              {section}
            </p>
            <div className="mx-4 rounded-xl overflow-hidden bg-card shadow-sm border border-white/5">
              {menuItems.filter((item) => item.section === section).map((item, i, arr) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 px-4 min-h-[48px] text-left active:bg-white/5 transition-colors ${i < arr.length - 1 ? 'border-b border-white/5' : ''}`}
                    onClick={() => setSubScreen(item.id)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10">
                      <Icon size={18} className="text-primary" />
                    </div>
                    <span className="flex-1 text-[16px] text-foreground font-normal">
                      {item.label}
                    </span>
                    <ChevronRight size={18} className="text-zinc-500" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <div className="mt-8 mx-4">
          <button
            className="w-full rounded-xl flex items-center justify-center gap-2 min-h-[48px] bg-card text-destructive text-[16px] font-semibold shadow-sm active:bg-white/5 transition-colors border border-white/5"
            onClick={() => { logout(); toast.success('Signed out'); }}
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
        <p className="text-center mt-8 mb-4 text-[11px] text-muted-foreground tracking-wide whitespace-pre-line">
          MemoryWeave v1.0.0{'\n'}2026 ClawdBlox — MIT License
        </p>
      </div>
    </div>
  );
}

function MemoriesView({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<MemoryResponse | null>(null);
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const { npcs } = useNpcStore();
  const { memories, fetchMemories, isLoading } = useMemoryStore();

  const types = Object.keys(MEMORY_TYPE_LABELS);
  const importanceLabels: Record<string, string> = { trivial: 'Trivial', minor: 'Minor', moderate: 'Moderate', significant: 'Significant', critical: 'Critical' };

  const handleSelectNpc = useCallback((npcId: string) => {
    setSelectedNpcId(npcId);
    fetchMemories(npcId);
  }, [fetchMemories]);

  const filtered = memories.filter((m) => (!filterType || m.type === filterType) && (!search || m.content.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <NavigationHeader title="Memories" showBack backTitle="More" onBack={onBack} />
      <div className="px-4 py-3 bg-background sticky top-[44px] z-10">
        <div className="flex items-center gap-2 px-3 rounded-xl h-[36px] bg-white/10">
          <Search size={16} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[15px] text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>
      <NpcSelector selectedNpcId={selectedNpcId} onSelect={handleSelectNpc} />
      {selectedNpcId && (
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto touch-pan-x no-scrollbar">
          <button
            className={`px-3 py-1.5 rounded-full flex-shrink-0 text-[13px] font-medium transition-colors ${!filterType ? 'bg-primary text-white' : 'bg-white/10 text-muted-foreground'}`}
            onClick={() => setFilterType(null)}
          >
            All ({memories.length})
          </button>
          {types.map((type) => (
            <button
              key={type}
              className="px-3 py-1.5 rounded-full flex-shrink-0 text-[13px] font-medium transition-colors"
              style={{
                backgroundColor: filterType === type ? MEMORY_TYPE_COLORS[type] : 'rgba(255,255,255,0.06)',
                color: filterType === type ? '#FFFFFF' : '#8E8E93'
              }}
              onClick={() => setFilterType(filterType === type ? null : type)}
            >
              {MEMORY_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 min-h-0 px-4 pb-6 space-y-3 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar">
        {!selectedNpcId && (
          <EmptyState message="Select an NPC to see its memories" />
        )}
        {selectedNpcId && isLoading && <LoadingSpinner />}
        {selectedNpcId && !isLoading && filtered.length === 0 && (
          <EmptyState message="No memories found" />
        )}
        {selectedNpcId && !isLoading && filtered.map((mem) => (
          <button
            key={mem.id}
            className="w-full p-4 rounded-xl text-left bg-card active:bg-white/10 transition-colors border border-white/5"
            onClick={() => setSelectedMemory(mem)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ color: MEMORY_TYPE_COLORS[mem.type], backgroundColor: `${MEMORY_TYPE_COLORS[mem.type]}18` }}
              >
                {MEMORY_TYPE_LABELS[mem.type]}
              </span>
              <span className="text-[12px] text-muted-foreground">{findNpcName(npcs, mem.npc_id)}</span>
              <span className="ml-auto text-[12px] text-zinc-500">{getRelativeTime(mem.created_at)}</span>
            </div>
            <p className="line-clamp-2 text-[15px] text-foreground leading-relaxed">{mem.content}</p>
            <div className="flex items-center gap-2 mt-2 w-full">
              <div className="flex-1 rounded-full overflow-hidden h-1 bg-white/10">
                <div className="h-full rounded-full bg-primary" style={{ width: `${mem.vividness * 100}%` }} />
              </div>
              <span className="text-[11px] text-muted-foreground">{Math.round(mem.vividness * 100)}%</span>
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {selectedMemory && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMemory(null)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] p-6 bg-card max-h-[70vh] shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6 bg-zinc-600/50" />
              <p className="text-[20px] font-bold text-foreground mb-4">Memory detail</p>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-full text-[12px] font-semibold" style={{ color: MEMORY_TYPE_COLORS[selectedMemory.type], backgroundColor: `${MEMORY_TYPE_COLORS[selectedMemory.type]}18` }}>
                    {MEMORY_TYPE_LABELS[selectedMemory.type]}
                  </span>
                  <span className="px-2 py-1 rounded-full text-[12px] text-muted-foreground bg-white/5">
                    {importanceLabels[selectedMemory.importance] ?? selectedMemory.importance}
                  </span>
                </div>
                <p className="text-[16px] text-foreground leading-relaxed">{selectedMemory.content}</p>
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="flex justify-between"><span className="text-[14px] text-muted-foreground">NPC</span><span className="text-[14px] text-foreground">{findNpcName(npcs, selectedMemory.npc_id)}</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-muted-foreground">Vividness</span><span className="text-[14px] text-foreground">{Math.round(selectedMemory.vividness * 100)}%</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-muted-foreground">Importance</span><span className="text-[14px] text-foreground">{importanceLabels[selectedMemory.importance] ?? selectedMemory.importance}</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-muted-foreground">Access</span><span className="text-[14px] text-foreground">{selectedMemory.access_count} times</span></div>
                  <div className="flex justify-between"><span className="text-[14px] text-muted-foreground">Date</span><span className="text-[14px] text-foreground">{getRelativeTime(selectedMemory.created_at)}</span></div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConversationsView({ onBack }: { onBack: () => void }) {
  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const { npcs } = useNpcStore();
  const { conversations, fetchConversations, isLoading } = useConversationStore();

  const handleSelectNpc = useCallback((npcId: string) => {
    setSelectedNpcId(npcId);
    fetchConversations(npcId);
  }, [fetchConversations]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <NavigationHeader title="Conversations" showBack backTitle="More" onBack={onBack} />
      <div className="pt-3">
        <NpcSelector selectedNpcId={selectedNpcId} onSelect={handleSelectNpc} />
      </div>
      <div className="flex-1 min-h-0 px-4 pb-6 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar">
        {!selectedNpcId && (
          <EmptyState message="Select an NPC to see its conversations" />
        )}
        {selectedNpcId && isLoading && <LoadingSpinner />}
        {selectedNpcId && !isLoading && conversations.length === 0 && (
          <EmptyState message="No conversations found" />
        )}
        {selectedNpcId && !isLoading && conversations.length > 0 && (
          <div className="rounded-xl overflow-hidden bg-card border border-white/5">
            {conversations.map((conv, i) => (
              <div
                key={conv.id}
                className={`w-full flex items-center gap-3 px-4 min-h-[60px] text-left transition-colors ${i < conversations.length - 1 ? 'border-b border-white/5' : ''}`}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-background text-[20px]">
                  {getNpcAvatar(findNpcName(npcs, conv.npc_id))}
                </div>
                <div className="flex-1 min-w-0 py-2">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[15px] font-semibold text-foreground">{findNpcName(npcs, conv.npc_id)}</span>
                    <span className="text-[12px] text-muted-foreground">{getRelativeTime(conv.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[11px] font-semibold"
                      style={{ color: STATUS_COLORS[conv.status], backgroundColor: `${STATUS_COLORS[conv.status]}18` }}
                    >
                      {STATUS_LABELS[conv.status]}
                    </span>
                    <span className="text-[13px] text-muted-foreground truncate">
                      Player: {conv.player_id.length > 16 ? `${conv.player_id.slice(0, 16)}...` : conv.player_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[12px] text-zinc-500">{conv.message_count} messages</span>
                    {conv.summary && <span className="text-[12px] text-zinc-500 truncate">{conv.summary}</span>}
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsView({ onBack }: { onBack: () => void }) {
  const { stats, fetchStats, isLoading } = useStatsStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <NavigationHeader title="Analytics" showBack backTitle="More" onBack={onBack} />
      <div className="flex-1 min-h-0 px-4 pb-6 pt-3 space-y-4 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar">
        {isLoading && <LoadingSpinner />}
        {!isLoading && !stats && (
          <EmptyState message="Failed to load statistics" />
        )}
        {!isLoading && stats && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl text-center bg-card border border-white/5">
                <p className="text-[28px] font-bold text-primary">{stats.npcs.total}</p>
                <p className="text-[13px] text-muted-foreground">Total NPCs</p>
              </div>
              <div className="p-4 rounded-xl text-center bg-card border border-white/5">
                <p className="text-[28px] font-bold text-[#34C759]">{stats.conversations.total}</p>
                <p className="text-[13px] text-muted-foreground">Total conversations</p>
              </div>
              <div className="p-4 rounded-xl text-center bg-card border border-white/5">
                <p className="text-[28px] font-bold text-[#FF9500]">{stats.conversations.active}</p>
                <p className="text-[13px] text-muted-foreground">Active conversations</p>
              </div>
              <div className="p-4 rounded-xl text-center bg-card border border-white/5">
                <p className="text-[28px] font-bold text-[#FF6B6B]">{stats.memories.total}</p>
                <p className="text-[13px] text-muted-foreground">Total memories</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-white/5">
              <p className="text-[15px] font-semibold text-foreground mb-3">Memories</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-muted-foreground">Total</span>
                  <span className="text-[14px] font-semibold text-foreground">{stats.memories.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-muted-foreground">Average vividness</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 rounded-full overflow-hidden h-1.5 bg-white/10">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${(stats.memories.avg_vividness ?? 0) * 100}%` }} />
                    </div>
                    <span className="text-[14px] font-semibold text-foreground">{Math.round((stats.memories.avg_vividness ?? 0) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-card border border-white/5">
              <p className="text-[15px] font-semibold text-foreground mb-3">Relationships</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-muted-foreground">Total</span>
                  <span className="text-[14px] font-semibold text-foreground">{stats.relationships.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-muted-foreground">Average affinity</span>
                  <span className="text-[14px] font-semibold text-foreground">{stats.relationships.avg_affinity.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-muted-foreground">Average trust</span>
                  <span className="text-[14px] font-semibold text-foreground">{stats.relationships.avg_trust.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] text-muted-foreground">Average familiarity</span>
                  <span className="text-[14px] font-semibold text-foreground">{stats.relationships.avg_familiarity.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SettingsView({ onBack }: { onBack: () => void }) {
  const { project, fetchProject, updateProject, isLoading } = useProjectStore();
  const [projectName, setProjectName] = useState('');
  const [groqApiKey, setGroqApiKey] = useState('');
  const [model, setModel] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setModel(project.settings.groq_chat_model ?? 'llama-3.3-70b-versatile');
    }
  }, [project]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateProject({
      name: projectName,
      ...(groqApiKey.trim() ? { groq_api_key: groqApiKey.trim() } : {}),
      settings: {
        groq_chat_model: model,
      },
    });
    setIsSaving(false);
    if (success) {
      setGroqApiKey('');
      toast.success('Settings saved');
    } else {
      toast.error('Save failed');
    }
  };

  if (isLoading && !project) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-background">
        <NavigationHeader title="Settings" showBack backTitle="More" onBack={onBack} />
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <NavigationHeader title="Settings" showBack backTitle="More" onBack={onBack} />
      <div className="flex-1 min-h-0 pb-6 pt-4 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar">
        <p className="px-4 mb-2 text-[13px] text-muted-foreground uppercase tracking-wider font-medium">Project</p>
        <div className="mx-4 rounded-xl overflow-hidden bg-card border border-white/5">
          <div className="px-4 py-3 border-b border-white/5">
            <label className="text-[13px] text-muted-foreground">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-transparent outline-none mt-1 text-[16px] text-foreground"
            />
          </div>
          <div className="px-4 py-3 border-b border-white/5">
            <label className="text-[13px] text-muted-foreground">AI Provider</label>
            <select
              value="groq"
              disabled
              className="w-full bg-transparent outline-none mt-1 text-[16px] text-foreground"
            >
              <option value="groq">Groq</option>
            </select>
          </div>
          <div className="px-4 py-3 border-b border-white/5">
            <label className="text-[13px] text-muted-foreground">Groq API Key (BYOK)</label>
            <input
              type="password"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              placeholder="gsk_... (leave blank to keep current)"
              className="w-full bg-transparent outline-none mt-1 text-[16px] text-foreground placeholder-zinc-600 font-mono"
            />
          </div>
          <div className="px-4 py-3 border-b border-white/5">
            <label className="text-[13px] text-muted-foreground">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-transparent outline-none mt-1 text-[16px] text-foreground font-mono"
            />
          </div>
          <div className="px-4 py-3">
            <p className="text-[15px] text-foreground">PLAYER_AUTH_REQUIRED</p>
            <p className="text-[12px] text-muted-foreground">Server environment variable (not editable here)</p>
          </div>
        </div>
        <div className="mt-6 mx-4">
          <button
            className="w-full py-3 rounded-xl bg-primary text-white text-[16px] font-semibold active:opacity-90 transition-opacity flex items-center justify-center gap-2"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 size={18} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function ApiKeysView({ onBack }: { onBack: () => void }) {
  const { project, fetchProject, rotateApiKey, rotateSigningSecret } = useProjectStore();
  const [showSecret, setShowSecret] = useState(false);
  const [isRotatingKey, setIsRotatingKey] = useState(false);
  const [isRotatingSecret, setIsRotatingSecret] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  useEffect(() => {
    if (!project) fetchProject();
  }, [project, fetchProject]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    toast.success(`${label} copied`);
  };

  const handleRotateKey = async () => {
    setIsRotatingKey(true);
    const key = await rotateApiKey();
    setIsRotatingKey(false);
    if (key) {
      setNewApiKey(key);
      toast.success('API key rotated');
    } else {
      toast.error('Rotation failed');
    }
  };

  const handleRotateSecret = async () => {
    setIsRotatingSecret(true);
    const secret = await rotateSigningSecret();
    setIsRotatingSecret(false);
    if (secret) {
      toast.success('Signing secret rotated');
    } else {
      toast.error('Rotation failed');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <NavigationHeader title="API Keys" showBack backTitle="More" onBack={onBack} />
      <div className="flex-1 min-h-0 pb-6 pt-4 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar">
        {!project && <LoadingSpinner />}
        {project && (
          <>
            <p className="px-4 mb-2 text-[13px] text-muted-foreground uppercase tracking-wider font-medium">API Key</p>
            <div className="mx-4 rounded-xl overflow-hidden bg-card border border-white/5">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-foreground">Primary key</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(project.api_key_prefix, 'API Key prefix')} className="p-1.5 rounded-lg active:bg-white/10"><Copy size={16} className="text-primary" /></button>
                    <button onClick={handleRotateKey} disabled={isRotatingKey} className="p-1.5 rounded-lg active:bg-white/10">
                      {isRotatingKey ? <Loader2 size={16} className="animate-spin text-[#FF9500]" /> : <RotateCw size={16} className="text-[#FF9500]" />}
                    </button>
                  </div>
                </div>
                <p className="text-[14px] text-muted-foreground font-mono mt-1">{project.api_key_prefix}***</p>
                <p className="text-[12px] text-zinc-500 mt-1">Active key prefix</p>
              </div>
            </div>

            <AnimatePresence>
              {newApiKey && (
                <motion.div
                  className="mx-4 mt-3 p-4 rounded-xl bg-card border border-white/5"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-start gap-2 p-3 rounded-lg mb-3 bg-[#FF9500]/10">
                    <AlertTriangle size={16} className="text-[#FF9500] shrink-0 mt-0.5" />
                    <p className="text-[12px] text-[#FFB340] leading-snug">
                      New key generated. Copy it now — it won't be shown again.
                    </p>
                  </div>
                  <code className="block w-full p-3 rounded-lg mb-3 text-[13px] font-mono bg-white/5 text-foreground break-all">
                    {newApiKey}
                  </code>
                  <button
                    onClick={() => { handleCopy(newApiKey, 'New API Key'); setNewApiKey(null); }}
                    className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 bg-primary text-white text-[15px] font-semibold active:opacity-90 transition-opacity"
                  >
                    <Copy size={16} />Copy and close
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="px-4 mt-6 mb-2 text-[13px] text-muted-foreground uppercase tracking-wider font-medium">PLAYER_SIGNING_SECRET</p>
            <div className="mx-4 rounded-xl p-4 bg-card border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-[#FF9500]" />
                <span className="text-[15px] font-semibold text-foreground">Signing secret</span>
                <button onClick={handleRotateSecret} disabled={isRotatingSecret} className="ml-auto p-1.5 rounded-lg active:bg-white/10">
                  {isRotatingSecret ? <Loader2 size={16} className="animate-spin text-[#FF9500]" /> : <RotateCw size={16} className="text-[#FF9500]" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 px-3 py-2 rounded-lg text-[13px] font-mono bg-white/5 text-muted-foreground break-all">
                  {showSecret ? project.player_signing_secret : '\u2022'.repeat(32)}
                </code>
                <button onClick={() => { setShowSecret(true); setTimeout(() => setShowSecret(false), 10000); }} className="p-2 rounded-lg active:bg-white/10">
                  {showSecret ? <EyeOff size={18} className="text-zinc-500" /> : <Eye size={18} className="text-zinc-500" />}
                </button>
                <button onClick={() => handleCopy(project.player_signing_secret, 'Secret')} className="p-2 rounded-lg active:bg-white/10">
                  <Copy size={18} className="text-primary" />
                </button>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#FF9500]/10">
                <AlertTriangle size={16} className="text-[#FF9500] shrink-0 mt-0.5" />
                <p className="text-[12px] text-[#FFB340] leading-snug">
                  This secret must match the one in your Roblox ServerScript. Never share it publicly.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TeamView({ onBack }: { onBack: () => void }) {
  const { members, fetchMembers, createMember, isLoading } = useTeamStore();
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDisplayName, setInviteDisplayName] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [isCreating, setIsCreating] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const roleColors: Record<string, string> = { owner: '#FF9500', editor: '#05b6f8', viewer: '#CFD2D5' };

  const handleInvite = async () => {
    setIsCreating(true);
    const user = await createMember({
      email: inviteEmail,
      password: invitePassword,
      display_name: inviteDisplayName,
      role: inviteRole,
    });
    setIsCreating(false);
    if (user) {
      setCreatedSuccess(true);
    } else {
      toast.error('Failed to create member');
    }
  };

  const resetSheet = () => {
    setShowInviteSheet(false);
    setCreatedSuccess(false);
    setInviteEmail('');
    setInviteDisplayName('');
    setInvitePassword('');
    setInviteRole('editor');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <NavigationHeader title="Team" showBack backTitle="More" onBack={onBack} rightAction={<button onClick={() => setShowInviteSheet(true)}><Plus size={22} className="text-primary" /></button>} />
      <div className="flex-1 min-h-0 pb-6 pt-4 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar">
        <p className="px-4 mb-2 text-[13px] text-muted-foreground uppercase tracking-wider font-medium">Members</p>
        {isLoading && members.length === 0 && <LoadingSpinner />}
        {!isLoading && members.length === 0 && (
          <EmptyState message="No members found" />
        )}
        {members.length > 0 && (
          <div className="mx-4 rounded-xl overflow-hidden bg-card border border-white/5">
            {members.map((member, i) => (
              <div key={member.id} className={`flex items-center gap-3 px-4 py-3 ${i < members.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-background text-[14px] font-bold text-muted-foreground">
                  {getInitials(member.display_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-semibold text-foreground">{member.display_name}</p>
                    {!member.is_active && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400">inactive</span>
                    )}
                  </div>
                  <p className="truncate text-[13px] text-muted-foreground">{member.email}</p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[12px] font-semibold"
                  style={{ color: roleColors[member.role], backgroundColor: `${roleColors[member.role]}18` }}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {showInviteSheet && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetSheet}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] p-6 bg-card"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6 bg-zinc-600/50" />
              <p className="text-[20px] font-bold text-foreground mb-4">Add a member</p>
              {!createdSuccess ? (
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none bg-white/5 text-[16px] text-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Display name"
                    value={inviteDisplayName}
                    onChange={(e) => setInviteDisplayName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none bg-white/5 text-[16px] text-foreground"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl outline-none bg-white/5 text-[16px] text-foreground"
                  />
                  <div className="flex gap-2">
                    {(['editor', 'viewer'] as const).map((role) => (
                      <button
                        key={role}
                        className="flex-1 py-2.5 rounded-xl transition-colors text-[15px] font-semibold"
                        style={{
                          backgroundColor: inviteRole === role ? '#05b6f8' : 'rgba(255,255,255,0.06)',
                          color: inviteRole === role ? '#FFFFFF' : '#8E8E93'
                        }}
                        onClick={() => setInviteRole(role)}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim() || !inviteDisplayName.trim() || !invitePassword.trim() || isCreating}
                    className={`w-full py-3 rounded-xl mt-2 text-[16px] font-semibold active:opacity-90 transition-opacity flex items-center justify-center gap-2 ${inviteEmail.trim() && inviteDisplayName.trim() && invitePassword.trim() ? 'bg-primary text-white' : 'bg-white/10 text-muted-foreground'}`}
                  >
                    {isCreating && <Loader2 size={18} className="animate-spin" />}
                    Create member
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#34C759]/10">
                    <Check size={16} className="text-[#34C759]" />
                    <p className="text-[13px] text-[#34C759]">Member created successfully! They can now sign in with their credentials.</p>
                  </div>
                  <button
                    onClick={resetSheet}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 bg-primary text-white text-[16px] font-semibold active:opacity-90 transition-opacity"
                  >
                    Close
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChannelsView({ onBack }: { onBack: () => void }) {
  const { bindings, fetchBindings, createBinding, deleteBinding, isLoading } = useChannelStore();
  const { npcs, fetchNpcs } = useNpcStore();
  const [showSheet, setShowSheet] = useState(false);
  const [npcId, setNpcId] = useState('');
  const [platform, setPlatform] = useState<'discord' | 'telegram'>('discord');
  const [channelId, setChannelId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBindings();
    fetchNpcs();
  }, [fetchBindings, fetchNpcs]);

  const getChannelNpcName = (id: string) => npcs.find((n) => n.id === id)?.name ?? id.slice(0, 8);

  const handleCreate = async () => {
    if (!npcId || !channelId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    const binding = await createBinding({ npc_id: npcId, platform, platform_channel_id: channelId.trim() });
    setIsSubmitting(false);
    if (binding) {
      toast.success('Binding created');
      setShowSheet(false);
      setNpcId('');
      setChannelId('');
    } else {
      toast.error('Creation failed');
    }
  };

  const handleDelete = async (b: typeof bindings[0]) => {
    const success = await deleteBinding(b.npc_id, b.platform, b.platform_channel_id);
    if (success) toast.success('Binding deleted');
    else toast.error('Deletion failed');
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <NavigationHeader
        title="Channels"
        showBack
        backTitle="More"
        onBack={onBack}
        rightAction={<button onClick={() => setShowSheet(true)}><Plus size={22} className="text-primary" /></button>}
      />
      <div className="flex-1 min-h-0 pb-6 pt-4 overflow-y-auto overscroll-contain touch-pan-y no-scrollbar">
        {isLoading && bindings.length === 0 && <LoadingSpinner />}
        {!isLoading && bindings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <Radio size={36} className="text-muted-foreground mb-3" />
            <p className="text-[17px] font-semibold text-foreground text-center">No bindings</p>
            <p className="text-[15px] text-muted-foreground text-center mt-1">Link an NPC to a Discord or Telegram channel</p>
          </div>
        )}
        {bindings.length > 0 && (
          <div className="mx-4 rounded-xl overflow-hidden bg-card border border-white/5">
            {bindings.map((b, i) => (
              <div key={b.id} className={`flex items-center gap-3 px-4 py-3 ${i < bindings.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${b.platform === 'discord' ? 'bg-[#5865F2]/15 text-[#5865F2]' : 'bg-[#0088CC]/15 text-[#0088CC]'}`}>
                      {b.platform}
                    </span>
                    <span className="text-[15px] font-semibold text-foreground">{getChannelNpcName(b.npc_id)}</span>
                  </div>
                  <p className="text-[13px] text-muted-foreground font-mono">{b.platform_channel_id}</p>
                </div>
                <button onClick={() => handleDelete(b)} className="p-2 rounded-lg active:bg-white/10 text-destructive">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSheet(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[20px] p-6 bg-card"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="w-10 h-1 rounded-full mx-auto mb-6 bg-zinc-600/50" />
              <p className="text-[20px] font-bold text-foreground mb-4">New Binding</p>
              <div className="space-y-3">
                <select
                  value={npcId}
                  onChange={(e) => setNpcId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none bg-white/5 text-[16px] text-foreground"
                >
                  <option value="">Select an NPC...</option>
                  {npcs.map((npc) => (
                    <option key={npc.id} value={npc.id}>{npc.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  {(['discord', 'telegram'] as const).map((p) => (
                    <button
                      key={p}
                      className="flex-1 py-2.5 rounded-xl transition-colors text-[15px] font-semibold"
                      style={{
                        backgroundColor: platform === p ? (p === 'discord' ? '#5865F2' : '#0088CC') : 'rgba(255,255,255,0.06)',
                        color: platform === p ? '#FFFFFF' : '#8E8E93',
                      }}
                      onClick={() => setPlatform(p)}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Channel ID"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl outline-none bg-white/5 text-[16px] text-foreground font-mono"
                />
                <button
                  onClick={handleCreate}
                  disabled={!npcId || !channelId.trim() || isSubmitting}
                  className="w-full py-3 rounded-xl mt-2 text-[16px] font-semibold active:opacity-90 transition-opacity flex items-center justify-center gap-2 bg-primary text-white disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  Create binding
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
