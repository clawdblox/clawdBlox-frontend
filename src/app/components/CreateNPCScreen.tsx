import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NavigationHeader } from './NavigationHeader';
import { useUIStore } from './app-store';
import { useNpcStore } from '../../stores/npc.store';
import { Sparkles, Wand2, Dices } from 'lucide-react';
import { getRandomName } from '../../lib/random-names';
import { toast } from 'sonner';
import { IOSSection, IOSInputRow, IOSSegmentedControl, IOSSliderRow, IOSRow } from './ios-ui';
import type { NpcResponse } from '../../lib/api';

const oceanTraits = [
  { key: 'openness', label: 'Openness', lowDesc: 'Closed', highDesc: 'Curious' },
  { key: 'conscientiousness', label: 'Conscientiousness', lowDesc: 'Spontaneous', highDesc: 'Organized' },
  { key: 'extraversion', label: 'Extraversion', lowDesc: 'Introverted', highDesc: 'Extraverted' },
  { key: 'agreeableness', label: 'Agreeableness', lowDesc: 'Detached', highDesc: 'Compassionate' },
  { key: 'neuroticism', label: 'Neuroticism', lowDesc: 'Confident', highDesc: 'Anxious' },
];

export function CreateNPCScreen() {
  const { popScreen, getCurrentScreen } = useUIStore();
  const npcStore = useNpcStore();
  const { params } = getCurrentScreen();
  const editId = params?.npcId;
  const isEditing = !!editId;

  const [mode, setMode] = useState<'ai' | 'manual'>('manual');
  const [prompt, setPrompt] = useState('');
  const [aiName, setAiName] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [backstory, setBackstory] = useState('');
  const [personality, setPersonality] = useState({
    openness: 0.5, conscientiousness: 0.5, extraversion: 0.5, agreeableness: 0.5, neuroticism: 0.5,
  });
  const [speakingStyle, setSpeakingStyle] = useState({
    vocabulary_level: 'moderate' as 'simple' | 'moderate' | 'advanced' | 'archaic',
    formality: 'neutral' as 'casual' | 'neutral' | 'formal',
    humor: 'none' as 'none' | 'subtle' | 'frequent' | 'sarcastic',
    verbosity: 'normal' as 'terse' | 'concise' | 'normal' | 'verbose',
    quirks: [] as string[],
    catchphrases: [] as string[],
  });

  const [tags, setTags] = useState<{ values: string[]; fears: string[]; catchphrases: string[] }>({
    values: [], fears: [], catchphrases: [],
  });

  const populateForm = (npc: NpcResponse) => {
    setName(npc.name);
    setBackstory(npc.backstory);
    setPersonality(npc.personality);
    setSpeakingStyle({
      vocabulary_level: (npc.speaking_style.vocabulary_level as typeof speakingStyle.vocabulary_level) || 'moderate',
      formality: (npc.speaking_style.formality as typeof speakingStyle.formality) || 'neutral',
      humor: (npc.speaking_style.humor as typeof speakingStyle.humor) || 'none',
      verbosity: (npc.speaking_style.verbosity as typeof speakingStyle.verbosity) || 'normal',
      quirks: npc.speaking_style.quirks || [],
      catchphrases: npc.speaking_style.catchphrases || [],
    });
    setTags({
      values: npc.personality.values || [],
      fears: npc.personality.fears || [],
      catchphrases: npc.speaking_style.catchphrases || [],
    });
  };

  useEffect(() => {
    if (editId) {
      const npc = npcStore.npcs.find((n) => n.id === editId);
      if (npc) {
        populateForm(npc);
        setMode('manual');
      } else {
        npcStore.fetchNpc(editId);
      }
    } else {
      setMode('ai');
    }
  }, [editId]);

  // Populate form when selectedNpc loads asynchronously (for edit mode)
  useEffect(() => {
    if (editId && npcStore.selectedNpc?.id === editId) {
      populateForm(npcStore.selectedNpc);
    }
  }, [editId, npcStore.selectedNpc]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const payload: { description: string; name?: string } = { description: prompt.trim() };
    if (aiName.trim()) {
      payload.name = aiName.trim();
    }
    const npc = await npcStore.generateNpc(payload);
    if (npc) {
      toast.success('Generation complete!');
      popScreen();
    } else {
      toast.error(npcStore.error ?? 'Generation failed');
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!backstory.trim()) {
      toast.error("Backstory is required");
      return;
    }

    const payload = {
      name,
      backstory,
      personality: { ...personality, values: tags.values, fears: tags.fears },
      speaking_style: { ...speakingStyle, catchphrases: tags.catchphrases },
    };

    const npc = isEditing && editId
      ? await npcStore.updateNpc(editId, payload)
      : await npcStore.createNpc(payload);

    if (npc) {
      toast.success(isEditing ? 'Changes saved' : 'New NPC created');
      popScreen();
    } else {
      toast.error(npcStore.error ?? (isEditing ? 'Update failed' : 'Creation failed'));
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    const success = await npcStore.deleteNpc(editId);
    if (success) {
      toast.success('NPC deleted');
      popScreen();
    } else {
      toast.error(npcStore.error ?? 'Deletion failed');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#000000]">
      <NavigationHeader
        title={isEditing ? "Edit" : "Create"}
        showBack
        backTitle={isEditing ? "Cancel" : "NPCs"}
        rightAction={
           (mode === 'manual') && (
            <button
              onClick={handleCreate}
              disabled={npcStore.isCreating}
              className="text-[#05b6f8] font-semibold text-[17px] disabled:opacity-50"
            >
              {npcStore.isCreating ? '...' : 'OK'}
            </button>
           )
        }
      />

      <div className="flex-1 overflow-y-auto overscroll-contain bg-[#000000]">

        {/* Mode Switcher */}
        {!isEditing && (
          <div className="px-4 py-4">
            <IOSSegmentedControl
              options={[
                { value: 'ai', label: 'AI Assistant' },
                { value: 'manual', label: 'Manual' }
              ]}
              value={mode}
              onChange={setMode}
            />
          </div>
        )}

        {mode === 'ai' ? (
          <div className="px-4 mt-2">
            <div className="bg-[#1C1C1E] rounded-[10px] p-4 mb-4">
              <textarea
                placeholder="Describe your NPC (e.g. A paranoid potion merchant who thinks his customers are spies...)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full bg-transparent text-[17px] text-white placeholder-[#8E8E93] outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="bg-[#1C1C1E] rounded-[10px] p-4 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiName}
                  onChange={(e) => setAiName(e.target.value)}
                  placeholder="Name (optional)"
                  className="flex-1 bg-[#2C2C2E] border border-[#38383A] rounded-lg px-3 py-2.5 text-[17px] text-white placeholder-[#8E8E93] outline-none focus:border-[#05b6f8] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setAiName(getRandomName())}
                  className="px-3 py-2.5 bg-[#2C2C2E] border border-[#38383A] rounded-lg text-[#8E8E93] active:bg-[#38383A] transition-colors"
                >
                  <Dices size={20} />
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || npcStore.isCreating}
              className="w-full py-3.5 rounded-[12px] bg-[#05b6f8] active:bg-[#0498d0] text-white text-[17px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {npcStore.isCreating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Sparkles size={18} />
                  </motion.div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Generate profile
                </>
              )}
            </button>

            <p className="text-center mt-6 text-[#8E8E93] text-[13px] px-8 leading-snug">
              The AI will generate the backstory, personality, and character traits. Name is optional.
            </p>
          </div>
        ) : (
          <div className="pt-2 pb-10">
            {/* Identity Section */}
            <IOSSection title="Identity">
              <IOSInputRow
                label="Nom"
                value={name}
                onChange={setName}
                placeholder="NPC name"
                last
              />
            </IOSSection>

            <IOSSection title="Backstory" footer="This description serves as the main context for the language model.">
              <div className="p-4 min-h-[100px]">
                <textarea
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="Once upon a time..."
                  className="w-full bg-transparent text-[17px] text-white placeholder-[#8E8E93] outline-none resize-none leading-relaxed h-32"
                />
              </div>
            </IOSSection>

            {/* Personality Section */}
            <IOSSection title="Personality (OCEAN)">
              {oceanTraits.map((trait, i) => (
                <IOSSliderRow
                  key={trait.key}
                  label={trait.label}
                  value={personality[trait.key as keyof typeof personality]}
                  onChange={(val) => setPersonality(prev => ({ ...prev, [trait.key]: val }))}
                  minLabel={trait.lowDesc}
                  maxLabel={trait.highDesc}
                  last={i === oceanTraits.length - 1}
                />
              ))}
            </IOSSection>

            {/* Tags Section */}
            <IOSSection title="Details" footer="Press 'Enter' to add a tag.">
              <IOSRow
                label="Catchphrases"
                value={`${tags.catchphrases.length} phrases`}
                showChevron
                onClick={() => {
                  const val = window.prompt("Add a catchphrase:");
                  if (val) setTags(prev => ({ ...prev, catchphrases: [...prev.catchphrases, val] }));
                }}
              />
               <IOSRow
                label="Values"
                value={`${tags.values.length} values`}
                showChevron
                onClick={() => {
                  const val = window.prompt("Add a value:");
                  if (val) setTags(prev => ({ ...prev, values: [...prev.values, val] }));
                }}
              />
               <IOSRow
                label="Fears"
                value={`${tags.fears.length} fears`}
                showChevron
                last
                onClick={() => {
                  const val = window.prompt("Add a fear:");
                  if (val) setTags(prev => ({ ...prev, fears: [...prev.fears, val] }));
                }}
              />
            </IOSSection>

            {/* Delete Button (Only in edit mode) */}
            {isEditing && (
              <div className="mt-8 px-4">
                <button
                  className="w-full py-3.5 rounded-[12px] bg-[#1C1C1E] active:bg-[#2C2C2E] text-[#FF453A] text-[17px] font-normal transition-colors"
                  onClick={handleDelete}
                >
                  Delete NPC
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
