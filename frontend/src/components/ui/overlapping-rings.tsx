import { motion } from 'framer-motion';

export function OverlappingRings() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none opacity-25">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[1200px] min-h-[800px] w-full h-full flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full max-w-none">
          {/* Deep radial violet glow */}
          <radialGradient id="ringBgGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.10" />
            <stop offset="60%" stopColor="#7C4DFF" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#0A0812" stopOpacity="0" />
          </radialGradient>
          <circle cx="720" cy="450" r="600" fill="url(#ringBgGlow)" />

          {/* Overlapping premium concentric rings */}
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C4DFF" stopOpacity="0.18" />
            <stop offset="40%" stopColor="#8B5CF6" stopOpacity="0.03" />
            <stop offset="60%" stopColor="#A78BFA" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#7C4DFF" stopOpacity="0.12" />
          </linearGradient>

          {/* Animated concentric rings */}
          <motion.circle 
            cx="720" cy="450" r="320" 
            stroke="url(#ringGrad)" strokeWidth="1" 
            initial={{ opacity: 0.3, scale: 0.98 }}
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.98, 1.01, 0.98] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.circle 
            cx="500" cy="450" r="420" 
            stroke="url(#ringGrad)" strokeWidth="1"
            initial={{ opacity: 0.2, scale: 0.99 }}
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.99, 1.02, 0.99] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.circle 
            cx="940" cy="450" r="420" 
            stroke="url(#ringGrad)" strokeWidth="1"
            initial={{ opacity: 0.2, scale: 0.99 }}
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.99, 1.02, 0.99] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.circle 
            cx="720" cy="280" r="260" 
            stroke="url(#ringGrad)" strokeWidth="1.2"
            initial={{ opacity: 0.25, scale: 0.97 }}
            animate={{ opacity: [0.25, 0.45, 0.25], scale: [0.97, 1.00, 0.97] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <circle cx="720" cy="620" r="260" stroke="url(#ringGrad)" strokeWidth="1.2" />
        </svg>
      </div>
    </div>
  );
}
