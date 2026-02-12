import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavigationHeader } from './NavigationHeader';
import { useUIStore } from './app-store';
import { useNpcStore } from '../../stores/npc.store';
import { useMemoryStore } from '../../stores/memory.store';
import { useLifeStore } from '../../stores/life.store';
import { useConversationStore } from '../../stores/conversation.store';
import { getRelativeTime, getNpcAvatar, buildOceanData, OCEAN_KEYS } from '../../lib/utils';
import type { NpcResponse } from '../../lib/api';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Target,
  ChevronRight,
  Loader2,
} from 'lucide-react';

const tabNames = ['Identity', 'Memories', 'Relations', 'Life', 'Conversations', 'Chat'];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin" style={{ color: '#05b6f8' }} />
    </div>
  );
}

function OceanRadarFull({ personality }: { personality: Record<string, number> }) {
  const data = buildOceanData(personality, 'full');

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#383B44" />
        <PolarAngleAxis
          dataKey="trait"
          tick={{ fontSize: 11, fill: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}
        />
        <PolarRadiusAxis angle={90} domain={[0, 1]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke="#05b6f8"
          fill="#05b6f8"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function VividnessBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: '6px', backgroundColor: '#383B44' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${value * 100}%`,
            background: `linear-gradient(90deg, #05b6f8, ${value > 0.7 ? '#34C759' : '#FF9500'})`,
          }}
        />
      </div>
      <span style={{ fontSize: '12px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif', minWidth: '32px' }}>
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function RelationshipGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - value);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#383B44" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <text
          x="32"
          y="32"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: '13px', fontWeight: 600, fill: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}
        >
          {Math.round(value * 100)}
        </text>
      </svg>
      <span style={{ fontSize: '11px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>
        {label}
      </span>
    </div>
  );
}

function GroupedSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p
        className="px-4 mb-1"
        style={{
          fontSize: '13px',
          color: '#CFD2D5',
          fontFamily: 'Inter, sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.02em',
        }}
      >
        {title}
      </p>
      <div className="mx-4 rounded-xl overflow-hidden" style={{ backgroundColor: '#2E3138' }}>
        {children}
      </div>
    </div>
  );
}

