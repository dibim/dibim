import { DIR_H, DIR_V } from "@/constants";

interface LabeledDivProps {
  label: string;
  labelWidth?: string; // 仅水平模式下有效
  children: React.ReactNode;
  className?: string;
  direction?: typeof DIR_H | typeof DIR_V;
}

export function LabeledDiv({
  label,
  labelWidth = "10rem",
  children,
  className = "",
  direction = DIR_H,
}: LabeledDivProps) {
  return (
    <div className={`flex ${direction === DIR_V ? "flex-col" : "items-center"} ${className}`}>
      <div className={`font-medium mr-2`}>
        <div style={{ width: `${direction === DIR_H && labelWidth ? labelWidth : ""}` }}>{label}</div>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
