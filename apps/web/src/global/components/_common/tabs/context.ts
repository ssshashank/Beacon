import { createContext, useContext, Accessor, Setter } from "solid-js";

type TabRecord = {
  value: string;
  index: number;
  el?: HTMLElement;
};

type TabsContextType = {
  activeTab: Accessor<string>;
  setActiveTab: Setter<string>;
  registerTab: (tab: TabRecord) => number;
  registerTriggerEl: (value: string, el: HTMLElement) => void;
  tabs: Accessor<TabRecord[]>;
  orientation: Accessor<"horizontal" | "vertical">;
  lockedTabs: Accessor<string[]>;
};

const TabsContext = createContext<TabsContextType>();

const useTabs = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs component must be inside [Tabs]");
  return ctx;
};

export { TabsContext, useTabs };
export type { TabRecord, TabsContextType };
