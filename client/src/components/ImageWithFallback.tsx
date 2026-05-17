import { useEffect, useState, type ImgHTMLAttributes, type SyntheticEvent } from "react";

const DEFAULT_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f8fafc'/%3E%3Cpath d='M88 96h224v176H88z' fill='%23e2e8f0'/%3E%3Ccircle cx='164' cy='156' r='28' fill='%23cbd5e1'/%3E%3Cpath d='M96 256l56-72 48 56 64-80 56 80' stroke='%239ca3af' stroke-width='16' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3Ctext x='200' y='360' text-anchor='middle' fill='%239ca3af' font-family='Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, %22Segoe UI%22, sans-serif' font-size='28'%3ENo image%3C/text%3E%3C/svg%3E";

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

export default function ImageWithFallback({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt,
  loading = "lazy",
  decoding = "async",
  onError,
  ...props
}: Props) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    if (typeof onError === "function") {
      onError(event);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt ?? "Product image"}
      loading={loading}
      decoding={decoding}
      onError={handleError}
      {...props}
    />
  );
}
