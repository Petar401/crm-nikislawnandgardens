import { cn } from "@/lib/utils";

/**
 * Niki's Lawn & Gardens brand mark — a green sprout with two leaves rising from
 * a stem. Rendered inline so it stays crisp at any size and needs no network
 * request. Uses a unique gradient id per render to avoid collisions when
 * multiple logos appear on the same page.
 */
export function Logo({
  className,
  title = "Niki's Lawn & Gardens",
}: {
  className?: string;
  title?: string;
}) {
  const id = "nlg-green";
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("size-7", className)}
    >
      <defs>
        <linearGradient
          id={id}
          x1="256"
          y1="80"
          x2="256"
          y2="470"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#86E05A" />
          <stop offset="0.55" stopColor="#34A853" />
          <stop offset="1" stopColor="#1B7A3E" />
        </linearGradient>
      </defs>

      {/* Stem */}
      <path
        stroke={`url(#${id})`}
        strokeWidth="26"
        strokeLinecap="round"
        d="M256 470 L256 250"
      />

      {/* Right leaf */}
      <path
        fill={`url(#${id})`}
        d="M256 300 C300 214 366 166 442 150 C430 236 364 300 256 312 Z"
      />

      {/* Left leaf */}
      <path
        fill={`url(#${id})`}
        d="M256 300 C212 214 146 166 70 150 C82 236 148 300 256 312 Z"
      />

      {/* Center sprout tip */}
      <path
        fill={`url(#${id})`}
        d="M256 244 C236 196 240 150 256 108 C272 150 276 196 256 244 Z"
      />
    </svg>
  );
}
