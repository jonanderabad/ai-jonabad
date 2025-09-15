"use client";

import * as React from "react";

type ToastActionElement = React.ReactElement;

export type ToastOpts = {
  id?: string;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  duration?: number; // ms
  variant?: "default" | "destructive";
};

export type ToasterToast = ToastOpts & {
  id: string;
  open?: boolean;
};

type ToastState = {
  toasts: ToasterToast[];
};

const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 1000;

const listeners = new Set<(state: ToastState) => void>();
let memoryState: ToastState = { toasts: [] };

function genId() {
  return Math.random().toString(36).slice(2);
}

function setState(newState: ToastState) {
  memoryState = newState;
  listeners.forEach((l) => l(memoryState));
}

function addToast(opts: ToastOpts): ToasterToast {
  const id = opts.id ?? genId();
  const toast: ToasterToast = { id, open: true, ...opts };

  const next = [toast, ...memoryState.toasts].slice(0, TOAST_LIMIT);
  setState({ toasts: next });

  if (opts.duration && opts.duration > 0) {
    setTimeout(() => dismiss(id), opts.duration);
  }

  return toast;
}

export function dismiss(id?: string) {
  setState({
    toasts: memoryState.toasts.map((t) =>
      id && t.id !== id ? t : { ...t, open: false }
    ),
  });

  setTimeout(() => {
    setState({
      toasts: memoryState.toasts.filter((t) => (id ? t.id !== id : !t.open)),
    });
  }, TOAST_REMOVE_DELAY);
}

export function useToast() {
  const [state, set] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.add(set);
    return () => {
      listeners.delete(set);
    };
  }, []);

  return {
    ...state,
    toast: (opts: ToastOpts) => addToast(opts),
    dismiss,
  };
}

// API opcional para lanzar toasts fuera de React:
export const toast = (opts: ToastOpts) => addToast(opts);
