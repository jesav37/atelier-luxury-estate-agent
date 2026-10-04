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

export const TrendingUpIcon = (p: IconProps) =>
  svg(
    <>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </>,
    p
  );

export const UsersIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
    p
  );

export const MousePointerClickIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M14 4.1 12 6" />
      <path d="m5.1 8-2.9-.8" />
      <path d="m6 12-1.9 2" />
      <path d="M7.2 2.2 8 5.1" />
      <path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.033a.5.5 0 0 0-.34.34l-1.033 4.352a.5.5 0 0 1-.949.074l-4.5-11Z" />
    </>,
    p
  );

export const BarChart3Icon = (p: IconProps) =>
  svg(
    <>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </>,
    p
  );

export const ZapIcon = (p: IconProps) =>
  svg(<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />, p);

export const ShieldIcon = (p: IconProps) =>
  svg(<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />, p);

export const EyeIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>,
    p
  );

export const CopyIcon = (p: IconProps) =>
  svg(
    <>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </>,
    p
  );

export const SearchIcon = (p: IconProps) =>
  svg(
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>,
    p
  );

export const MailIcon = (p: IconProps) =>
  svg(
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>,
    p
  );

export const CalendarIcon = (p: IconProps) =>
  svg(
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </>,
    p
  );

export const CheckCircle2Icon = (p: IconProps) =>
  svg(
    <>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </> ,
    p
  );

export const AlertCircleIcon = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>,
    p
  );

export const MoreVerticalIcon = (p: IconProps) =>
  svg(
    <>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </>,
    p
  );

export const Loader2Icon = (p: IconProps) =>
  svg(
    <>
      <path d="M12 2v4" />
      <path d="m16.2 7.8 2.9-2.9" />
      <path d="M18 12h4" />
      <path d="m16.2 16.2 2.9 2.9" />
      <path d="M12 18v4" />
      <path d="m4.9 19.1 2.9-2.9" />
      <path d="M2 12h4" />
      <path d="m4.9 4.9 2.9 2.9" />
    </>,
    p
  );

export const ImageIcon = (p: IconProps) =>
  svg(
    <>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </>,
    p
  );

export const MessageSquareIcon = (p: IconProps) =>
  svg(
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
