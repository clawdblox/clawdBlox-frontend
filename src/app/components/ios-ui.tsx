import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

// --- IOS Section (Inset Grouped) ---
interface IOSSectionProps {
  title?: string;
  children: ReactNode;
  footer?: string;
  className?: string;
}

export function IOSSection({ title, children, footer, className = '' }: IOSSectionProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {title && (
        <h3 className="px-4 mb-2 text-[13px] text-[#8E8E93] uppercase tracking-wider font-normal ml-1">
          {title}
        </h3>
      )}
      <div className="overflow-hidden rounded-[10px] bg-[#1C1C1E] mx-4">
        {children}
      </div>
      {footer && (
        <p className="px-4 mt-2 text-[13px] text-[#8E8E93] leading-snug ml-1">
          {footer}
        </p>
      )}
    </div>
  );
}

// --- IOS Row ---
interface IOSRowProps {
  icon?: ReactNode;
  label: string;
  value?: ReactNode;
  onClick?: () => void;
  last?: boolean;
  showChevron?: boolean;
  className?: string;
  children?: ReactNode; // For custom content on the right
}

export function IOSRow({ icon, label, value, onClick, last, showChevron, className = '', children }: IOSRowProps) {
  return (
    <div 
      className={`pl-4 flex items-center bg-[#1C1C1E] active:bg-[#2C2C2E] transition-colors min-h-[44px] ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {icon && <div className="mr-3 text-[#05b6f8]">{icon}</div>}
      
      <div 
        className={`flex-1 flex items-center justify-between pr-4 py-3 ${
          !last ? 'border-b border-[#38383A]' : ''
        }`}
      >
        <span className="text-[17px] text-white font-normal">{label}</span>
        
        <div className="flex items-center gap-2">
          {value && <span className="text-[17px] text-[#8E8E93]">{value}</span>}
          {children}
          {showChevron && <ChevronRight size={16} className="text-[#8E8E93] opacity-60" />}
        </div>
      </div>
    </div>
  );
}

// --- IOS Input Row ---
interface IOSInputRowProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password';
  last?: boolean;
}

export function IOSInputRow({ label, value, onChange, placeholder, type = 'text', last }: IOSInputRowProps) {
  return (
    <div className="pl-4 flex items-center bg-[#1C1C1E] min-h-[44px]">
      <div 
        className={`flex-1 flex items-center justify-between pr-4 py-3 ${
          !last ? 'border-b border-[#38383A]' : ''
        }`}
      >
        <span className="text-[17px] text-white w-[100px] shrink-0">{label}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[17px] text-[#05b6f8] placeholder-[#8E8E93]/50 outline-none text-right"
        />
      </div>
    </div>
  );
}

// --- IOS Segmented Control ---
interface IOSSegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function IOSSegmentedControl<T extends string>({ options, value, onChange }: IOSSegmentedControlProps<T>) {
  return (
    <div className="bg-[#767680]/24 p-0.5 rounded-[9px] flex h-[32px] w-full relative">
      {/* Active Indicator */}
      <motion.div
        className="absolute top-0.5 bottom-0.5 bg-[#636366] rounded-[7px] shadow-sm z-0"
        layoutId="segmentedIndicator"
        initial={false}
        animate={{
          left: `${(options.findIndex(o => o.value === value) / options.length) * 100}%`,
          width: `${100 / options.length}%`
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex-1 relative z-10 text-[13px] font-medium transition-colors text-center flex items-center justify-center"
            style={{
              color: isActive ? '#FFFFFF' : '#8E8E93',
              fontWeight: isActive ? 600 : 400
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// --- IOS Slider Row ---
interface IOSSliderRowProps {
  label: string;
  value: number; // 0 to 1
  onChange: (val: number) => void;
  minLabel?: string;
  maxLabel?: string;
  color?: string;
  last?: boolean;
}

export function IOSSliderRow({ label, value, onChange, minLabel, maxLabel, color = '#05b6f8', last }: IOSSliderRowProps) {
  return (
    <div className="pl-4 bg-[#1C1C1E]">
      <div className={`pr-4 py-3 ${!last ? 'border-b border-[#38383A]' : ''}`}>
        <div className="flex justify-between mb-2">
          <span className="text-[15px] text-white">{label}</span>
          <span className="text-[15px] font-mono text-[#8E8E93]">{value.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-[#38383A] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
          style={{ accentColor: color }}
        />
        {(minLabel || maxLabel) && (
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-[#8E8E93]">{minLabel}</span>
            <span className="text-[11px] text-[#8E8E93]">{maxLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
