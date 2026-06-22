import {
  Search, HelpCircle, Code, Cpu, Ruler, Camera, Eye,
  PackageCheck, Check, type LucideIcon,
} from 'lucide-react';
import type { WorkflowStep } from '@/types';

const ICONS: Record<string, LucideIcon> = {
  search: Search,
  'help-circle': HelpCircle,
  code: Code,
  cpu: Cpu,
  ruler: Ruler,
  camera: Camera,
  eye: Eye,
  'package-check': PackageCheck,
};

// Hardcoded 7-step skeleton shown when no live steps are available
// (e.g. when loading a session from history)
const SKELETON_STEPS: WorkflowStep[] = [
  { id: 'analyze', icon: 'search', label: 'Analyzing request', detail: 'Identifying geometry type and parameters', status: 'done', timestamp: 0 },
  { id: 'clarify', icon: 'help-circle', label: 'Specifications', detail: 'Clarification options were offered', status: 'done', timestamp: 0 },
  { id: 'generate', icon: 'code', label: 'Writing CadQuery code', detail: 'Drafting parametric Python script', status: 'done', timestamp: 0 },
  { id: 'execute', icon: 'cpu', label: 'Executing CadQuery', detail: 'Sandbox run completed', status: 'done', timestamp: 0 },
  { id: 'inspect', icon: 'ruler', label: 'Inspecting geometry', detail: 'Geometry validation passed', status: 'done', timestamp: 0 },
  { id: 'dimviews', icon: 'camera', label: 'Drawing dimensional views', detail: 'Orthographic projections rendered', status: 'done', timestamp: 0 },
  { id: 'vision', icon: 'eye', label: 'Visual inspection', detail: 'Render matches the request', status: 'done', timestamp: 0 },
  { id: 'deliver', icon: 'package-check', label: 'Preparing deliverables', detail: 'Files packaged and ready', status: 'done', timestamp: 0 },
];

interface WorkflowTimelineProps {
  steps?: WorkflowStep[];
  provider?: string;
}

export function WorkflowTimeline({ steps, provider }: WorkflowTimelineProps) {
  // Use live steps if provided, otherwise the hardcoded skeleton.
  const displaySteps = steps && steps.length > 0 ? steps : SKELETON_STEPS;

  const doneCount = displaySteps.filter(s => s.status === 'done').length;

  return (
    <div className="mt-2 rounded-xl border border-adam-neutral-700/40 bg-[#1a1a1a]/80 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-adam-neutral-700/30 bg-[#1e1e1e]/60">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold text-adam-text-tertiary uppercase tracking-[0.1em]">Workflow</span>
          <span className="text-[10px] text-adam-text-tertiary">
            {doneCount}/{displaySteps.length} steps
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="relative px-3 py-2">
        <div className="absolute left-[1.375rem] top-3 bottom-3 w-px bg-adam-neutral-700/30" />

        <div className="space-y-1">
          {displaySteps.map((step) => {
            const Icon = ICONS[step.icon] || Code;
            const isDone = step.status === 'done';

            return (
              <div key={step.id} className="relative">
                <div className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg">
                  {/* Icon */}
                  <div className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center ${
                    isDone
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-adam-neutral-800 text-adam-text-tertiary'
                  }`}>
                    {isDone ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="flex-1 text-left">
                    <span className="text-[12px] text-adam-text-secondary">{step.label}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    {isDone && (
                      <span className="text-[9px] text-emerald-400 font-medium">Done</span>
                    )}
                  </div>
                </div>

                {/* Static detail row */}
                {step.detail && (
                  <div className="pl-8 pr-2 pb-1.5">
                    <div className="text-[11px] text-adam-text-tertiary leading-relaxed">
                      {step.detail}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