function GroupedRow({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-4"
      style={{
        minHeight: '44px',
        borderBottom: last ? 'none' : '0.5px solid rgba(255,255,255,0.06)',
      }}
    >
      <span style={{ fontSize: '15px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>{label}</span>
      <span style={{ fontSize: '15px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif', maxWidth: '60%', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

function TagChips({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {items.map((item) => (
        <span
          key={item}
          className="px-3 py-1 rounded-full"
          style={{
            fontSize: '13px',
            color,
            backgroundColor: `${color}18`,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// Tab: Identity
function TabIdentity({ npc }: { npc: NpcResponse }) {
  return (
    <div className="pb-4">
      {/* OCEAN Radar */}
      <div className="mx-4 mb-4 p-4 rounded-xl" style={{ backgroundColor: '#2E3138' }}>
        <OceanRadarFull personality={npc.personality} />
        <div className="grid grid-cols-5 gap-1 mt-2">
          {OCEAN_KEYS.map((trait) => (
            <div key={trait} className="text-center">
              <p style={{ fontSize: '11px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>
                {trait.charAt(0).toUpperCase()}
              </p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                {(npc.personality[trait] ?? 0).toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <GroupedSection title="Identity">
        <GroupedRow label="Nom" value={npc.name} />
        <div className="px-4 py-3" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '13px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
            Backstory
          </p>
          <p style={{ fontSize: '15px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
            {npc.backstory}
          </p>
        </div>
        <GroupedRow label="Status" value={
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: npc.is_active ? '#34C759' : '#6B6F78' }} />
            {npc.is_active ? 'Active' : 'Inactive'}
          </span>
        } last />
      </GroupedSection>

      {npc.speaking_style.catchphrases?.length > 0 && (
        <GroupedSection title="Catchphrases">
          <TagChips items={npc.speaking_style.catchphrases} color="#05b6f8" />
        </GroupedSection>
      )}

      {npc.personality.traits?.length > 0 && (
        <GroupedSection title="Traits">
          <TagChips items={npc.personality.traits} color="#FF9500" />
        </GroupedSection>
      )}

      {npc.personality.values?.length > 0 && (
        <GroupedSection title="Values">
          <TagChips items={npc.personality.values} color="#34C759" />
        </GroupedSection>
      )}

      {npc.personality.fears?.length > 0 && (
        <GroupedSection title="Fears">
          <TagChips items={npc.personality.fears} color="#FF6B6B" />
        </GroupedSection>
      )}

      {npc.personality.desires?.length > 0 && (
        <GroupedSection title="Desires">
          <TagChips items={npc.personality.desires} color="#AF52DE" />
        </GroupedSection>
      )}
    </div>
  );
}

// Tab: Memories
function TabMemories({ npcId }: { npcId: string }) {
  const [filterType, setFilterType] = useState<string | null>(null);
  const { memories, isLoading, fetchMemories } = useMemoryStore();

  useEffect(() => {
    fetchMemories(npcId);
  }, [npcId, fetchMemories]);

  const filteredMemories = memories.filter(
    (m) => !filterType || m.type === filterType
  );
  const types = ['episodic', 'semantic', 'procedural', 'emotional'];
  const typeLabels: Record<string, string> = {
    episodic: 'Episodic',
    semantic: 'Semantic',
    procedural: 'Procedural',
    emotional: 'Emotional',
  };
  const typeColors: Record<string, string> = {
    episodic: '#05b6f8',
    semantic: '#34C759',
    procedural: '#FF9500',
    emotional: '#FF6B6B',
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="pb-4">
      <div className="flex gap-2 px-4 py-3" style={{ overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
        <button className="px-3 py-1.5 rounded-full flex-shrink-0 transition-colors"
          style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 500, backgroundColor: !filterType ? '#05b6f8' : 'rgba(255,255,255,0.06)', color: !filterType ? '#FFFFFF' : '#CFD2D5' }}
          onClick={() => setFilterType(null)}>All</button>
        {types.map((type) => (
          <button key={type} className="px-3 py-1.5 rounded-full flex-shrink-0 transition-colors"
            style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 500, backgroundColor: filterType === type ? typeColors[type] : 'rgba(255,255,255,0.06)', color: filterType === type ? '#FFFFFF' : '#CFD2D5' }}
            onClick={() => setFilterType(filterType === type ? null : type)}>{typeLabels[type]}</button>
        ))}
      </div>
      <div className="px-4 space-y-3">
        {filteredMemories.map((mem) => (
          <div key={mem.id} className="p-4 rounded-xl" style={{ backgroundColor: '#2E3138' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: '11px', fontWeight: 600, color: typeColors[mem.type], backgroundColor: `${typeColors[mem.type]}18`, fontFamily: 'Inter, sans-serif' }}>{typeLabels[mem.type]}</span>
              <span className="px-2 py-0.5 rounded-full" style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: mem.importance === 'critical' ? '#FF6B6B' : '#CFD2D5', backgroundColor: mem.importance === 'critical' ? 'rgba(255,107,107,0.12)' : 'rgba(255,255,255,0.06)' }}>{mem.importance}</span>
              <span className="ml-auto" style={{ fontSize: '12px', color: '#6B6F78', fontFamily: 'Inter, sans-serif' }}>{getRelativeTime(mem.created_at)}</span>
            </div>
            <p style={{ fontSize: '15px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>{mem.content}</p>
            <div className="mt-3"><VividnessBar value={mem.vividness} /></div>
          </div>
        ))}
        {filteredMemories.length === 0 && (<p className="text-center py-8" style={{ fontSize: '15px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>No memories found</p>)}
      </div>
    </div>
  );
}

// Tab: Relations
function TabRelations({ npcId }: { npcId: string }) {
  const { relationships, isLoading, fetchRelationships } = useLifeStore();

  useEffect(() => {
    fetchRelationships(npcId);
  }, [npcId, fetchRelationships]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="pb-4 px-4 space-y-3">
      {relationships.map((rel) => {
        const lastInteraction = rel.interaction_history.length > 0
          ? rel.interaction_history[rel.interaction_history.length - 1]
          : null;

        return (
          <div key={rel.id} className="p-4 rounded-xl" style={{ backgroundColor: '#2E3138' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1A0A2E', fontSize: '16px' }}>
                {rel.target_type === 'player' ? '\uD83C\uDFAE' : '\uD83E\uDDD9\u200D\u2642\uFE0F'}
              </div>
              <div>
                <p style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                  {rel.target_type === 'player' ? `Player ${rel.target_id.slice(0, 8)}` : `NPC ${rel.target_id.slice(0, 8)}`}
                </p>
                <p style={{ fontSize: '13px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>
                  {lastInteraction ? getRelativeTime(lastInteraction.timestamp) : getRelativeTime(rel.updated_at)}
                </p>
              </div>
            </div>
            <div className="flex justify-around">
              <RelationshipGauge value={rel.affinity} label="Affinity" color="#FF6B6B" />
              <RelationshipGauge value={rel.trust} label="Trust" color="#34C759" />
              <RelationshipGauge value={rel.familiarity} label="Familiarity" color="#05b6f8" />
            </div>
          </div>
        );
      })}
      {relationships.length === 0 && (<p className="text-center py-8" style={{ fontSize: '15px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>No relationships recorded</p>)}
    </div>
  );
}

// Tab: Life (Routines + Goals)
function TabLife({ npcId }: { npcId: string }) {
  const { routines, goals, isLoading, fetchRoutines, fetchGoals } = useLifeStore();
  const [goalFilter, setGoalFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchRoutines(npcId);
    fetchGoals(npcId);
  }, [npcId, fetchRoutines, fetchGoals]);

  const filteredGoals = goals.filter((g) => !goalFilter || g.status === goalFilter);

  const goalTypeLabels: Record<string, string> = {
    personal: 'Personal',
    professional: 'Professional',
    social: 'Social',
    survival: 'Survival',
    secret: 'Secret',
  };

  const goalTypeColors: Record<string, string> = {
    personal: '#AF52DE',
    professional: '#05b6f8',
    social: '#34C759',
    survival: '#FF9500',
    secret: '#FF6B6B',
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="pb-4">
      <p className="px-4 mb-2 mt-2" style={{ fontSize: '13px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Daily routine</p>
      <div className="mx-4 rounded-xl overflow-hidden mb-5" style={{ backgroundColor: '#2E3138' }}>
        {routines.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3 px-4" style={{ minHeight: '44px', borderBottom: i < routines.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div className="flex flex-col items-center" style={{ width: '40px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#05b6f8', fontFamily: 'JetBrains Mono, monospace' }}>
                {String(r.start_hour).padStart(2, '0')}:00
              </span>
            </div>
            <div className="w-0.5 self-stretch" style={{ backgroundColor: i < routines.length - 1 ? 'rgba(5,182,248,0.2)' : 'transparent' }} />
            <div className="flex-1 py-2">
              <p style={{ fontSize: '15px', color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>{r.name}</p>
              <p style={{ fontSize: '13px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>{r.activity} - {r.location}</p>
            </div>
          </div>
        ))}
        {routines.length === 0 && (<p className="text-center py-4" style={{ fontSize: '15px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>No routines</p>)}
      </div>
      <p className="px-4 mb-2" style={{ fontSize: '13px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Goals</p>
      <div className="flex gap-2 px-4 mb-3">
        {['active', 'completed', 'paused'].map((s) => (
          <button key={s} className="px-3 py-1 rounded-full" style={{ fontSize: '13px', fontFamily: 'Inter, sans-serif', fontWeight: 500, backgroundColor: goalFilter === s ? '#05b6f8' : 'rgba(255,255,255,0.06)', color: goalFilter === s ? '#FFFFFF' : '#CFD2D5' }}
            onClick={() => setGoalFilter(goalFilter === s ? null : s)}>{s === 'active' ? 'Active' : s === 'completed' ? 'Completed' : 'Paused'}</button>
        ))}
      </div>
      <div className="px-4 space-y-3">
        {filteredGoals.map((goal) => (
          <div key={goal.id} className="p-4 rounded-xl" style={{ backgroundColor: '#2E3138' }}>
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} style={{ color: goal.status === 'completed' ? '#34C759' : '#05b6f8' }} />
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>{goal.title}</span>
              <span className="ml-auto px-2 py-0.5 rounded-full" style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: goalTypeColors[goal.goal_type] || '#CFD2D5', backgroundColor: `${goalTypeColors[goal.goal_type] || '#CFD2D5'}18` }}>
                {goalTypeLabels[goal.goal_type] || goal.goal_type}
              </span>
            </div>
            {(goal.success_criteria || []).length > 0 && (
              <div className="mb-2">
                {goal.success_criteria.map((criteria, idx) => (
                  <p key={idx} style={{ fontSize: '13px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>
                    - {criteria}
                  </p>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-full overflow-hidden" style={{ height: '6px', backgroundColor: '#383B44' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${goal.progress * 100}%`, backgroundColor: goal.status === 'completed' ? '#34C759' : '#05b6f8' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>{Math.round(goal.progress * 100)}%</span>
            </div>
          </div>
        ))}
        {filteredGoals.length === 0 && (<p className="text-center py-8" style={{ fontSize: '15px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>No goals</p>)}
      </div>
    </div>
  );
}

// Tab: Conversations
function TabConversations({ npcId }: { npcId: string }) {
  const { conversations, isLoading, fetchConversations } = useConversationStore();

  useEffect(() => {
    fetchConversations(npcId);
  }, [npcId, fetchConversations]);

  if (isLoading) return <LoadingSpinner />;

  const statusLabels: Record<string, string> = {
    active: 'Active',
    ended: 'Ended',
    archived: 'Archived',
  };

  const statusColors: Record<string, string> = {
    active: '#34C759',
    ended: '#6B6F78',
    archived: '#FF9500',
  };

  return (
    <div className="pb-4 px-4">
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#2E3138' }}>
        {conversations.map((conv, i) => (
          <button key={conv.id} className="w-full flex items-center gap-3 px-4 text-left active:bg-white/5"
            style={{ minHeight: '56px', borderBottom: i < conversations.length - 1 ? '0.5px solid rgba(255,255,255,0.06)' : 'none' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1A0A2E', fontSize: '14px' }}>{'\uD83C\uDFAE'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif' }}>
                  Player {conv.player_id.slice(0, 8)}
                </span>
                <span style={{ fontSize: '12px', color: '#6B6F78', fontFamily: 'Inter, sans-serif' }}>{getRelativeTime(conv.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded" style={{ fontSize: '11px', fontFamily: 'Inter, sans-serif', color: statusColors[conv.status] || '#CFD2D5', backgroundColor: `${statusColors[conv.status] || '#CFD2D5'}18` }}>
                  {statusLabels[conv.status] || conv.status}
                </span>
                <p className="truncate" style={{ fontSize: '14px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>
                  {conv.summary || `${conv.message_count} message${conv.message_count > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: '#4A4D55', flexShrink: 0 }} />
          </button>
        ))}
        {conversations.length === 0 && (<p className="text-center py-8" style={{ fontSize: '15px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif' }}>No conversations</p>)}
      </div>
    </div>
  );
}

// Tab: Chat (inline from detail)
function TabChat({ npc }: { npc: NpcResponse }) {
  const { pushScreen, setChatNpcId, setShowTabBar } = useUIStore();
  const avatar = getNpcAvatar(npc.name);
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#1A0A2E', fontSize: '40px' }}>{avatar}</div>
      <p style={{ fontSize: '17px', fontWeight: 600, color: '#FFFFFF', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>Test {npc.name}</p>
      <p style={{ fontSize: '15px', color: '#CFD2D5', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: '4px' }}>Chat with this NPC to check its responses</p>
      <button className="mt-6 px-8 py-3 rounded-xl active:scale-[0.98] transition-transform"
        style={{ background: 'linear-gradient(135deg, #05b6f8, #0498d0)', color: '#FFFFFF', fontSize: '16px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
        onClick={() => { setChatNpcId(npc.id); setShowTabBar(false); pushScreen('chat-live', npc.name); }}>Start chat</button>
    </div>
  );
}

// Main NPC Detail
export function NPCDetailScreen() {
  const { selectedNpcId, selectedNpcTab, setSelectedNpcTab, pushScreen } = useUIStore();
  const { npcs, selectedNpc, fetchNpc, isLoading: npcLoading } = useNpcStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Try to find NPC from the local npcs list first, fallback to selectedNpc
  const npc = npcs.find((n) => n.id === selectedNpcId) || (selectedNpc?.id === selectedNpcId ? selectedNpc : null);

  useEffect(() => {
    if (selectedNpcId && !npc) {
      fetchNpc(selectedNpcId);
    }
  }, [selectedNpcId, npc, fetchNpc]);

  if (npcLoading && !npc) {
    return (
      <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#24272F' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!npc) {
    return (
      <div className="flex items-center justify-center h-full">
        <p style={{ color: '#8E8E93' }}>NPC not found</p>
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 60) {
      if (diff < 0 && selectedNpcTab < 5) {
        setSelectedNpcTab(selectedNpcTab + 1);
      } else if (diff > 0 && selectedNpcTab > 0) {
        setSelectedNpcTab(selectedNpcTab - 1);
      }
    }
    setTouchStart(null);
  };

  const renderTab = () => {
    switch (selectedNpcTab) {
      case 0:
        return <TabIdentity npc={npc} />;
      case 1:
        return <TabMemories npcId={npc.id} />;
      case 2:
        return <TabRelations npcId={npc.id} />;
      case 3:
        return <TabLife npcId={npc.id} />;
      case 4:
        return <TabConversations npcId={npc.id} />;
      case 5:
        return <TabChat npc={npc} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ backgroundColor: '#24272F' }}>
      <NavigationHeader
        title={npc.name}
        showBack
        backTitle="NPCs"
        rightAction={
          <button
            onClick={() => pushScreen('npc-create', 'Edit NPC', { npcId: npc.id })}
            style={{ fontSize: '16px', fontWeight: 600, color: '#05b6f8' }}
          >
            Edit
          </button>
        }
      />

      {/* Tab bar */}
      <div
        className="flex"
        style={{
          backgroundColor: '#2E3138',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
        }}
      >
        {tabNames.map((name, i) => (
          <button key={name} className="flex-shrink-0 px-4 py-2.5 relative" style={{ scrollSnapAlign: 'center' }} onClick={() => setSelectedNpcTab(i)}>
            <span style={{ fontSize: '14px', fontWeight: selectedNpcTab === i ? 600 : 400, color: selectedNpcTab === i ? '#05b6f8' : '#CFD2D5', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap' }}>{name}</span>
            {selectedNpcTab === i && (
              <motion.div className="absolute bottom-0 left-2 right-2 rounded-full" style={{ height: '2.5px', background: 'linear-gradient(90deg, #05b6f8, #0498d0)' }} layoutId="tabIndicator" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 pb-6"
        style={{
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedNpcTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page dots */}
      <div
        className="flex justify-center gap-1.5 py-2 border-t"
        style={{ backgroundColor: '#24272F', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {tabNames.map((_, i) => (
          <div key={i} className="rounded-full transition-all"
            style={{ width: selectedNpcTab === i ? '16px' : '6px', height: '6px', backgroundColor: selectedNpcTab === i ? '#05b6f8' : '#4A4D55' }} />
        ))}
      </div>
    </div>
  );
}
