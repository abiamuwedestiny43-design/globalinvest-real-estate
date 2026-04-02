import { createContext, useCallback, useContext, useState } from "react";

interface CompareContextValue {
  compareIds: bigint[];
  addToCompare: (id: bigint) => void;
  removeFromCompare: (id: bigint) => void;
  clearCompare: () => void;
  isInCompare: (id: bigint) => boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareIds, setCompareIds] = useState<bigint[]>([]);

  const addToCompare = useCallback((id: bigint) => {
    setCompareIds((prev) => {
      if (prev.includes(id) || prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const removeFromCompare = useCallback((id: bigint) => {
    setCompareIds((prev) => prev.filter((cid) => cid !== id));
  }, []);

  const clearCompare = useCallback(() => setCompareIds([]), []);

  const isInCompare = useCallback(
    (id: bigint) => compareIds.includes(id),
    [compareIds],
  );

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
