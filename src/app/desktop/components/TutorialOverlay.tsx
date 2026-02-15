import { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTutorialStore } from '../../../stores/tutorial.store';
import {
  Compass,
  LayoutDashboard,
  BarChart3,
  Users,
  Plus,
  Brain,
  MessageCircle,
  Settings,
  Key,
  Radio,
  PartyPopper,
} from 'lucide-react';
import type { DesktopRoute } from '../layout/DesktopSidebar';

interface TutorialOverlayProps {
  onNavigate: (route: DesktopRoute) => void;
}

type StepType = 'modal' | 'spotlight';
type TooltipPosition = 'bottom' | 'top' | 'right' | 'left';

interface TutorialStep {
  type: StepType;
  route?: DesktopRoute;
  target?: string;
  title: string;
  description: string;
  icon: React.ElementType;
  position?: TooltipPosition;
}

const STEPS: TutorialStep[] = [
  {
    type: 'modal',
    title: 'Welcome to MemoryWeave',
    description: 'Let\'s take a quick tour of the dashboard so you can get the most out of your NPC memory system.',
    icon: Compass,
  },
  {
    type: 'spotlight',
    route: 'overview',
    target: 'sidebar-nav',
    title: 'Navigation',
    description: 'Use the sidebar to navigate between sections: NPCs, Memories, Conversations, Analytics, and the Admin panel.',
    icon: LayoutDashboard,
    position: 'right',
  },
  {
    type: 'spotlight',
    route: 'overview',
    target: 'stats-grid',
    title: 'Dashboard Overview',
    description: 'A snapshot of your project: active NPCs, conversations, total memories, and relationship count.',
    icon: BarChart3,
    position: 'bottom',
  },
  {
    type: 'spotlight',
    route: 'overview',
    target: 'recent-npcs',
    title: 'Recent NPCs',
    description: 'Click any NPC card to view their details, memories, and conversation history.',
    icon: Users,
    position: 'top',
  },
  {
    type: 'spotlight',
    route: 'npcs',
    target: 'create-npc',
    title: 'Create NPCs',
    description: 'Generate NPCs with AI or create them manually with custom personality traits and backstories.',
    icon: Plus,
    position: 'bottom',
  },
  {
    type: 'spotlight',
    route: 'memories',
    target: 'memory-filters',
    title: 'Memory System',
    description: '4 memory types: episodic, semantic, procedural, and emotional. Filter and search through all stored memories.',
    icon: Brain,
    position: 'bottom',
  },
  {
    type: 'spotlight',
    route: 'conversations',
    target: 'conversations-list',
    title: 'Conversations',
    description: 'Browse the full player-NPC interaction history with message counts and status tracking.',
    icon: MessageCircle,
    position: 'bottom',
  },
  {
    type: 'spotlight',
    route: 'settings',
    target: 'settings-ai',
    title: 'AI Configuration',
    description: 'Configure the Groq provider, select your preferred model, and set your API key for NPC responses.',
    icon: Settings,
    position: 'bottom',
  },
  {
    type: 'spotlight',
    route: 'api-keys',
    target: 'api-keys-section',
    title: 'API Keys',
    description: 'Your PLAYER_SIGNING_SECRET and API KEY for server integration. Keep these safe!',
    icon: Key,
    position: 'bottom',
  },
  {
    type: 'spotlight',
    route: 'channels',
    target: 'channels-section',
    title: 'Channel Bindings',
    description: 'Link your NPCs to Discord or Telegram channels so they can respond to players automatically.',
    icon: Radio,
    position: 'bottom',
  },
  {
    type: 'modal',
    title: "You're All Set!",
    description: 'You now know your way around MemoryWeave. You can always restart this tour from Settings.',
    icon: PartyPopper,
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialOverlay({ onNavigate }: TutorialOverlayProps) {
  const { isActive, currentStep, next, prev, skip, complete } = useTutorialStore();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const step = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const isModal = step?.type === 'modal';

  const measureTarget = useCallback(() => {
    if (!step || step.type === 'modal' || !step.target) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(`[data-tutorial="${step.target}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
    } else {
      if (import.meta.env.DEV) {
        console.warn(`[Tutorial] Target not found: [data-tutorial="${step.target}"]`);
      }
      setTargetRect(null);
    }
  }, [step]);

  // Navigate to the correct route and measure the target with retry logic
  useEffect(() => {
    if (!isActive || !step) return;

    if (step.type === 'spotlight' && step.route) {
      setIsTransitioning(true);
      onNavigate(step.route);

      let cancelled = false;
      let retryTimeout: ReturnType<typeof setTimeout>;

      const attemptMeasure = (retries = 5) => {
        if (cancelled) return;
        const el = document.querySelector(`[data-tutorial="${step.target}"]`);
        if (el) {
          measureTarget();
          setIsTransitioning(false);
        } else if (retries > 0) {
          retryTimeout = setTimeout(() => attemptMeasure(retries - 1), 150);
        } else {
          if (import.meta.env.DEV) {
            console.warn(`[Tutorial] Target not found after retries: [data-tutorial="${step.target}"]`);
          }
          setIsTransitioning(false);
        }
      };

      const initialTimeout = setTimeout(() => attemptMeasure(), 200);
      return () => {
        cancelled = true;
        clearTimeout(initialTimeout);
        clearTimeout(retryTimeout);
      };
    } else {
      setTargetRect(null);
      setIsTransitioning(false);
    }
  }, [isActive, currentStep, step, onNavigate, measureTarget]);

  // Resize handler
  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(measureTarget, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isActive, measureTarget]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        isLast ? complete() : skip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        isLast ? complete() : next();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        prev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, isLast, currentStep, next, prev, skip, complete]);

  if (!isActive || !step) return null;

  const tooltipStyle = getTooltipPosition(targetRect, step.position ?? 'bottom');
  const Icon = step.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`tutorial-step-${currentStep}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999]"
      >
        {isModal ? (
          // Modal step
          <>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="bg-[#1C1C1E] border border-[#38383A] rounded-2xl p-8 max-w-[420px] w-full shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-label={step.title}
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#05b6f8]/15 mb-5 mx-auto">
                  <Icon size={28} className="text-[#05b6f8]" />
                </div>
                <h2 className="text-[22px] font-bold text-white text-center mb-2">{step.title}</h2>
                <p className="text-[15px] text-[#8E8E93] text-center leading-relaxed mb-8">{step.description}</p>

                <div className="flex flex-col gap-3">
                  {isFirst ? (
                    <>
                      <button
                        onClick={next}
                        aria-label="Start tour"
                        className="w-full py-3 bg-[#05b6f8] hover:bg-[#0498d0] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#05b6f8]/20"
                      >
                        Start Tour
                      </button>
                      <button
                        onClick={skip}
                        aria-label="Skip tutorial"
                        className="w-full py-2.5 text-[#8E8E93] hover:text-white text-[14px] transition-colors"
                      >
                        Skip tour
                      </button>
                      <p className="text-[12px] text-[#8E8E93] text-center mt-2">
                        {STEPS.length} quick steps
                      </p>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={complete}
                        aria-label="Finish tutorial"
                        className="w-full py-3 bg-[#05b6f8] hover:bg-[#0498d0] text-white font-semibold rounded-xl transition-colors shadow-lg shadow-[#05b6f8]/20"
                      >
                        Get Started
                      </button>
                      <p className="text-[12px] text-[#8E8E93] text-center mt-2">
                        {STEPS.length}/{STEPS.length} completed
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          // Spotlight step
          <>
            {/* Dark overlay - clicking does nothing */}
            <div className="absolute inset-0" onClick={(e) => e.stopPropagation()}>
              {/* Spotlight cutout */}
              {targetRect && !isTransitioning && (
                <>
                  <div
                    className="absolute rounded-xl pointer-events-none"
                    style={{
                      top: targetRect.top,
                      left: targetRect.left,
                      width: targetRect.width,
                      height: targetRect.height,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                      transition: 'all 0.3s ease',
                    }}
                  />
                  {/* Pulse ring */}
                  <div
                    className="absolute rounded-xl pointer-events-none animate-pulse"
                    style={{
                      top: targetRect.top - 2,
                      left: targetRect.left - 2,
                      width: targetRect.width + 4,
                      height: targetRect.height + 4,
                      border: '2px solid rgba(5, 182, 248, 0.4)',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </>
              )}

              {/* Fallback full overlay when no target */}
              {(!targetRect || isTransitioning) && (
                <div className="absolute inset-0 bg-black/65" />
              )}
            </div>

            {/* Tooltip */}
            {!isTransitioning && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="absolute z-10"
                style={tooltipStyle}
                role="dialog"
                aria-modal="true"
                aria-label={step.title}
              >
                <div className="bg-[#1C1C1E] border border-[#38383A] rounded-xl p-5 shadow-2xl w-[380px]">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#05b6f8]/15 flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-[#05b6f8]" />
                    </div>
                    <h3 className="text-[16px] font-bold text-white">{step.title}</h3>
                  </div>

                  <p className="text-[14px] text-[#8E8E93] leading-relaxed mb-5">{step.description}</p>

                  {/* Progress dots */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === currentStep
                            ? 'w-6 bg-[#05b6f8]'
                            : i < currentStep
                              ? 'w-1.5 bg-[#05b6f8]/40'
                              : 'w-1.5 bg-[#38383A]'
                        }`}
                      />
                    ))}
                    <span className="ml-auto text-[12px] text-[#8E8E93]">
                      {currentStep + 1}/{STEPS.length}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={skip}
                      aria-label="Skip tutorial"
                      className="py-2 text-[13px] text-[#8E8E93] hover:text-white transition-colors"
                    >
                      Skip tour
                    </button>
                    <div className="flex items-center gap-2">
                      {currentStep > 0 && (
                        <button
                          onClick={prev}
                          aria-label="Previous step"
                          className="px-4 py-2 text-[13px] text-white bg-[#2C2C2E] hover:bg-[#38383A] rounded-lg transition-colors"
                        >
                          Back
                        </button>
                      )}
                      <button
                        onClick={isLast ? complete : next}
                        aria-label={isLast ? 'Finish tutorial' : 'Next step'}
                        className="px-5 py-2 text-[13px] font-semibold text-white bg-[#05b6f8] hover:bg-[#0498d0] rounded-lg transition-colors shadow-lg shadow-[#05b6f8]/20"
                      >
                        {isLast ? 'Finish' : 'Next'}
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#8E8E93]/60 text-right mt-2">
                    ← → to navigate · Esc to skip
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function getTooltipPosition(
  rect: Rect | null,
  preferred: TooltipPosition
): React.CSSProperties {
  if (!rect) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  const GAP = 16;
  const TOOLTIP_W = 380;
  const TOOLTIP_H_ESTIMATE = 220;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const positions: Record<TooltipPosition, React.CSSProperties> = {
    bottom: {
      top: rect.top + rect.height + GAP,
      left: Math.max(16, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - 16)),
    },
    top: {
      top: rect.top - TOOLTIP_H_ESTIMATE - GAP,
      left: Math.max(16, Math.min(rect.left + rect.width / 2 - TOOLTIP_W / 2, vw - TOOLTIP_W - 16)),
    },
    right: {
      top: Math.max(16, Math.min(rect.top + rect.height / 2 - TOOLTIP_H_ESTIMATE / 2, vh - TOOLTIP_H_ESTIMATE - 16)),
      left: rect.left + rect.width + GAP,
    },
    left: {
      top: Math.max(16, Math.min(rect.top + rect.height / 2 - TOOLTIP_H_ESTIMATE / 2, vh - TOOLTIP_H_ESTIMATE - 16)),
      left: rect.left - TOOLTIP_W - GAP,
    },
  };

  // Check if preferred position fits
  const check = positions[preferred];
  const t = (check.top as number) ?? 0;
  const l = (check.left as number) ?? 0;

  if (t >= 8 && t + TOOLTIP_H_ESTIMATE <= vh - 8 && l >= 8 && l + TOOLTIP_W <= vw - 8) {
    return check;
  }

  // Fallback order
  const fallbacks: TooltipPosition[] = ['bottom', 'top', 'right', 'left'];
  for (const pos of fallbacks) {
    if (pos === preferred) continue;
    const p = positions[pos];
    const pt = (p.top as number) ?? 0;
    const pl = (p.left as number) ?? 0;
    if (pt >= 8 && pt + TOOLTIP_H_ESTIMATE <= vh - 8 && pl >= 8 && pl + TOOLTIP_W <= vw - 8) {
      return p;
    }
  }

  return positions.bottom;
}
