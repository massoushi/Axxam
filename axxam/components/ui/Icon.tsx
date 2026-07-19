import type { ReactNode } from "react";

type IconProps = {
  children: ReactNode;
  className?: string;
};

export default function Icon({ children, className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}
