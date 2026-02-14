import { ReactNode } from 'react';

interface MacCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

export function MacCard({ children, className = '', title, action, hover, onClick }: MacCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-[#1C1C1E] border border-[#38383A] rounded-xl overflow-hidden
        ${hover ? 'hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/50 cursor-pointer transition-all duration-200' : ''}
        ${className}
      `}
    >
      {(title || action) && (
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#38383A]/50">
          {title && <h3 className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-0 flex-1 flex flex-col min-h-0">
        {children}
      </div>
    </div>
  );
}

interface MacTableProps {
  headers: string[];
  children: ReactNode;
}

export function MacTable({ headers, children }: MacTableProps) {
  return (
    <div className="w-full">
      <div className="flex items-center px-6 py-3 border-b border-[#38383A]">
        {headers.map((h, i) => (
          <div key={i} className={`flex-1 text-[12px] font-medium text-[#8E8E93] uppercase tracking-wide ${i === 0 ? 'pl-2' : ''}`}>
            {h}
          </div>
        ))}
      </div>
      <div className="divide-y divide-[#38383A]/50">
        {children}
      </div>
    </div>
  );
}

export function MacTableRow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`
        flex items-center px-6 py-4 hover:bg-white/[0.02] transition-colors
        ${onClick ? 'cursor-pointer active:bg-white/[0.04]' : ''}
      `}
    >
      {children}
    </div>
  );
}

export function MacInsetSection({ title, children, footer }: { title?: string; children: ReactNode; footer?: string }) {
  return (
    <div className="mb-6 max-w-2xl">
      {title && <h3 className="px-4 mb-2 text-[13px] font-medium text-[#8E8E93] uppercase tracking-wide">{title}</h3>}
      <div className="bg-[#1C1C1E] border border-[#38383A] rounded-xl overflow-hidden divide-y divide-[#38383A]/50">
        {children}
      </div>
      {footer && <p className="px-4 mt-2 text-[13px] text-[#8E8E93]">{footer}</p>}
    </div>
  );
}

export function MacInputRow({ label, value, onChange, type = 'text', placeholder, action }: any) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1C1C1E]">
      <label className="text-[15px] font-medium text-white min-w-[150px]">{label}</label>
      <div className="flex items-center gap-3 flex-1 justify-end">
        <input 
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-right bg-transparent border-none outline-none text-[#05b6f8] placeholder-[#636366] transition-colors"
        />
        {action}
      </div>
    </div>
  );
}

export function MacToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#1C1C1E]">
      <label className="text-[15px] font-medium text-white">{label}</label>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-200 ease-in-out ${checked ? 'bg-[#34C759]' : 'bg-[#38383A]'}`}
      >
        <div 
          className={`w-[27px] h-[27px] bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}
