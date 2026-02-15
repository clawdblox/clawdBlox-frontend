import { useEffect, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { useProjectStore } from '../../../stores/project.store';
import { useTutorialStore } from '../../../stores/tutorial.store';
import { MacInsetSection, MacInputRow, MacToggleRow } from '../components/MacUI';
import { toast } from 'sonner';
import type { DesktopRoute } from '../layout/DesktopSidebar';

const GROQ_MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
  { value: 'llama-3.3-70b-specdec', label: 'Llama 3.3 70B SpecDec' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
];

export function DesktopSettings({ onNavigate }: { onNavigate?: (route: DesktopRoute) => void }) {
  const projectStore = useProjectStore();
  const tutorialStore = useTutorialStore();

  const [name, setName] = useState('');
  const [model, setModel] = useState('llama-3.1-70b-versatile');
  const [apiKey, setApiKey] = useState('');
  const [authRequired, setAuthRequired] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    projectStore.fetchProject();
  }, []);

  useEffect(() => {
    if (!projectStore.project) return;
    setName(projectStore.project.name);
    setModel(projectStore.project.settings?.groq_chat_model ?? 'llama-3.1-70b-versatile');
  }, [projectStore.project]);

  async function handleSave() {
    setIsSaving(true);

    const success = await projectStore.updateProject({
      name,
      groq_api_key: apiKey || undefined,
      settings: { groq_chat_model: model },
    });

    setIsSaving(false);

    if (success) {
      setApiKey('');
      toast.success('Configuration saved');
    } else {
      toast.error(projectStore.error ?? 'Save failed');
    }
  }

  return (
    <div className="p-8 max-w-[800px] mx-auto">
      <div className="mb-8">
        <h2 className="text-[28px] font-bold text-white tracking-tight">Settings</h2>
        <p className="text-[#8E8E93] text-[15px]">Project and AI configuration</p>
      </div>

      <MacInsetSection title="General">
        <div className="flex items-center justify-between px-4 py-3 bg-[#1C1C1E]">
          <div>
            <label className="text-[15px] font-medium text-white">Restart Tutorial</label>
            <p className="text-[13px] text-[#8E8E93]">Take the guided tour again</p>
          </div>
          <button
            onClick={() => {
              tutorialStore.reset();
              onNavigate?.('overview' as DesktopRoute);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#05b6f8]/10 hover:bg-[#05b6f8]/20 text-[#05b6f8] rounded-lg font-medium transition-colors text-[14px]"
          >
            <RotateCcw size={16} />
            Restart
          </button>
        </div>
      </MacInsetSection>

      <MacInsetSection title="Project">
        <MacInputRow
          label="Project name"
          value={name}
          onChange={setName}
        />
      </MacInsetSection>

      <div data-tutorial="settings-ai">
      <MacInsetSection title="Artificial Intelligence" footer="ClawdBlox uses your API key to generate NPC responses.">
        <div className="flex items-center justify-between px-4 py-3 bg-[#1C1C1E]">
          <label className="text-[15px] font-medium text-white min-w-[150px]">Provider</label>
          <select
            value="Groq"
            disabled
            className="bg-transparent text-[#05b6f8] text-[15px] outline-none text-right cursor-default"
          >
            <option value="Groq">Groq</option>
          </select>
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-[#1C1C1E]">
          <label className="text-[15px] font-medium text-white min-w-[150px]">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-transparent text-[#05b6f8] text-[15px] outline-none text-right cursor-pointer"
          >
            {GROQ_MODELS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <MacInputRow
          label="API Key"
          value={apiKey}
          onChange={setApiKey}
          type="password"
          placeholder="gsk_..."
        />
      </MacInsetSection>
      </div>

      <MacInsetSection title="Security">
        <MacToggleRow
          label="Player Authentication Required"
          checked={authRequired}
          onChange={setAuthRequired}
        />
      </MacInsetSection>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#05b6f8] hover:bg-[#0498d0] disabled:opacity-60 text-white font-semibold py-2.5 px-12 rounded-lg shadow-lg shadow-[#05b6f8]/20 active:scale-[0.98] transition-all flex items-center gap-2"
        >
          {isSaving && <Loader2 size={18} className="animate-spin" />}
          {isSaving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
