import { TextNotificationData } from "@/types/types";

const typeColorMap = {
  error: `text-[var(--fvm-danger-clr)]`,
  success: `text-[var(--fvm-success-clr)]`,
  warning: `text-[var(--fvm-warning-clr)]`,
  info: `text-[var(--fvm-info-clr)]`,
};

export function TextNotification({ message, type = "warning" }: TextNotificationData) {
  return <div className={`px-2 text-sm ${typeColorMap[type]}`}>{message}</div>;
}
