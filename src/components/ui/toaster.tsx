"use client";

import { useToast } from "@/components/ui/use-toast"; // ← ajuste de ruta
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast
          key={id}
          {...props}
          onOpenChange={(open) => {
            // Cuando el toast se cierra (click en close, swipe, timeout), lo quitamos del store
            if (!open) dismiss(id);
          }}
        >
          <div className="grid gap-1">
            {title ? <ToastTitle>{title}</ToastTitle> : null}
            {description ? <ToastDescription>{description}</ToastDescription> : null}
          </div>
          {action /* si pasas un <ToastAction />, se pinta aquí */}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
