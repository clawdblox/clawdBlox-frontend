import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useUIStore } from './app-store';

interface NavigationHeaderProps {
  title: string;
  largeTitle?: boolean;
  backTitle?: string;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export function NavigationHeader({
  title,
  largeTitle = false,
  backTitle,
  rightAction,
  onBack,
  showBack = false,
}: NavigationHeaderProps) {
  const { popScreen } = useUIStore();

  const handleBack = () => {
    if (onBack) onBack();
    else popScreen();
  };

  if (largeTitle) {
    return (
      <div className="px-5 pt-4 pb-2 bg-background/95 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-end justify-between">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[34px] font-bold text-foreground leading-[1.1] tracking-tight"
          >
            {title}
          </motion.h1>
          {rightAction && <div>{rightAction}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center px-4 h-[44px] sm:h-[48px] bg-background/90 backdrop-blur-xl border-b border-white/5 z-20">
      {showBack && (
        <button
          onClick={handleBack}
          className="absolute left-1 flex items-center gap-0 text-primary active:opacity-60 transition-opacity"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
          {backTitle && (
            <span className="text-[17px] font-normal -ml-1">
              {backTitle}
            </span>
          )}
        </button>
      )}
      <span className="text-[17px] font-semibold text-foreground tracking-tight">
        {title}
      </span>
      {rightAction && <div className="absolute right-4 text-primary">{rightAction}</div>}
    </div>
  );
}
