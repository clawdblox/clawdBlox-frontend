import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Radio } from 'lucide-react';
import { useChannelStore } from '../../../stores/channel.store';
import { useNpcStore } from '../../../stores/npc.store';
import { MacInsetSection } from '../components/MacUI';
import { toast } from 'sonner';

export function DesktopChannels() {
  const { bindings, fetchBindings, createBinding, deleteBinding, isLoading } = useChannelStore();
  const { npcs, fetchNpcs } = useNpcStore();

  const [showForm, setShowForm] = useState(false);
  const [npcId, setNpcId] = useState('');
  const [platform, setPlatform] = useState<'discord' | 'telegram'>('discord');
  const [channelId, setChannelId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBindings();
    if (npcs.length === 0) fetchNpcs();
  }, []);

  const handleCreate = async () => {
    if (!npcId || !channelId.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    const binding = await createBinding({
      npc_id: npcId,
      platform,
      platform_channel_id: channelId.trim(),
    });
    setIsSubmitting(false);
    if (binding) {
      toast.success('Channel binding created');
      setShowForm(false);
      setNpcId('');
      setChannelId('');
    } else {
      toast.error('Creation failed');
    }
  };

  const handleDelete = async (b: typeof bindings[0]) => {
    const success = await deleteBinding(b.npc_id, b.platform, b.platform_channel_id);
    if (success) {
      toast.success('Binding deleted');
    } else {
      toast.error('Deletion failed');
    }
  };

  const getNpcName = (id: string) => npcs.find((n) => n.id === id)?.name ?? id.slice(0, 8);

  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-white tracking-tight">Channel Bindings</h2>
          <p className="text-[#8E8E93] text-[15px]">Link your NPCs to Discord or Telegram channels</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#05b6f8] hover:bg-[#0498d0] text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Add
        </button>
      </div>

      {showForm && (
        <MacInsetSection title="New Binding">
          <div className="space-y-0">
            <div className="flex items-center justify-between px-4 py-3 bg-[#1C1C1E] border-b border-[#38383A]">
              <label className="text-[15px] font-medium text-white min-w-[150px]">NPC</label>
              <select
                value={npcId}
                onChange={(e) => setNpcId(e.target.value)}
                className="bg-transparent text-[#05b6f8] text-[15px] outline-none text-right cursor-pointer"
              >
                <option value="">Select...</option>
                {npcs.map((npc) => (
                  <option key={npc.id} value={npc.id}>{npc.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-[#1C1C1E] border-b border-[#38383A]">
              <label className="text-[15px] font-medium text-white min-w-[150px]">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as 'discord' | 'telegram')}
                className="bg-transparent text-[#05b6f8] text-[15px] outline-none text-right cursor-pointer"
              >
                <option value="discord">Discord</option>
                <option value="telegram">Telegram</option>
              </select>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-[#1C1C1E]">
              <label className="text-[15px] font-medium text-white min-w-[150px]">Channel ID</label>
              <input
                type="text"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="Channel ID..."
                className="bg-transparent text-white text-[15px] outline-none text-right flex-1 placeholder-[#8E8E93]"
              />
            </div>
          </div>
          <div className="px-4 py-3 flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-[#8E8E93] hover:bg-white/5 transition-colors text-[14px]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="bg-[#05b6f8] hover:bg-[#0498d0] disabled:opacity-60 text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 text-[14px]"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Create
            </button>
          </div>
        </MacInsetSection>
      )}

      <MacInsetSection title={`Active Bindings (${bindings.length})`}>
        {isLoading && bindings.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#05b6f8]" />
          </div>
        ) : bindings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Radio size={32} className="text-[#8E8E93] mb-3" />
            <p className="text-[#8E8E93] text-[15px]">No bindings configured</p>
          </div>
        ) : (
          <div>
            {bindings.map((b, i) => (
              <div
                key={b.id}
                className={`flex items-center justify-between px-4 py-3 bg-[#1C1C1E] ${i < bindings.length - 1 ? 'border-b border-[#38383A]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[12px] font-semibold ${b.platform === 'discord' ? 'bg-[#5865F2]/15 text-[#5865F2]' : 'bg-[#0088CC]/15 text-[#0088CC]'}`}>
                    {b.platform}
                  </span>
                  <div>
                    <p className="text-[15px] text-white font-medium">{getNpcName(b.npc_id)}</p>
                    <p className="text-[13px] text-[#8E8E93] font-mono">{b.platform_channel_id}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(b)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[#FF453A]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </MacInsetSection>
    </div>
  );
}
