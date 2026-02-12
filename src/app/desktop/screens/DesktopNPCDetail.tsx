import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Brain,
  MessageCircle,
  Users,
  Activity,
  Fingerprint,
  MessageSquare,
  Save,
  Loader2,
  Send,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { MacCard, MacInsetSection, MacInputRow } from '../components/MacUI';
import { RelationshipRow } from '../components/RelationshipGauge';
import { RoutineTimeline } from '../components/RoutineTimeline';
import { GoalKanban } from '../components/GoalKanban';
import { useNpcStore } from '../../../stores/npc.store';
import { useMemoryStore } from '../../../stores/memory.store';
import { useLifeStore } from '../../../stores/life.store';
import { useConversationStore } from '../../../stores/conversation.store';
import { toast } from 'sonner';

interface DesktopNPCDetailProps {
  npcId: string;
  onBack: () => void;
}

export function DesktopNPCDetail({ npcId, onBack }: DesktopNPCDetailProps) {
  const npcStore = useNpcStore();
  const memoryStore = useMemoryStore();
  const lifeStore = useLifeStore();
  const convStore = useConversationStore();

  const [activeTab, setActiveTab] = useState<'identity' | 'memories' | 'relationships' | 'life' | 'conversations' | 'chat'>('identity');
  const [isSaving, setIsSaving] = useState(false);

  // Editable form state
  const [editName, setEditName] = useState('');
  const [editBackstory, setEditBackstory] = useState('');

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'player' | 'npc'; content: string }>>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    npcStore.fetchNpc(npcId);
  }, [npcId]);

  useEffect(() => {
    if (npcStore.selectedNpc) {
      setEditName(npcStore.selectedNpc.name);
      setEditBackstory(npcStore.selectedNpc.backstory);
    }
  }, [npcStore.selectedNpc]);

  useEffect(() => {
    if (activeTab === 'memories') memoryStore.fetchMemories(npcId, 1, 50);
    if (activeTab === 'relationships') lifeStore.fetchRelationships(npcId);
    if (activeTab === 'life') {
      lifeStore.fetchRoutines(npcId);
      lifeStore.fetchGoals(npcId);
    }
    if (activeTab === 'conversations') convStore.fetchConversations(npcId);
  }, [activeTab, npcId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const npc = npcStore.selectedNpc;

  if (npcStore.isLoading && !npc) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#05b6f8]" />
      </div>
    );
  }

  if (!npc) {
    return (
      <div className="h-full flex items-center justify-center text-[#8E8E93]">
        NPC not found
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    const result = await npcStore.updateNpc(npcId, {
      name: editName,
      backstory: editBackstory,
    });
    setIsSaving(false);
    if (result) {
      toast.success('NPC updated');
    } else {
      toast.error(npcStore.error ?? 'Save failed');
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const message = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'player', content: message }]);

    const response = await convStore.sendMessage(npcId, message);
    if (response) {
      setChatMessages(prev => [...prev, { role: 'npc', content: response.message }]);
    } else {
      toast.error('Failed to send');
    }
  };

  const tabs = [
    { id: 'identity', label: 'Identity', icon: Fingerprint },
    { id: 'memories', label: 'Memories', icon: Brain },
    { id: 'relationships', label: 'Relations', icon: Users },
    { id: 'life', label: 'Life', icon: Activity },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
  ];

  return (
    <div className="h-full flex flex-col bg-[#1C1C1E]">
      {/* Header */}
      <div className="flex-none px-6 py-4 border-b border-[#38383A] bg-[#1C1C1E]/90 backdrop-blur-xl z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg bg-[#2C2C2E] border border-[#38383A] flex items-center justify-center text-[#8E8E93] hover:text-white hover:bg-[#38383A] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-[16px] font-bold text-[#8E8E93] border border-[#38383A]">
              {npc.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{npc.name}</h2>
              <p className="text-xs text-[#8E8E93] capitalize">{npc.mood} &middot; {npc.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2C2C2E] p-1 rounded-lg border border-[#38383A] flex gap-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2 transition-all ${
                  isActive ? 'bg-[#636366] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white hover:bg-[#38383A]'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'identity' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#05b6f8] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0498d0] transition-colors shadow-lg shadow-[#05b6f8]/20 disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8">
          <div className="max-w-5xl mx-auto pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {/* IDENTITY */}
                {activeTab === 'identity' && (
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-4 space-y-6">
                      <MacCard title="Personality (OCEAN)">
                        <div className="h-[280px] p-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={90} data={[
                              { trait: 'Openness', value: npc.personality.openness * 100 },
                              { trait: 'Conscientiousness', value: npc.personality.conscientiousness * 100 },
                              { trait: 'Extraversion', value: npc.personality.extraversion * 100 },
                              { trait: 'Agreeableness', value: npc.personality.agreeableness * 100 },
                              { trait: 'Neuroticism', value: npc.personality.neuroticism * 100 },
                            ]}>
                              <PolarGrid stroke="#383B44" />
                              <PolarAngleAxis dataKey="trait" tick={{ fill: '#8E8E93', fontSize: 10 }} />
                              <Radar name="Personality" dataKey="value" stroke="#05b6f8" fill="#05b6f8" fillOpacity={0.3} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </MacCard>

                      <MacCard title="Information">
                        <div className="p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[#8E8E93] text-sm">Mood</span>
                            <span className="text-white font-medium capitalize">{npc.mood}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#8E8E93] text-sm">Status</span>
                            <span className={`text-sm font-medium ${npc.is_active ? 'text-[#34C759]' : 'text-[#8E8E93]'}`}>
                              {npc.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#8E8E93] text-sm">Created</span>
                            <span className="text-white text-sm">{new Date(npc.created_at).toLocaleDateString('en-US')}</span>
                          </div>
                        </div>
                      </MacCard>
                    </div>

                    <div className="col-span-8">
                      <MacInsetSection title="General Information">
                        <MacInputRow label="Nom" value={editName} onChange={setEditName} />
                        <div className="p-4">
                          <label className="block text-[15px] font-medium text-white mb-2">Backstory</label>
                          <textarea
                            className="w-full bg-[#2C2C2E] border border-[#38383A] rounded-lg p-3 text-white text-sm focus:border-[#05b6f8] outline-none min-h-[100px]"
                            value={editBackstory}
                            onChange={(e) => setEditBackstory(e.target.value)}
                          />
                        </div>
                      </MacInsetSection>

                      <MacInsetSection title="Speaking Style">
                        <MacInputRow label="Vocabulary" value={npc.speaking_style.vocabulary_level} onChange={() => {}} />
                        <div className="px-4 py-3 flex items-center justify-between">
                          <label className="text-[15px] font-medium text-white">Formality</label>
                          <span className="text-[#05b6f8] text-[14px] capitalize">{npc.speaking_style.formality}</span>
                        </div>
                        <div className="px-4 py-3 flex items-center justify-between">
                          <label className="text-[15px] font-medium text-white">Humour</label>
                          <span className="text-[#05b6f8] text-[14px] capitalize">{npc.speaking_style.humor}</span>
                        </div>
                        {npc.speaking_style.catchphrases.length > 0 && (
                          <div className="p-4 border-t border-[#38383A]/50">
                            <label className="block text-[13px] font-medium text-[#8E8E93] uppercase mb-2">Catchphrases</label>
                            <div className="flex flex-wrap gap-2">
                              {npc.speaking_style.catchphrases.map((phrase, i) => (
                                <span key={i} className="px-3 py-1 bg-[#2C2C2E] border border-[#38383A] rounded-full text-xs text-white">
                                  "{phrase}"
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </MacInsetSection>
                    </div>
                  </div>
                )}

                {/* MEMORIES */}
                {activeTab === 'memories' && (
                  <div className="space-y-6">
                    {memoryStore.isLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-[#05b6f8]" />
                      </div>
                    ) : memoryStore.memories.length === 0 ? (
                      <div className="text-center py-16 text-[#8E8E93]">No memories</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {memoryStore.memories.map(mem => (
                          <div key={mem.id} className="bg-[#1C1C1E] border border-[#38383A] p-4 rounded-xl hover:border-[#05b6f8]/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  mem.type === 'episodic' ? 'bg-purple-500/20 text-purple-400' :
                                  mem.type === 'semantic' ? 'bg-blue-500/20 text-blue-400' :
                                  mem.type === 'emotional' ? 'bg-pink-500/20 text-pink-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                  {mem.type}
                                </span>
                                <span className="text-[#8E8E93] text-xs">
                                  {new Date(mem.created_at).toLocaleString('en-US')}
                                </span>
                              </div>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded capitalize ${
                                mem.importance === 'critical' ? 'bg-[#FF453A]/10 text-[#FF453A]' :
                                mem.importance === 'significant' ? 'bg-[#FF9500]/10 text-[#FF9500]' :
                                'bg-[#38383A] text-[#8E8E93]'
                              }`}>
                                {mem.importance}
                              </span>
                            </div>
                            <p className="text-white/90 text-[15px] leading-relaxed">{mem.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* RELATIONSHIPS */}
                {activeTab === 'relationships' && (
                  <div>
                    <div className="mb-6 flex justify-between items-end">
                      <h3 className="text-white font-bold text-lg">Relations</h3>
                    </div>
                    {lifeStore.isLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-[#05b6f8]" />
                      </div>
                    ) : lifeStore.relationships.length === 0 ? (
                      <div className="text-center py-16 text-[#8E8E93]">No relationships</div>
                    ) : (
                      <div className="space-y-4">
                        {lifeStore.relationships.map(rel => (
                          <RelationshipRow
                            key={rel.id}
                            player={`${rel.target_type === 'player' ? 'Player' : 'NPC'} ${rel.target_id.slice(0, 8)}`}
                            affinity={rel.affinity}
                            trust={rel.trust}
                            familiarity={rel.familiarity}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* LIFE */}
                {activeTab === 'life' && (
                  <div className="space-y-8">
                    {lifeStore.isLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-[#05b6f8]" />
                      </div>
                    ) : (
                      <>
                        <section>
                          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <Activity size={20} className="text-[#05b6f8]" />
                            Daily Routine (24h)
                          </h3>
                          {lifeStore.routines.length === 0 ? (
                            <div className="text-center py-8 text-[#8E8E93]">No routines</div>
                          ) : (
                            <RoutineTimeline routines={lifeStore.routines} />
                          )}
                        </section>

                        <section className="h-[500px]">
                          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            Goals & Quests
                          </h3>
                          {lifeStore.goals.length === 0 ? (
                            <div className="text-center py-8 text-[#8E8E93]">No goals</div>
                          ) : (
                            <GoalKanban goals={lifeStore.goals} />
                          )}
                        </section>
                      </>
                    )}
                  </div>
                )}

                {/* CONVERSATIONS */}
                {activeTab === 'conversations' && (
                  <div className="space-y-4">
                    {convStore.isLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <Loader2 size={24} className="animate-spin text-[#05b6f8]" />
                      </div>
                    ) : convStore.conversations.length === 0 ? (
                      <div className="text-center py-16 text-[#8E8E93]">No conversations</div>
                    ) : (
                      convStore.conversations.map(conv => (
                        <MacCard key={conv.id} className="hover:bg-white/[0.02]" hover>
                          <div className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[14px] font-bold text-[#8E8E93]">
                              {conv.player_id.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-white font-medium">{conv.player_id}</span>
                                <span className="text-[#8E8E93] text-xs">{new Date(conv.created_at).toLocaleDateString('en-US')}</span>
                              </div>
                              {conv.summary && (
                                <p className="text-[#8E8E93] text-sm line-clamp-1 italic">"{conv.summary}"</p>
                              )}
                            </div>
                            <div className="text-xs font-mono text-[#48484A] bg-[#1C1C1E] px-2 py-1 rounded border border-[#38383A]">
                              {conv.message_count} msgs
                            </div>
                          </div>
                        </MacCard>
                      ))
                    )}
                  </div>
                )}

                {/* CHAT */}
                {activeTab === 'chat' && (
                  <div className="h-[calc(100vh-200px)] border border-[#38383A] rounded-xl overflow-hidden flex bg-[#000]">
                    <div className="w-[300px] bg-[#1C1C1E] border-r border-[#38383A] p-4 flex flex-col gap-4">
                      <div className="text-center pb-4 border-b border-[#38383A]">
                        <div className="w-20 h-20 mx-auto bg-[#2C2C2E] rounded-2xl flex items-center justify-center text-[32px] font-bold text-[#8E8E93] mb-3 border border-[#38383A]">
                          {npc.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-white font-bold">{npc.name}</h3>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <span className={`w-2 h-2 rounded-full ${npc.is_active ? 'bg-[#34C759] animate-pulse' : 'bg-[#8E8E93]'}`} />
                          <span className={`text-xs font-medium ${npc.is_active ? 'text-[#34C759]' : 'text-[#8E8E93]'}`}>
                            {npc.is_active ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        <h4 className="text-xs font-semibold text-[#8E8E93] uppercase mb-2">Current mood</h4>
                        <div className="text-sm text-[#D1D1D6] bg-[#2C2C2E] p-3 rounded-lg mb-4 capitalize">
                          {npc.mood}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-[#111111]">
                      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                        {chatMessages.length === 0 && (
                          <div className="flex items-center justify-center h-full text-[#8E8E93] text-sm">
                            Send a message to start the conversation
                          </div>
                        )}
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'player' ? 'justify-end' : 'justify-start items-end gap-2'}`}>
                            {msg.role === 'npc' && (
                              <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-sm font-bold text-[#8E8E93] mb-1">
                                {npc.name.charAt(0)}
                              </div>
                            )}
                            <div className={`px-4 py-2 rounded-2xl max-w-[70%] ${
                              msg.role === 'player'
                                ? 'bg-[#0A84FF] text-white rounded-tr-sm'
                                : 'bg-[#2C2C2E] text-[#E5E5EA] rounded-tl-sm border border-[#38383A]'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {convStore.isSending && (
                          <div className="flex justify-start items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#2C2C2E] flex items-center justify-center text-sm font-bold text-[#8E8E93]">
                              {npc.name.charAt(0)}
                            </div>
                            <div className="bg-[#2C2C2E] text-[#8E8E93] px-4 py-2 rounded-2xl rounded-tl-sm border border-[#38383A]">
                              <Loader2 size={16} className="animate-spin" />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <div className="p-4 bg-[#1C1C1E] border-t border-[#38383A]">
                        <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Send a message..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            disabled={convStore.isSending}
                            className="flex-1 bg-[#2C2C2E] border border-[#38383A] rounded-full px-4 py-2.5 text-white focus:border-[#05b6f8] outline-none disabled:opacity-60"
                          />
                          <button
                            type="submit"
                            disabled={convStore.isSending || !chatInput.trim()}
                            className="p-2.5 bg-[#05b6f8] rounded-full text-white hover:bg-[#0498d0] transition-colors disabled:opacity-60"
                          >
                            <Send size={20} />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
