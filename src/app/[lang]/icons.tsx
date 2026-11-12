import type { ReactNode } from "react";

function Icon({ children, className = "h-6 w-6" }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

type P = { className?: string };

export const SearchIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const UserIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </Icon>
);

export const HeartIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </Icon>
);

export const CupIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Z" />
    <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3" />
  </Icon>
);

export const WaveIcon = (p: P) => (
  <Icon {...p}>
    <path d="M2 10c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0" />
    <path d="M2 15c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0" />
    <path d="M2 20c2.5-2 4.5-2 7 0s4.5 2 7 0 4.5-2 6 0" />
  </Icon>
);

export const LakeIcon = (p: P) => (
  <Icon {...p}>
    <path d="m3 13 5-8 4 6 2-3 4 5" />
    <ellipse cx="12" cy="18" rx="9" ry="3" />
  </Icon>
);

export const RiverIcon = (p: P) => (
  <Icon {...p}>
    <path d="M7 2c-2 4 4 6 2 10s-4 6-2 10" />
    <path d="M15 2c-2 4 4 6 2 10s-4 6-2 10" />
  </Icon>
);

export const ViewpointIcon = (p: P) => (
  <Icon {...p}>
    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const PinIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
);

export const SparkIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z" />
    <path d="M19 16c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5Z" />
  </Icon>
);

// shared by the 찜 / 마이 links in the header
export const iconLinkClass = "flex w-11 shrink-0 flex-col items-center gap-0.5 text-[11px] text-foreground hover:text-accent";
