import { ChevronRight, Save } from "lucide-react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { AppStore } from "@/hooks/useAppStore";
import { PARAM_PHASES } from "@/lib/constants";
import { ParameterPanel } from "@/components/cad/ParameterPanel";
import { ExportSection } from "@/components/cad/ExportSection";
import { CodeSection } from "@/components/cad/CodeSection";
import { SnapshotGallery } from "@/components/cad/SnapshotGallery";
import { InspectionPanel } from "@/components/cad/InspectionPanel";
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";

interface InspectPanelProps {
  store: AppStore;
  onStoreIteration: () => void;
}

/**
 * The full right panel — inspect, snapshots, parameters, export, code, and empty state.
 * Extracted from the ~250-line right panel section of App.tsx render.
 */
export function InspectPanel({ store, onStoreIteration }: InspectPanelProps) {
  const {
    inspection,
    inspectExpanded,
    setInspectExpanded,
    snapshots,
    snapshotsExpanded,
    setSnapshotsExpanded,
    parameters,
    parametersExpanded,
    setParametersExpanded,
    paramValues,
    handleParamChange,
    isParamUpdating,
    paramError,
    hasUnsavedParamIteration,
    currentCode,
    isStoringIteration,
    chatSessionId,
    latestMessageOrder,
    modelStorageStatus,
    stlBase64,
    stepBase64,
    exportFilename,
    setExportFilename,
    rootHashes,
    exportExpanded,
    setExportExpanded,
    codeExpanded,
    setCodeExpanded,
  } = store;

  const hasInspection = inspection != null;
  const hasSnapshots = Object.keys(snapshots).length > 0;
  const hasParameters = Object.keys(parameters).length > 0;
  const hasExport = !!(stlBase64 || stepBase64);
  const hasCode = !!currentCode;
  const isEmpty = !hasParameters && !hasCode;

  return (
    <div className="flex h-full flex-col relative">
      {/* Inspect header */}
      <div
        onClick={() => setInspectExpanded(!inspectExpanded)}
        className="flex items-center justify-between px-4 py-3 border-b border-adam-neutral-700/40 bg-gradient-to-b from-white/[0.02] to-transparent cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <ChevronRight
            className={`h-3.5 w-3.5 text-adam-text-tertiary transition-transform duration-200 ${inspectExpanded ? "rotate-90" : ""}`}
          />
          <span className="font-title font-bold text-adam-text-tertiary uppercase tracking-widest">
            Inspect
          </span>
        </div>
        {hasInspection && (
          <div className="flex items-center gap-1.5">
            {inspection!.errors && inspection!.errors.length > 0 ? (
              <>
                <XCircle className="h-3.5 w-3.5 text-red-400/90" />
                <span className="font-title font-bold text-red-400/90 tracking-wide">
                  Issues
                </span>
              </>
            ) : inspection!.warnings && inspection!.warnings.length > 0 ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-400/90" />
                <span className="font-title font-bold text-yellow-400/90 tracking-wide">
                  Warnings
                </span>
              </>
            ) : null}
          </div>
        )}
      </div>

      <div className="chat-scroll flex-1 overflow-y-auto">
        {/* Inspection */}
        {hasInspection && inspectExpanded && (
          <div className="border-b border-adam-neutral-700/40">
            <InspectionPanel inspection={inspection!} />
          </div>
        )}

        {/* Snapshots */}
        {hasSnapshots && (
          <div className="border-b border-adam-neutral-700/40">
            <div
              onClick={() => setSnapshotsExpanded(!snapshotsExpanded)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-3.5 w-3.5 text-adam-text-tertiary transition-transform duration-200 ${snapshotsExpanded ? "rotate-90" : ""}`}
                />
                <h3 className="font-title font-bold text-adam-text-tertiary uppercase tracking-widest">
                  Snapshots
                </h3>
              </div>
              <span className="text-[10px] text-adam-text-tertiary/60 tabular-nums">
                {
                  Object.keys(snapshots).filter(
                    (k) => snapshots[k] && !snapshots[k].includes("error"),
                  ).length
                }{" "}
                views
              </span>
            </div>
            {snapshotsExpanded && <SnapshotGallery snapshots={snapshots} />}
          </div>
        )}

        {/* Parameters */}
        {hasParameters && (
          <div className="border-b border-adam-neutral-700/40">
            <div
              onClick={() => setParametersExpanded(!parametersExpanded)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-3.5 w-3.5 text-adam-text-tertiary transition-transform duration-200 ${parametersExpanded ? "rotate-90" : ""}`}
                />
                <h3 className="font-title font-bold text-adam-text-tertiary/80 uppercase tracking-widest">
                  Parameters
                </h3>
              </div>
              <span className="text-[10px] text-adam-text-tertiary/60 tabular-nums">
                {Object.keys(parameters).length} params
              </span>
            </div>
            {parametersExpanded && (
              <div className="px-4 pb-4">
                <ParameterPanel
                  parameters={parameters}
                  values={paramValues}
                  onChange={handleParamChange}
                />
                {isParamUpdating && (
                  <div className="mt-3">
                    <ProgressiveFluxLoader
                      phases={PARAM_PHASES}
                      showLabel={false}
                      barClassName="h-1.5"
                      className="gap-0"
                    />
                  </div>
                )}
                {paramError && (
                  <div className="mt-2 flex items-start gap-2 text-[11px] text-red-400/90 bg-red-500/[0.06] rounded-lg px-3 py-2 ring-1 ring-red-500/10">
                    {paramError}
                  </div>
                )}
                {hasUnsavedParamIteration && currentCode && (
                  <button
                    type="button"
                    onClick={onStoreIteration}
                    disabled={
                      isStoringIteration ||
                      !chatSessionId ||
                      latestMessageOrder === null
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-adam-blue/50 bg-adam-blue/10 px-3 py-2 text-xs font-medium text-adam-blue transition-colors hover:bg-adam-blue/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {isStoringIteration ? (
                      <span>
                        Starting{" "}
                        <span className="text-pink-400 font-bold">0G</span>{" "}
                        storage...
                      </span>
                    ) : (
                      "Store this iteration"
                    )}
                  </button>
                )}
                {modelStorageStatus && (
                  <div className="mt-2 text-[10px] text-adam-text-tertiary bg-adam-neutral-800/60 rounded-md px-2 py-1.5">
                    {modelStorageStatus}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Export */}
        {hasExport && (
          <div className="border-b border-adam-neutral-700/40">
            <div
              onClick={() => setExportExpanded(!exportExpanded)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-3.5 w-3.5 text-adam-text-tertiary transition-transform duration-200 ${exportExpanded ? "rotate-90" : ""}`}
                />
                <h3 className="font-title font-bold text-adam-text-tertiary uppercase tracking-widest">
                  Export{" "}
                  <span className="text-[10px] font-sans font-normal text-pink-400/70 normal-case tracking-normal">
                    by
                  </span>{" "}
                  <span className="text-pink-400 font-bold">0G</span>
                </h3>
              </div>
            </div>
            {exportExpanded && (
              <ExportSection
                stlBase64={stlBase64}
                stepBase64={stepBase64}
                exportFilename={exportFilename}
                setExportFilename={setExportFilename}
                rootHashStl={rootHashes?.stl}
                rootHashStep={rootHashes?.step}
              />
            )}
          </div>
        )}

        {/* Generated Code */}
        {hasCode && (
          <div className="border-b border-adam-neutral-700/40">
            <div
              onClick={() => setCodeExpanded(!codeExpanded)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
            >
              <div className="flex items-center gap-2">
                <ChevronRight
                  className={`h-3.5 w-3.5 text-adam-text-tertiary transition-transform duration-200 ${codeExpanded ? "rotate-90" : ""}`}
                />
                <h3 className="font-title font-bold text-adam-text-secondary uppercase tracking-widest">
                  Generated Code{" "}
                  <span className="text-[10px] font-sans font-normal text-pink-400/70 normal-case tracking-normal">
                    by
                  </span>{" "}
                  <span className="text-pink-400 font-bold">0G</span>
                </h3>
              </div>
            </div>
            {codeExpanded && <CodeSection code={currentCode} />}
          </div>
        )}

        {/* Empty State */}
        {isEmpty && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-adam-neutral-800 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-5 h-5 text-adam-text-tertiary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.59.659H9.06a2.25 2.25 0 0 1-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 0 1-2.25 2.25H7.25A2.25 2.25 0 0 1 5 17v-2.5"
                  />
                </svg>
              </div>
              <p className="text-xs text-adam-text-tertiary">
                Generate a model to see parameters and code
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
