import { Search } from 'lucide-react';
import { WorkflowTimeline } from './WorkflowTimeline';
import type { WorkflowStep } from '@/types';

interface StreamingMessageProps {
  steps?: WorkflowStep[];
}

export function StreamingMessage({ steps }: StreamingMessageProps) {
  const hasSteps = steps && steps.length > 0;

  return (
    <div className="bg-adam-background-1 rounded-xl p-3 text-sm">
      {hasSteps ? (
        <WorkflowTimeline steps={steps} />
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-adam-blue/15">
            <Search className="h-3 w-3 text-adam-blue animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-[12px] text-adam-blue font-medium">Consulting clarifier agent...</div>
            <div className="text-[10px] text-adam-text-tertiary mt-0.5">Checking if your prompt has enough detail</div>
          </div>
          <div className="flex gap-1">
            <span className="w-1 h-1 bg-adam-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-1 bg-adam-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-1 bg-adam-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );
}
