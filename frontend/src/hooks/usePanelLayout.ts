import { useState, useRef, useCallback, useEffect } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import type { AppStore } from "@/hooks/useAppStore";

/**
 * Manages panel collapse/expand state, animation timing, and toggle logic.
 * Extracted from the monolithic App.tsx.
 */
export function usePanelLayout(store: AppStore) {
  const { sidebarManuallyToggled, setSidebarOpen } = store;

  const [collapsed, setCollapsed] = useState({
    chat: false,
    preview: false,
    right: false,
  });
  const [panelAnimating, setPanelAnimating] = useState(false);
  const [rotatingKey, setRotatingKey] = useState<"chat" | "right" | null>(null);

  const chatPanelRef = useRef<PanelImperativeHandle | null>(null);
  const previewPanelRef = useRef<PanelImperativeHandle | null>(null);
  const rightPanelRef = useRef<PanelImperativeHandle | null>(null);

  const togglePanel = useCallback(
    (
      key: "chat" | "preview" | "right",
      ref: React.RefObject<PanelImperativeHandle | null>,
    ) => {
      const panel = ref.current;
      if (!panel) return;
      const willCollapse = !panel.isCollapsed();
      setCollapsed((c) => ({ ...c, [key]: willCollapse }));
      setPanelAnimating(true);
      if (key !== "preview") setRotatingKey(key);
      window.requestAnimationFrame(() => {
        if (willCollapse) panel.collapse();
        else panel.expand();
      });
      window.setTimeout(() => {
        setPanelAnimating(false);
        if (key !== "preview") setRotatingKey(null);
      }, 700);
    },
    [],
  );

  const hasModel =
    store.messages.length > 0 || store.isGenerating;

  // Auto-adjust sidebar: open on landing, closed on working page (unless user manually toggled)
  useEffect(() => {
    if (sidebarManuallyToggled.current) return;
    setSidebarOpen(!hasModel);
  }, [hasModel]);

  return {
    collapsed,
    setCollapsed,
    panelAnimating,
    rotatingKey,
    chatPanelRef,
    previewPanelRef,
    rightPanelRef,
    togglePanel,
    hasModel,
  };
}
