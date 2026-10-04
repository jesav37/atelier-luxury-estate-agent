import React from "react";

type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
};

const svg = (
  children: React.ReactNode,
  { className, size = 18, strokeWidth = 1.25 }: IconProps
) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export const ComposeIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" />
      <path d="M14 5l3 3" />
      <path d="M9 13l2 2" />
    </>,
    p
  );

export const BoardIcon = (p: IconProps) =>
  svg(
    <>
      <rect x="3.5" y="4.5" width="17" height="13" rx="1.5" />
      <path d="M3.5 9.5h17" />
      <path d="M9.5 9.5v8" />
      <path d="M14.5 13.5h3" />
    </>,
    p
  );

export const FlowIcon = (p: IconProps) =>
  svg(
    <>
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M7 5h10" />
      <path d="M5 7v10" />
      <path d="M19 7v10" />
      <path d="M7 19h10" />
    </>,
    p
  );

export const AssetsIcon = (p: IconProps) =>
  svg(
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </>,
    p
  );

export const BrandIcon = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7 13l3 3 7-8" />
    </>,
    p
  );

export const PresentIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
      <path d="M12 16c-4.42 0-8 1.79-8 4v1h16v-1c0-2.21-3.58-4-8-4z" />
    </>,
    p
  );

export const PlusIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>,
    { ...p, strokeWidth: p.strokeWidth ?? 1.5 }
  );

export const DownloadIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M12 4v11" />
      <path d="M6 11l6 6 6-6" />
      <path d="M4 20h16" />
    </>,
    p
  );

export const CheckIcon = (p: IconProps) =>
  svg(<path d="M5 12.5l4.5 4.5L19 7" />, { ...p, strokeWidth: p.strokeWidth ?? 1.5 });

export const CheckCircleIcon = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </>,
    p
  );

export const ShareIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </>,
    p
  );

export const FileTextIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </>,
    p
  );

export const XIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>,
    p
  );

export const ArrowRightIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>,
    p
  );

export const UploadIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M12 16V4" />
      <path d="M6 10l6-6 6 6" />
      <path d="M4 20h16" />
    </>,
    p
  );

export const PlayIcon = (p: IconProps) => (
  <svg
    width={p.size ?? 18}
    height={p.size ?? 18}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth={0.5}
    strokeLinejoin="round"
    className={p.className}
    aria-hidden="true"
    focusable="false"
  >
    <path d="M8 5l12 7-12 7V5z" />
  </svg>
);

export const FrameIcon = (p: IconProps) =>
  svg(
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1" />
      <path d="M3.5 9.5h17" />
    </>,
    p
  );

export const TextIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M5 7h14" />
      <path d="M12 7v12" />
      <path d="M9 19h6" />
    </>,
    p
  );

export const FilmIcon = (p: IconProps) =>
  svg(
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <path d="M7.5 3.5v17" />
      <path d="M16.5 3.5v17" />
      <path d="M3.5 8.5h4" />
      <path d="M3.5 15.5h4" />
      <path d="M16.5 8.5h4" />
      <path d="M16.5 15.5h4" />
    </>,
    p
  );

export const SpinnerIcon = (p: IconProps) => {
  const size = p.size ?? 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      className={`animate-spin ${p.className ?? ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 3a9 9 0 100 18 9 9 0 000-18"
        strokeDasharray="42"
        strokeDashoffset="14"
      />
    </svg>
  );
};

export const Logo = ({ size = 38 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    stroke="var(--brass)"
    strokeWidth="1"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="20" cy="20" r="19" />
    <text
      x="20"
      y="26"
      textAnchor="middle"
      fontFamily="var(--serif)"
      fontSize="20"
      fill="var(--brass)"
      stroke="none"
    >
      A
    </text>
  </svg>
);
