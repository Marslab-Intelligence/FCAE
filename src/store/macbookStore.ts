import { useState, useEffect } from 'react';

type StoreState = {
  color: string;
  scale: number;
  texture: string;
};

const listeners = new Set<(state: StoreState) => void>();
let state: StoreState = {
  color: '#2e2c2e',
  scale: 0.08,
  texture: '/videos/feature-1.mp4',
};

export default function useMacbookStore() {
  const [localState, setLocalState] = useState(state);

  useEffect(() => {
    const listener = (newState: StoreState) => setLocalState(newState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    ...localState,
    setColor: (color: string) => {
      state = { ...state, color };
      listeners.forEach((l) => l(state));
    },
    setScale: (scale: number) => {
      state = { ...state, scale };
      listeners.forEach((l) => l(state));
    },
    setTexture: (texture: string) => {
      state = { ...state, texture };
      listeners.forEach((l) => l(state));
    },
    reset: () => {
      state = { color: '#2e2c2e', scale: 0.08, texture: '/videos/feature-1.mp4' };
      listeners.forEach((l) => l(state));
    },
  };
}
