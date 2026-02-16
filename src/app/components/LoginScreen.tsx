import { useState } from 'react';
import { Eye, EyeOff, Play, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuthStore } from '../../stores/auth.store';

function FloatingOrb({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(1px)',
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: Math.random() * 3 + 4,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

export function LoginScreen() {
  const { login, setup, isLoading, error, clearError } = useAuthStore();
  const [isSetup, setIsSetup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [focusField, setFocusField] = useState<string | null>(null);

  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      triggerShake();
      return;
    }

    if (isSetup) {
      if (!displayName || !projectName) {
        setLocalError('Please fill in all fields.');
        triggerShake();
        return;
      }
      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters.');
        triggerShake();
        return;
      }
      const ok = await setup(email, password, displayName, projectName);
      if (!ok) triggerShake();
    } else {
      const ok = await login(email, password);
      if (!ok) triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const getInputClass = (field: string) => {
    const isFocused = focusField === field;
    return `w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-[16px] text-white placeholder-[#636366] ${
      isFocused
        ? 'bg-primary/10 border border-primary/40'
        : 'bg-white/5 border border-white/10'
    }`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-background">
      {/* Background Gradient - Graphite based */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#24272F] via-[#1c1e24] to-[#15171b]" />

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb delay={0} x="10%" y="15%" size={120} color="rgba(5,182,248,0.08)" />
        <FloatingOrb delay={1.5} x="75%" y="20%" size={80} color="rgba(255,255,255,0.05)" />
        <FloatingOrb delay={0.8} x="60%" y="70%" size={150} color="rgba(5,182,248,0.05)" />
        <FloatingOrb delay={2} x="20%" y="80%" size={60} color="rgba(5,182,248,0.1)" />
        <FloatingOrb delay={1} x="85%" y="55%" size={90} color="rgba(5,182,248,0.04)" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(5,182,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(5,182,248,0.5) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        {/* Floating particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              backgroundColor: `rgba(5, 182, 248, ${Math.random() * 0.3 + 0.1})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -(Math.random() * 40 + 10), 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[340px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 mb-5 relative"
            animate={{
              filter: [
                'drop-shadow(0 8px 32px rgba(5,182,248,0.3))',
                'drop-shadow(0 8px 40px rgba(5,182,248,0.5))',
                'drop-shadow(0 8px 32px rgba(5,182,248,0.3))',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src="/logo.png" alt="ClawdBlox" className="w-full h-full object-contain" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[30px] font-bold text-white tracking-tight drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
          >
            ClawdBlox
          </motion.h1>
          <motion.div
            className="flex items-center justify-center gap-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Sparkles size={14} className="text-primary" />
            <p className="text-[14px] font-medium text-primary/70 tracking-widest uppercase">
              MemoryWeave
            </p>
          </motion.div>
        </div>

        {/* Form Card */}
        <motion.div
          className="rounded-3xl p-6 bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.form
            onSubmit={handleSubmit}
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-3">
              {isSetup && (
                <>
                  <input
                    type="text"
                    placeholder="Display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onFocus={() => setFocusField('displayName')}
                    onBlur={() => setFocusField(null)}
                    className={getInputClass('displayName')}
                  />
                  <input
                    type="text"
                    placeholder="Project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    onFocus={() => setFocusField('projectName')}
                    onBlur={() => setFocusField(null)}
                    className={getInputClass('projectName')}
                  />
                </>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField(null)}
                className={getInputClass('email')}
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                  className={`${getInputClass('password')} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {(error || localError) && (
              <motion.p
                className="mt-3 text-center px-2 py-2 rounded-lg bg-red-500/10 text-red-400 text-[13px]"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error || localError}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-5 py-3.5 rounded-xl transition-all active:scale-[0.97] bg-gradient-to-br from-[#05b6f8] to-[#0498d0] text-white text-[17px] font-bold shadow-lg shadow-primary/30 tracking-tight disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {isSetup ? 'Set up' : 'Sign in'}
            </button>
          </motion.form>
        </motion.div>

        <button
          onClick={() => { setIsSetup(!isSetup); clearError(); setLocalError(null); }}
          className="w-full mt-5 text-center transition-colors text-white/35 hover:text-white/60 text-[14px]"
        >
          {isSetup ? 'Already have an account? Sign in' : 'First time? Set up'}
        </button>

        <p className="text-center mt-8 text-white/15 text-[11px] tracking-wider">
          2026 ClawdBlox — MIT License
        </p>
      </motion.div>
    </div>
  );
}
