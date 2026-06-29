export function getGridColumnStateKey(gridId: string) {
  return `ag_grid_${gridId}_column_state_v1`;
}

export function getProcessColumnStateKey(processId: string) {
  return `${processId}_process_col_state_v1`;
}

export const clientLocalState = {
  getGridColumnState<T = unknown>(gridId: string): T | null {
    return readJson<T>(getGridColumnStateKey(gridId));
  },

  setGridColumnState<T>(gridId: string, state: T) {
    writeJson(getGridColumnStateKey(gridId), state);
  },

  getProcessColumnState<T = unknown>(processId: string): T | null {
    return readJson<T>(getProcessColumnStateKey(processId));
  },

  setProcessColumnState<T>(processId: string, state: T) {
    writeJson(getProcessColumnStateKey(processId), state);
  },
};

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : null;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  localStorage.setItem(key, JSON.stringify(value));
}
