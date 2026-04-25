import React, { ImgHTMLAttributes } from "react";

interface NextImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "loading"> {
  src: string | { src: string };
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  unoptimized?: boolean;
  loader?: any;
  sizes?: string;
  loading?: "eager" | "lazy";
}

export default function NextImage({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  quality,
  placeholder,
  blurDataURL,
  unoptimized,
  loader,
  sizes,
  loading,
  style,
  className,
  ...rest
}: NextImageProps) {
  const resolvedSrc = typeof src === "string" ? src : src?.src ?? "";
  const fillStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }
    : (style ?? {});
  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={fill ? undefined : (width as any)}
      height={fill ? undefined : (height as any)}
      loading={priority ? "eager" : loading ?? "lazy"}
      decoding="async"
      sizes={sizes}
      className={className}
      style={fillStyle}
      {...rest}
    />
  );
}
