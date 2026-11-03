type CortexMarkProps = {
  size?: number;
  className?: string;
};

/** Compact memory-graph mark — accent tile with linked nodes. */
export function CortexMark({ size = 28, className = "" }: CortexMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path
        d="M11.5 15.2 20 11.4M11.5 16.8 20 20.6"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="11" cy="16" r="3.4" fill="white" />
      <circle cx="21" cy="11" r="2.6" fill="white" opacity="0.92" />
      <circle cx="21" cy="21" r="2.6" fill="white" opacity="0.92" />
    </svg>
  );
}
