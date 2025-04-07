export interface TextWarningProps {
  message: string;
  type?: "error" | "warning" | "success";
}

const typeColorMap = {
  error: `text-[var(--fvm-danger-clr)]`,
  success: `text-[var(--fvm-success-clr)]`,
  warning: `text-[var(--fvm-warning-clr)]`,
};

export function TextNotification({ message, type = "warning" }: TextWarningProps) {
  return <div className={`px-2 text-sm ${typeColorMap[type]}`}>{message}</div>;
}
