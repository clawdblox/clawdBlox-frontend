import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, ChevronRight, Trash2, Users, Zap, Loader2 } from 'lucide-react';
import { NavigationHeader } from './NavigationHeader';
import { useUIStore } from './app-store';
import { useNpcStore } from '../../stores/npc.store';
import { getNpcAvatar } from '../../lib/utils';
import { toast } from 'sonner';
import type { NpcResponse } from '../../lib/api';

export function NPCListScreen() {
  const { pushScreen, setSelectedNpcId } = useUIStore();
  const npcStore = useNpcStore();
  const [search, setSearch] = useState('');
  const [swipedId, setSwipedId] = useState<string | null>(null);

  useEffect(() => {
    npcStore.fetchNpcs();
  }, []);

  const filtered = npcStore.npcs.filter(
    (npc) =>
      npc.name.toLowerCase().includes(search.toLowerCase()) ||
      npc.backstory.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const success = await npcStore.deleteNpc(id);
    setSwipedId(null);
    if (success) {
      toast.success('NPC deleted');
    } else {
      toast.error(npcStore.error ?? 'Deletion failed');
    }
  };

  const handleNpcTap = (npc: NpcResponse) => {
    setSelectedNpcId(npc.id);
    pushScreen('npc-detail', npc.name);
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ backgroundColor: '#24272F' }}>
      <NavigationHeader
        title="NPCs"
        largeTitle
        rightAction={
          <button
            onClick={() => pushScreen('npc-create', 'New NPC')}
            className="w-9 h-9 rounded-full flex items-center justify-center active:bg-white/5 transition-colors"
            style={{
              background: 'rgba(5,182,248,0.12)',
            }}
          >
            <Plus size={22} style={{ color: '#05b6f8' }} />
          </button>
        }
      />

      {/* Search bar */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center gap-2 px-3.5 rounded-2xl"
          style={{
            height: '38px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.06)',
          }}
        >
          <Search size={16} style={{ color: '#CFD2D5' }} />
          <input
            type="text"
            placeholder="Search NPCs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{
              fontSize: '15px',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>
      </div>

      {/* NPC List */}
      <div
        className="flex-1 min-h-0 pb-6"
        style={{
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {npcStore.isLoading && npcStore.npcs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="mt-3 text-[15px] text-muted-foreground">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'rgba(5,182,248,0.1)',
              }}
            >
              <Users size={36} style={{ color: '#05b6f8' }} />
            </div>
            <p
              style={{
                fontSize: '17px',
                fontWeight: 600,
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
              }}
            >
              {search ? 'No results' : 'No NPCs created'}
            </p>
            <p
              style={{
                fontSize: '15px',
                color: '#CFD2D5',
                fontFamily: 'Inter, sans-serif',
                textAlign: 'center',
                marginTop: '4px',
              }}
            >
              {search
                ? 'Try another term'
                : 'Create your first NPC to get started'}
            </p>
            {!search && (
              <button
                onClick={() => pushScreen('npc-create', 'New NPC')}
                className="mt-6 px-6 py-3 rounded-xl active:scale-[0.97] transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #05b6f8, #0498d0)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 4px 16px rgba(5,182,248,0.25)',
                }}
              >
                Create your first NPC
              </button>
            )}
          </div>
        ) : (
          <div className="px-4 space-y-2.5">
            <AnimatePresence>
              {filtered.map((npc, i) => (
                <motion.div
                  key={npc.id}
                  className="relative overflow-hidden rounded-2xl"
                  style={{
                    boxShadow: '0 2px 12px rgba(0,0,0,0.2), 0 0.5px 0 rgba(255,255,255,0.04)',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {/* Delete action background */}
                  {swipedId === npc.id && (
                    <motion.button
                      className="absolute right-0 top-0 bottom-0 flex items-center justify-center rounded-r-2xl"
                      style={{
                        width: '80px',
                        background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => handleDelete(npc.id)}
                    >
                      <Trash2 size={20} color="white" />
                    </motion.button>
                  )}

                  <button
                    className="w-full flex items-center gap-3 px-4 text-left active:bg-white/5 relative z-10 transition-colors"
                    style={{
                      minHeight: '72px',
                      backgroundColor: '#2E3138',
                      transform: swipedId === npc.id ? 'translateX(-80px)' : 'translateX(0)',
                      transition: 'transform 0.2s ease',
                      borderRadius: '16px',
                    }}
                    onClick={() => {
                      if (swipedId === npc.id) {
                        setSwipedId(null);
                      } else {
                        handleNpcTap(npc);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setSwipedId(swipedId === npc.id ? null : npc.id);
                    }}
                  >
                    {/* Avatar with status ring */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #1A0A2E, #2A1548)',
                          fontSize: '24px',
                        }}
                      >
                        {getNpcAvatar(npc.name)}
                      </div>
                      {/* Status dot */}
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: '#2E3138',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: npc.is_active ? '#34C759' : '#6B6F78',
                            boxShadow: npc.is_active ? '0 0 6px rgba(52,199,89,0.4)' : 'none',
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#FFFFFF',
                          fontFamily: 'Inter, sans-serif',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {npc.name}
                      </span>
                      <p
                        className="truncate"
                        style={{
                          fontSize: '14px',
                          color: '#CFD2D5',
                          fontFamily: 'Inter, sans-serif',
                          marginTop: '1px',
                        }}
                      >
                        {npc.backstory.slice(0, 80)}{npc.backstory.length > 80 ? '...' : ''}
                      </p>
                      {npc.is_active && (
                        <div className="flex items-center gap-1 mt-1">
                          <Zap size={11} style={{ color: '#05b6f8' }} />
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#05b6f8',
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 500,
                            }}
                          >
                            Active
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} style={{ color: '#4A4D55', flexShrink: 0 }} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
