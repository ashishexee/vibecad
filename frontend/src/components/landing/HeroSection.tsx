import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { NutToggle } from '@/components/hardware/NutToggle';
import { LandingChatInput } from './LandingChatInput';

interface HeroSectionProps {
  onStart: (prompt: string) => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  const [showWireframe, setShowWireframe] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowWireframe(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden bg-adam-bg-dark">
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-adam-blue/5 mix-blend-normal filter blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/5 mix-blend-normal filter blur-[120px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-adam-blue/[0.02] mix-blend-normal filter blur-[160px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
        {/* Logo badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm mb-8"
        >
          <Sparkles className="w-4 h-4 text-adam-blue/80" />
          <span className="text-[11px] font-medium text-adam-text-secondary uppercase tracking-wider">Open-source text-to-CAD</span>
        </motion.div>

        {/* Headline */}
        <h1
          className={`font-title font-bold text-adam-text-primary text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          CAD by
          <br />
          <span className="text-adam-blue">description.</span>
        </h1>

        {/* Subheadline */}
        <p className={`text-base md:text-lg text-adam-text-secondary/80 max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Type a part. Chamfer AI generates CadQuery Python, runs it on a real OpenCASCADE B-rep kernel, and exports STEP, STL, and GLB.
        </p>

        {/* Chat input */}
        <div className="max-w-xl mx-auto">
          <LandingChatInput onStart={onStart} />
        </div>

        {/* Model preview */}
        <div className={`mt-14 flex justify-center transition-all duration-1000 delay-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl border border-white/[0.06] bg-black/30 shadow-2xl overflow-hidden backdrop-blur-sm">
            <svg viewBox="0 0 400 300" className="w-full h-full">
              <defs>
                <linearGradient id="solidFillDark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00A6FF" />
                  <stop offset="100%" stopColor="#0066CC" />
                </linearGradient>
              </defs>
              {/* Grid */}
              <pattern id="previewGridDark" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
              <rect width="400" height="300" fill="url(#previewGridDark)" />

              {/* Wireframe cube */}
              <g className={`transition-opacity duration-700 ${showWireframe ? 'opacity-100' : 'opacity-0'}`}>
                <path d="M150 120 L250 80 L330 120 L230 160 Z" fill="none" stroke="rgba(0,166,255,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
                <path d="M150 120 L150 200 L230 240 L230 160" fill="none" stroke="rgba(0,166,255,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
                <path d="M250 80 L250 160 L230 240 M250 160 L330 200 M330 120 L330 200" fill="none" stroke="rgba(0,166,255,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
                <path d="M150 200 L250 160 L330 200" fill="none" stroke="rgba(0,166,255,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
              </g>

              {/* Solid cube */}
              <g className={`transition-opacity duration-700 ${showWireframe ? 'opacity-0' : 'opacity-100'}`}>
                <path d="M150 120 L250 80 L330 120 L230 160 Z" fill="url(#solidFillDark)" opacity="0.95" />
                <path d="M150 120 L150 200 L230 240 L230 160 Z" fill="#0055AA" opacity="0.85" />
                <path d="M250 80 L250 160 L330 200 L330 120 Z" fill="#0077DD" opacity="0.7" />
                <path d="M150 200 L250 160 L330 200 L230 240 Z" fill="#0066CC" opacity="0.9" />
                <path d="M230 160 L250 160 L250 80 M230 160 L230 240" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
              </g>

              {/* Dimension line */}
              <g className={`transition-opacity duration-700 ${showWireframe ? 'opacity-0' : 'opacity-100'}`}>
                <line x1="40" y1="200" x2="150" y2="200" stroke="#F59E0B" strokeWidth="1.5" />
                <path d="M40 196 V204 M150 196 V204" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="95" y="220" textAnchor="middle" className="font-mono text-[12px] fill-adam-text-tertiary">60.0 mm</text>
              </g>
            </svg>

            {/* Status pill */}
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] text-xs font-medium text-adam-text-secondary">
              <div className="w-2 h-2 rounded-full bg-adam-blue animate-pulse" />
              {showWireframe ? 'Wireframe' : 'Solid B-rep'}
            </div>
          </div>
        </div>

        {/* Tech badges */}
        <div className={`flex flex-wrap items-center justify-center gap-4 mt-12 transition-all duration-700 delay-800 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <NutToggle checked={!showWireframe} onChange={setShowWireframe} label="Show solid" size="sm" />
          <span className="text-xs text-adam-text-tertiary">CadQuery · OpenCASCADE · STEP · STL · GLB</span>
        </div>
      </div>
    </section>
  );
}
