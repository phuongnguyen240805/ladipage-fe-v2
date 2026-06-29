"use client";

import { useCallback, useState } from "react";

const DEFAULT_MAX_HISTORY = 60;

export function useEditorHistory<T>(initial: T, maxHistory = DEFAULT_MAX_HISTORY) {
  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initial);
  const [future, setFuture] = useState<T[]>([]);

  const push = useCallback((next: T) => {
    setPresent((current) => {
      setPast((items) => [...items, current].slice(-maxHistory));
      setFuture([]);
      return next;
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setPast((items) => {
      if (items.length === 0) return items;
      const previous = items[items.length - 1];
      setPresent((current) => {
        setFuture((futureItems) => [current, ...futureItems].slice(0, maxHistory));
        return previous;
      });
      return items.slice(0, -1);
    });
  }, [maxHistory]);

  const redo = useCallback(() => {
    setFuture((items) => {
      if (items.length === 0) return items;
      const next = items[0];
      setPresent((current) => {
        setPast((pastItems) => [...pastItems, current].slice(-maxHistory));
        return next;
      });
      return items.slice(1);
    });
  }, [maxHistory]);

  const replace = useCallback((next: T) => {
    setPast([]);
    setPresent(next);
    setFuture([]);
  }, []);

  return {
    state: present,
    push,
    replace,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
