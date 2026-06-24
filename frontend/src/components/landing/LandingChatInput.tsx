import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Paperclip, Sparkles, Command, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PLACEHOLDER_PROMPTS } from '@/lib/constants';

const COMMAND_SUGGESTIONS = [
  { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Gear', prompt: 'Make me a 12-tooth spur gear' },
  { icon: <ImageIcon className="w-3.5 h-3.5" />, label: 'Bracket', prompt: 'Make me a wall bracket for a shelf' },
  { icon: <Command className="w-3.5 h-3.5" />, label: 'Enclosure', prompt: 'Make me a 60 mm electronics enclosure' },
  { icon: <Paperclip className="w-3.5 h-3.5" />, label: 'Connector', prompt: 'Make me a pipe connector' },
];

interface LandingChatInputProps {
  onStart: (prompt: string) => void;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-adam-blue/80"
          initial={{ opacity: 0.3, scale: 0.85 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function LandingChatInput({ onStart }: LandingChatInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isFocused) setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isFocused]);

  const adjustHeight = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '56px';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    setIsSending(true);
    onStart(trimmed);
  }, [value, isSending, onStart]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestion = (prompt: string) => {
    setValue('');
    setIsSending(true);
    onStart(prompt);
  };

  return (
    <div className="w-full" ref={inputRef}>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className={cn(
          'relative rounded-2xl border transition-all duration-300',
          'backdrop-blur-xl bg-white/[0.02] shadow-2xl',
          isFocused
            ? 'border-adam-blue/50 shadow-[0_0_0_3px_rgba(0,166,255,0.06),0_0_30px_rgba(0,166,255,0.04)]'
            : 'border-white/[0.06] hover:border-white/[0.10]'
        )}
      >
        <div className="relative">
          {/* Animated placeholder */}
          {!value && !isSending && (
            <div className="absolute left-5 top-[18px] pointer-events-none select-none">
              <AnimatePresence mode="wait">
                <motion.span
                  key={placeholderIndex}
                  className="text-sm text-adam-text-tertiary/60"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  {PLACEHOLDER_PROMPTS[placeholderIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            rows={1}
            className={cn(
              'w-full bg-transparent pt-[18px] pb-3 px-5',
              'text-sm text-adam-text-primary resize-none outline-none',
              'placeholder:text-transparent',
              'min-h-[56px]',
              'font-sans leading-relaxed'
            )}
            style={{ overflow: 'hidden' }}
          />
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-adam-text-tertiary hover:text-adam-text-secondary hover:bg-white/[0.04] transition-colors"
              title="Attach image"
            >
              <Paperclip className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            {isSending && (
              <div className="flex items-center gap-2 text-[11px] text-adam-text-tertiary">
                <span>Generating</span>
                <TypingDots />
              </div>
            )}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() || isSending}
              whileTap={value.trim() && !isSending ? { scale: 0.95 } : {}}
              className={cn(
                'h-8 px-3 flex items-center gap-1.5 rounded-xl text-xs font-medium transition-all',
                value.trim() && !isSending
                  ? 'bg-adam-blue text-white shadow-[0_0_12px_rgba(0,166,255,0.2)] hover:shadow-[0_0_18px_rgba(0,166,255,0.3)]'
                  : 'bg-white/[0.04] text-adam-text-tertiary cursor-not-allowed'
              )}
            >
              <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              Send
            </motion.button>
          </div>
        </div>

        {/* Mouse glow */}
        {isFocused && (
          <motion.div
            className="absolute pointer-events-none rounded-2xl"
            style={{
              width: 400,
              height: 400,
              background: 'radial-gradient(circle, rgba(0,166,255,0.06) 0%, transparent 70%)',
              x: mousePos.x - 200,
              y: mousePos.y - 200,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </motion.div>

      {/* Command suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease: [0.25, 1, 0.5, 1] }}
        className="flex flex-wrap items-center justify-center gap-2 mt-4"
      >
        {COMMAND_SUGGESTIONS.map((suggestion, index) => (
          <motion.button
            key={suggestion.label}
            onClick={() => handleSuggestion(suggestion.prompt)}
            disabled={isSending}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.06, duration: 0.3 }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
              'text-adam-text-tertiary hover:text-adam-text-secondary',
              'bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08]',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {suggestion.icon}
            {suggestion.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
