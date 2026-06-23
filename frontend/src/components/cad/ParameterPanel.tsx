import { useState, useEffect } from 'react';
import type { ParameterSchema } from '@/types';

interface ParameterPanelProps {
  parameters: Record<string, ParameterSchema>;
  values: Record<string, number | string | boolean>;
  onChange: (name: string, value: number | string | boolean) => void;
}

export function ParameterPanel({ parameters, values, onChange }: ParameterPanelProps) {
  const paramEntries = Object.entries(parameters);
  if (paramEntries.length === 0) return null;

  return (
    <div className="space-y-3.5">
      {paramEntries.map(([name, schema]) => {
        const val = values[name] ?? schema.default;
        const displayName = name.replace(/_/g, ' ');

        if (schema.type === 'bool') {
          return (
            <div key={name} className="group rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all p-4 shadow-md backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-adam-text-primary/95 font-semibold tracking-wide capitalize">
                  {displayName}
                </span>
                <button
                  onClick={() => onChange(name, !val)}
                  className={`relative w-9 h-5 rounded-full transition-all duration-300 outline-none ${
                    val 
                      ? 'bg-adam-blue shadow-[0_0_12px_rgba(0,166,255,0.35)]' 
                      : 'bg-white/[0.06] border border-white/[0.08]'
                  }`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                    val ? 'translate-x-4 bg-white shadow-sm' : 'translate-x-0 bg-adam-neutral-500'
                  }`} />
                </button>
              </div>
              {schema.description && (
                <p className="text-[10px] text-adam-text-tertiary mt-2 leading-relaxed">{schema.description}</p>
              )}
            </div>
          );
        }

        if (schema.type === 'enum' && schema.options && schema.options.length > 0) {
          return (
            <div key={name} className="group rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all p-4 shadow-md backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-adam-text-primary/95 font-semibold tracking-wide capitalize">
                  {displayName}
                </span>
              </div>
              <div className="relative">
                <select
                  value={String(val)}
                  onChange={(e) => onChange(name, e.target.value)}
                  className="w-full text-xs bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-adam-blue/50 focus:ring-1 focus:ring-adam-blue/20 rounded-lg px-3 py-2 text-adam-text-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  {schema.options.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#1C1C1C] text-adam-text-primary">{opt}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-adam-text-tertiary">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {schema.description && (
                <p className="text-[10px] text-adam-text-tertiary mt-2 leading-relaxed">{schema.description}</p>
              )}
            </div>
          );
        }

        if (schema.type === 'string' || schema.type === 'color') {
          return (
            <div key={name} className="group rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all p-4 shadow-md backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-adam-text-primary/95 font-semibold tracking-wide capitalize">
                  {displayName}
                </span>
              </div>
              {schema.type === 'color' ? (
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/[0.1] shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all">
                    <input
                      type="color"
                      value={String(val)}
                      onChange={(e) => onChange(name, e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer scale-150"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: String(val) }} />
                  </div>
                  <input
                    type="text"
                    value={String(val)}
                    onChange={(e) => onChange(name, e.target.value)}
                    className="flex-1 text-xs bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-adam-blue/50 focus:bg-white/[0.05] rounded-lg px-3 py-2 text-adam-text-primary font-mono outline-none transition-all"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={String(val)}
                  onChange={(e) => onChange(name, e.target.value)}
                  className="w-full text-xs bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] focus:border-adam-blue/50 focus:bg-white/[0.05] rounded-lg px-3 py-2 text-adam-text-primary outline-none transition-all"
                />
              )}
              {schema.description && (
                <p className="text-[10px] text-adam-text-tertiary mt-2 leading-relaxed">{schema.description}</p>
              )}
            </div>
          );
        }

        // int / float - slider with input field
        const min = schema.min ?? 0;
        const max = schema.max ?? 100;
        const step = schema.step ?? 1;
        const isFloat = schema.type === 'float';
        const numericVal = typeof val === 'number' ? val : Number(val) || min;
        const pct = ((numericVal - min) / (max - min)) * 100;

        return (
          <SliderParam
            key={name}
            name={name}
            displayName={displayName}
            value={numericVal}
            min={min}
            max={max}
            step={step}
            isFloat={isFloat}
            pct={pct}
            description={schema.description}
            onChange={onChange}
          />
        );
      })}
    </div>
  );
}

function SliderParam({
  name, displayName, value, min, max, step, isFloat, pct, description, onChange,
}: {
  name: string;
  displayName: string;
  value: number;
  min: number;
  max: number;
  step: number;
  isFloat: boolean;
  pct: number;
  description?: string;
  onChange: (name: string, value: number | string | boolean) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(isFloat ? value.toFixed(1) : String(value));
    }
  }, [value, isFloat, isEditing]);

  const commitValue = () => {
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      const rounded = isFloat ? Math.round(clamped / step) * step : Math.round(clamped);
      onChange(name, rounded);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      commitValue();
    } else if (e.key === 'Escape') {
      setInputValue(isFloat ? value.toFixed(1) : String(value));
      setIsEditing(false);
    }
  };

  return (
    <div className="group rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all shadow-md backdrop-blur-sm">
      <div className="px-4 pt-4 pb-1.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-adam-text-primary/95 font-semibold tracking-wide capitalize">
            {displayName}
          </span>
          <input
            type="text"
            value={isEditing ? inputValue : (isFloat ? value.toFixed(1) : String(value))}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsEditing(true);
            }}
            onFocus={() => {
              setIsEditing(true);
              setInputValue(isFloat ? value.toFixed(1) : String(value));
            }}
            onBlur={commitValue}
            onKeyDown={handleKeyDown}
            className="w-16 text-right text-xs text-adam-blue font-mono font-semibold tabular-nums bg-white/[0.02] border border-white/[0.05] rounded px-1.5 py-0.5 outline-none hover:border-white/[0.15] focus:border-adam-blue/50 focus:bg-white/[0.05] transition-all"
          />
        </div>
        {description && (
          <p className="text-[10px] text-adam-text-tertiary mb-2.5 leading-relaxed">{description}</p>
        )}
        <div className="relative h-6 flex items-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-adam-blue to-[#00E5FF] transition-all duration-75"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(name, parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute w-4 h-4 rounded-full bg-[#1C1C1C] border-2 border-adam-blue shadow-[0_0_8px_rgba(0,166,255,0.4)] pointer-events-none transition-transform group-hover:scale-110"
            style={{ left: `calc(${pct}% - 8px)` }}
          />
        </div>
      </div>
      <div className="flex justify-between px-4 pb-3 pt-0.5">
        <span className="text-[10px] text-adam-text-tertiary/75 font-mono">{min}</span>
        <span className="text-[10px] text-adam-text-tertiary/75 font-mono">{max}</span>
      </div>
    </div>
  );
}
