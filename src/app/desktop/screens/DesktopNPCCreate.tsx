import { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  PenTool,
  Save,
  Wand2,
  Loader2,
  Plus,
  X,
  Dices,
} from 'lucide-react';
import { getRandomName } from '../../../lib/random-names';
import { motion, AnimatePresence } from 'motion/react';
import { MacInsetSection, MacInputRow, MacCard } from '../components/MacUI';
import { toast } from 'sonner';
import { useNpcStore } from '../../../stores/npc.store';

interface DesktopNPCCreateProps {
  onBack: () => void;
}

export function DesktopNPCCreate({ onBack }: DesktopNPCCreateProps) {
  const npcStore = useNpcStore();
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');

  // AI Mode State
  const [prompt, setPrompt] = useState('');
  const [aiName, setAiName] = useState('');

  // Manual Mode State
  const [formData, setFormData] = useState({
    name: '',
    backstory: '',
    personality: {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5,
    },
    speaking_style: {
      vocabulary_level: 'moderate' as 'simple' | 'moderate' | 'advanced' | 'archaic',
      formality: 'neutral' as 'casual' | 'neutral' | 'formal',
      humor: 'none' as 'none' | 'subtle' | 'frequent' | 'sarcastic',
      verbosity: 'normal' as 'terse' | 'concise' | 'normal' | 'verbose',
      quirks: [] as string[],
      catchphrases: [] as string[],
    },
  });

  const [quirkInput, setQuirkInput] = useState('');
  const [catchphraseInput, setCatchphraseInput] = useState('');

  const handleAiGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const payload: { description: string; name?: string } = { description: prompt.trim() };
    if (aiName.trim()) {
      payload.name = aiName.trim();
    }
    const npc = await npcStore.generateNpc(payload);
    if (npc) {
      toast.success('NPC generated successfully!');
      onBack();
    } else {
      toast.error(npcStore.error ?? 'Generation failed');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.backstory.trim()) {
      toast.error('Backstory is required');
      return;
    }

    const npc = await npcStore.createNpc({
      name: formData.name,
      backstory: formData.backstory,
      personality: formData.personality,
      speaking_style: formData.speaking_style,
    });

    if (npc) {
      toast.success('Character created successfully');
      onBack();
    } else {
      toast.error(npcStore.error ?? 'Creation failed');
    }
  };

  const updateSpeakingStyle = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      speaking_style: { ...prev.speaking_style, [field]: value },
    }));
  };

  type SpeakingStyleListField = 'quirks' | 'catchphrases';

  const addSpeakingStyleItem = (field: SpeakingStyleListField, value: string, clearInput: () => void) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      speaking_style: {
        ...prev.speaking_style,
        [field]: [...prev.speaking_style[field], value.trim()],
      },
    }));
    clearInput();
  };

  const removeSpeakingStyleItem = (field: SpeakingStyleListField, index: number) => {
    setFormData((prev) => ({
      ...prev,
      speaking_style: {
        ...prev.speaking_style,
        [field]: prev.speaking_style[field].filter((_, i) => i !== index),
      },
    }));
  };

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

          <div>
            <h2 className="text-lg font-bold text-white leading-tight">New Character</h2>
            <p className="text-xs text-[#8E8E93]">NPC Creation</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="bg-[#2C2C2E] p-1 rounded-lg border border-[#38383A] flex gap-1">
          <button
            onClick={() => setMode('ai')}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2 transition-all ${
              mode === 'ai' ? 'bg-[#636366] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white hover:bg-[#38383A]'
            }`}
          >
            <Sparkles size={14} className={mode === 'ai' ? 'text-[#05b6f8]' : ''} />
            AI Generation
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-4 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2 transition-all ${
              mode === 'manual' ? 'bg-[#636366] text-white shadow-sm' : 'text-[#8E8E93] hover:text-white hover:bg-[#38383A]'
            }`}
          >
            <PenTool size={14} />
            Manual
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {mode === 'manual' && (
            <button
              onClick={handleSave}
              disabled={npcStore.isCreating}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#05b6f8] text-white text-[13px] font-semibold rounded-lg hover:bg-[#0498d0] transition-colors shadow-lg shadow-[#05b6f8]/20 disabled:opacity-60"
            >
              {npcStore.isCreating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Create
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        <AnimatePresence mode="wait">

          {/* AI MODE */}
          {mode === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="h-full flex items-center justify-center p-8"
            >
              <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#05b6f8] to-[#0498d0] rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-[#05b6f8]/20 mb-6">
                    <Sparkles className="text-white w-10 h-10" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Describe your character</h1>
                  <p className="text-[#8E8E93] text-lg">The AI will generate its backstory, personality, and style.</p>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    placeholder="Leave empty for AI to generate"
                    className="flex-1 bg-[#2C2C2E] border border-[#38383A] rounded-xl px-4 py-3 text-white text-sm focus:border-[#05b6f8] outline-none placeholder-[#636366] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setAiName(getRandomName())}
                    className="px-4 py-3 bg-[#2C2C2E] border border-[#38383A] rounded-xl text-[#8E8E93] hover:text-white hover:border-[#05b6f8] hover:bg-[#05b6f8]/10 transition-all"
                    title="Random name"
                  >
                    <Dices size={18} />
                  </button>
                </div>

                <MacCard className="p-1">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. An old grumpy lighthouse keeper who fears the ocean but loves telling storm stories..."
                    className="w-full h-40 bg-[#1C1C1E] text-white p-4 resize-none outline-none text-lg leading-relaxed placeholder-[#636366]"
                  />
                  <div className="bg-[#1C1C1E] px-4 py-3 flex justify-between items-center border-t border-[#38383A]">
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-[#2C2C2E] border border-[#38383A] text-xs text-[#8E8E93]">Groq</span>
                      <span className="px-2 py-1 rounded bg-[#2C2C2E] border border-[#38383A] text-xs text-[#8E8E93]">Fast</span>
                    </div>
                    <button
                      onClick={handleAiGenerate}
                      disabled={npcStore.isCreating}
                      className="flex items-center gap-2 px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {npcStore.isCreating ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 size={18} />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </MacCard>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  {['Dwarf warrior', 'Elf merchant', 'Sneaky thief'].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setPrompt(suggestion)}
                      className="px-4 py-3 bg-[#2C2C2E] border border-[#38383A] rounded-xl text-[#8E8E93] hover:text-white hover:border-[#05b6f8] hover:bg-[#05b6f8]/10 transition-all text-sm font-medium"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* MANUAL MODE */}
          {mode === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto p-8 pb-20"
            >
              <div className="space-y-6">
                <MacInsetSection title="Identity">
                  <MacInputRow
                    label="Full name"
                    placeholder="Ex: Gandalf le Gris"
                    value={formData.name}
                    onChange={(v: string) => setFormData({ ...formData, name: v })}
                  />
                  <div className="p-4">
                    <label className="block text-[15px] font-medium text-white mb-2">Backstory</label>
                    <textarea
                      className="w-full bg-[#2C2C2E] border border-[#38383A] rounded-lg p-3 text-white text-sm focus:border-[#05b6f8] outline-none min-h-[120px]"
                      placeholder="Your character's backstory..."
                      value={formData.backstory}
                      onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
                    />
                  </div>
                </MacInsetSection>

                <MacInsetSection title="Personality (OCEAN)">
                  {Object.entries(formData.personality).map(([key, value]) => (
                    <div key={key} className="px-4 py-3 flex items-center justify-between">
                      <label className="text-[15px] font-medium text-white capitalize w-32">{key}</label>
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-xs text-[#8E8E93] w-8">0%</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={value}
                          onChange={(e) => setFormData({
                            ...formData,
                            personality: { ...formData.personality, [key]: parseFloat(e.target.value) },
                          })}
                          className="flex-1 accent-[#05b6f8]"
                        />
                        <span className="text-xs text-white font-mono w-10 text-right">{Math.round(value * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </MacInsetSection>

                <MacInsetSection title="Speaking Style">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <label className="text-[15px] font-medium text-white">Vocabulary level</label>
                    <select
                      value={formData.speaking_style.vocabulary_level}
                      onChange={(e) => updateSpeakingStyle('vocabulary_level', e.target.value)}
                      className="bg-transparent text-[#05b6f8] text-right outline-none cursor-pointer"
                    >
                      <option value="simple">Simple</option>
                      <option value="moderate">Moderate</option>
                      <option value="advanced">Advanced</option>
                      <option value="archaic">Archaic</option>
                    </select>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <label className="text-[15px] font-medium text-white">Formality</label>
                    <select
                      value={formData.speaking_style.formality}
                      onChange={(e) => updateSpeakingStyle('formality', e.target.value)}
                      className="bg-transparent text-[#05b6f8] text-right outline-none cursor-pointer"
                    >
                      <option value="casual">Casual</option>
                      <option value="neutral">Neutral</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <label className="text-[15px] font-medium text-white">Humour</label>
                    <select
                      value={formData.speaking_style.humor}
                      onChange={(e) => updateSpeakingStyle('humor', e.target.value)}
                      className="bg-transparent text-[#05b6f8] text-right outline-none cursor-pointer"
                    >
                      <option value="none">None</option>
                      <option value="subtle">Subtle</option>
                      <option value="frequent">Frequent</option>
                      <option value="sarcastic">Sarcastic</option>
                    </select>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <label className="text-[15px] font-medium text-white">Verbosity</label>
                    <select
                      value={formData.speaking_style.verbosity}
                      onChange={(e) => updateSpeakingStyle('verbosity', e.target.value)}
                      className="bg-transparent text-[#05b6f8] text-right outline-none cursor-pointer"
                    >
                      <option value="terse">Terse</option>
                      <option value="concise">Concise</option>
                      <option value="normal">Normal</option>
                      <option value="verbose">Verbose</option>
                    </select>
                  </div>
                </MacInsetSection>

                <MacInsetSection title="Quirks">
                  <div className="p-4">
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={quirkInput}
                        onChange={(e) => setQuirkInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSpeakingStyleItem('quirks', quirkInput, () => setQuirkInput(''))}
                        placeholder="E.g. Coughs often, speaks in third person..."
                        className="flex-1 bg-[#2C2C2E] border border-[#38383A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#05b6f8] outline-none"
                      />
                      <button
                        onClick={() => addSpeakingStyleItem('quirks', quirkInput, () => setQuirkInput(''))}
                        className="px-3 py-2 bg-[#05b6f8] text-white rounded-lg hover:bg-[#0498d0] transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {formData.speaking_style.quirks.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.speaking_style.quirks.map((quirk, i) => (
                          <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FF9500]/15 text-[#FF9500] text-[13px]">
                            {quirk}
                            <button onClick={() => removeSpeakingStyleItem('quirks', i)} className="hover:text-white">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </MacInsetSection>

                <MacInsetSection title="Catchphrases">
                  <div className="p-4">
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={catchphraseInput}
                        onChange={(e) => setCatchphraseInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSpeakingStyleItem('catchphrases', catchphraseInput, () => setCatchphraseInput(''))}
                        placeholder="E.g. By my beard!"
                        className="flex-1 bg-[#2C2C2E] border border-[#38383A] rounded-lg px-3 py-2 text-white text-sm focus:border-[#05b6f8] outline-none"
                      />
                      <button
                        onClick={() => addSpeakingStyleItem('catchphrases', catchphraseInput, () => setCatchphraseInput(''))}
                        className="px-3 py-2 bg-[#05b6f8] text-white rounded-lg hover:bg-[#0498d0] transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {formData.speaking_style.catchphrases.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.speaking_style.catchphrases.map((phrase, i) => (
                          <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#05b6f8]/15 text-[#05b6f8] text-[13px]">
                            "{phrase}"
                            <button onClick={() => removeSpeakingStyleItem('catchphrases', i)} className="hover:text-white">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </MacInsetSection>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
