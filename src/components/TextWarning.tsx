export interface TextWarningProp {
  message: string;
  type?: "error" | "warning";
}

export function TextWarning({ message, type = "warning" }: TextWarningProp) {
  const cls = type == "warning" ? `text-[var(--fvm-warning-clr)]` : `text-[var(--fvm-danger-clr)]`;

  return <div className={`px-2 text-sm ${cls}`}>{message}</div>;
}
