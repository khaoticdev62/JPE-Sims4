/**
 * ToastNotification — Wrapper using sonner for toast notifications
 */
import { toast as sonnerToast } from "sonner";
import { JpeNotification } from "@/components/jpe";
import type { NotificationType } from "@/components/jpe";

interface ToastOptions {
  title: string;
  message?: string;
  type?: NotificationType;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

export function showToast({ title, message, type = "info", action, duration = 4000 }: ToastOptions) {
  return sonnerToast.custom(
    (t) => (
      <JpeNotification
        type={type}
        title={title}
        message={message}
        action={action}
        onDismiss={() => sonnerToast.dismiss(t)}
      />
    ),
    { duration }
  );
}

export { sonnerToast as toast };
