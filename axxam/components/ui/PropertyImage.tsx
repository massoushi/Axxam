"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80";

type PropertyImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

function normalizeSrc(src?: string | null) {
  if (!src || !String(src).trim()) return FALLBACK;
  return String(src);
}

export default function PropertyImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: PropertyImageProps) {
  const [current, setCurrent] = useState(normalizeSrc(src));
  const isData = current.startsWith("data:");

  return (
    <Image
      src={current}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK);
      }}
    />
  );
}
