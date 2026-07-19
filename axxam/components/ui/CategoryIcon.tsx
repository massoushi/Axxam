import type { ReactNode } from "react";
import type { CategoryIconId } from "@/types/property";

const PATHS: Record<CategoryIconId, ReactNode> = {
  villa: <path d="M4 11L12 4l8 7M6 10v9a1 1 0 001 1h4v-6h2v6h4a1 1 0 001-1v-9" />,
  sea: <path d="M3 17c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M5 13l4-7 3 4 2-3 5 6" />,
  pool: <path d="M4 19c1.4 1.2 2.8 1.2 4.2 0s2.8-1.2 4.2 0 2.8 1.2 4.2 0 2.8-1.2 4.2 0M7 15V6a2 2 0 012-2h6a2 2 0 012 2v9" />,
  panorama: <path d="M3 18l5-7 4 5 3-4 6 6M3 18h18M3 6h18" />,
  riad: <path d="M4 21V9l8-6 8 6v12M9 21v-6h6v6" />,
  mountain: <path d="M2 20l6-10 4 6 3-4 7 8H2z" />,
  luxury: <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4.5L6 21l1.5-7.5L2 9h7z" />,
  business: <path d="M4 21V9a2 2 0 012-2h3V4a2 2 0 012-2h2a2 2 0 012 2v3h3a2 2 0 012 2v12M9 21v-4h6v4" />,
};

type CategoryIconProps = {
  id: CategoryIconId;
};

export default function CategoryIcon({ id }: CategoryIconProps) {
  return <>{PATHS[id]}</>;
}
