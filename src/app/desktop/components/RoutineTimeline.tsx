import type { RoutineResponse } from '../../../lib/api';
import { motion } from 'motion/react';

interface RoutineTimelineProps {
  routines: RoutineResponse[];
}

export function RoutineTimeline({ routines }: RoutineTimelineProps) {
  const sortedRoutines = [...routines].sort((a, b) => a.start_hour - b.start_hour);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getActivityForHour = (h: number) => {
    const routine = sortedRoutines.find(r => h >= r.start_hour && h < r.end_hour);
    return routine || null;
  };

  const getActivityColor = (activity: string) => {
    const lower = activity.toLowerCase();
    if (lower.includes('dormir') || lower.includes('repos') || lower.includes('sleep') || lower.includes('rest')) return '#2C2C2E';
    if (lower.includes('taverne') || lower.includes('service') || lower.includes('tavern') || lower.includes('serve')) return '#FF9F0A';
    if (lower.includes('cuisine') || lower.includes('preparer') || lower.includes('cook') || lower.includes('prepare')) return '#FF453A';
    if (lower.includes('marche') || lower.includes('commerce') || lower.includes('market') || lower.includes('trade')) return '#32D74B';
    if (lower.includes('garde') || lower.includes('surveille') || lower.includes('guard') || lower.includes('patrol')) return '#0A84FF';
    return '#64D2FF';
  };

  return (
    <div className="w-full overflow-x-auto pb-4 custom-scrollbar">
      <div className="min-w-[800px]">
        <div className="flex justify-between text-xs text-[#8E8E93] mb-2 font-mono px-1">
          {hours.filter(h => h % 3 === 0).map(h => (
            <div key={h} className="relative">
              {h}:00
            </div>
          ))}
        </div>

        <div className="h-24 flex rounded-xl overflow-hidden border border-[#38383A] bg-[#1C1C1E]">
          {hours.map((h) => {
            const routine = getActivityForHour(h);
            const color = routine ? getActivityColor(routine.activity) : '#2C2C2E';
            const isStart = routine?.start_hour === h;

            return (
              <motion.div
                key={h}
                className="h-full relative group border-r border-[#1C1C1E]/20"
                style={{ width: `${100/24}%`, backgroundColor: color }}
                whileHover={{ scaleY: 1.1, zIndex: 10 }}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                  <div className="bg-[#2C2C2E] border border-[#38383A] text-white text-xs px-2 py-1 rounded shadow-xl whitespace-nowrap">
                    <span className="font-bold">{h}:00 - {h+1}:00</span><br/>
                    {routine ? `${routine.activity} @ ${routine.location}` : 'Rest'}
                  </div>
                </div>

                {isStart && routine && (
                  <div className="absolute top-2 left-1 truncate text-[10px] text-white/90 font-medium px-1 w-[300%] pointer-events-none drop-shadow-md">
                    {routine.activity}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex gap-4 mt-4 text-xs text-[#8E8E93]">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#FF9F0A]" /> Work</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#32D74B]" /> Trade</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#0A84FF]" /> Security</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#2C2C2E]" /> Rest</div>
        </div>
      </div>
    </div>
  );
}
