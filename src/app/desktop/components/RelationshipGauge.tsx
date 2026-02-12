import { MacCard } from './MacUI';

interface RelationshipGaugeProps {
  value: number; // 0 to 1
  label: string;
  color?: string;
  size?: number;
}

export function RelationshipGauge({ value, label, color = '#05b6f8', size = 80 }: RelationshipGaugeProps) {
  // Normalize value between 0 and 1
  const normalizedValue = Math.min(Math.max(value, 0), 1);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedValue * circumference);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#2C2C2E"
            strokeWidth={strokeWidth}
          />
          {/* Foreground Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-white font-semibold font-mono text-sm">
          {Math.round(normalizedValue * 100)}%
        </div>
      </div>
      <span className="mt-2 text-xs font-medium text-[#8E8E93] uppercase tracking-wide">{label}</span>
    </div>
  );
}

interface RelationshipRowProps {
  player: string;
  affinity: number;
  trust: number;
  familiarity: number;
}

export function RelationshipRow({ player, affinity, trust, familiarity }: RelationshipRowProps) {
  return (
    <div className="flex items-center p-4 bg-[#2C2C2E]/50 rounded-xl mb-3 border border-[#38383A]/50 hover:border-[#05b6f8]/30 transition-colors">
      <div className="flex-1">
        <div className="font-semibold text-white">{player}</div>
        <div className="text-xs text-[#8E8E93]">Last interaction: 2h ago</div>
      </div>
      <div className="flex gap-8">
        <RelationshipGauge value={affinity} label="Affinity" color="#34C759" size={50} />
        <RelationshipGauge value={trust} label="Trust" color="#05b6f8" size={50} />
        <RelationshipGauge value={familiarity} label="Familiarity" color="#FF9F0A" size={50} />
      </div>
    </div>
  );
}
