import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = ({ size = 18, ...props }: IconProps): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
  ...props,
});

export const ClockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const HistoryIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
    <path d="M3.2 4.6v4.2h4.2" />
    <path d="M12 8v4.2l3 1.8" />
  </svg>
);

export const GridIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </svg>
);

export const UsersIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="9" cy="8" r="3.4" />
    <path d="M3.6 20c0-3 2.4-5.2 5.4-5.2s5.4 2.2 5.4 5.2" />
    <path d="M16.4 5.2a3.2 3.2 0 0 1 0 6.2" />
    <path d="M17.6 14.6c1.9.6 3.2 2.3 3.2 4.4" />
  </svg>
);

export const CalendarIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" />
    <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
  </svg>
);

export const SearchIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const PencilIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M16.5 3.9a2 2 0 0 1 2.9 2.8L8.6 17.5 4 19l1.5-4.6Z" />
    <path d="m14.4 6 3.6 3.6" />
  </svg>
);

export const PowerIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.5v8" />
    <path d="M6.9 6.4a7.5 7.5 0 1 0 10.2 0" />
  </svg>
);

export const LogOutIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M15 4.5h2.5A2 2 0 0 1 19.5 6.5v11a2 2 0 0 1-2 2H15" />
    <path d="M10.5 8 7 12l3.5 4M7 12h9" />
  </svg>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m14 6-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m10 6 6 6-6 6" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const AlertIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 7.6v5M12 16.2v.2" />
  </svg>
);

export const MenuIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const ArrowRightIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4.5 12h15M13 5.5 19.5 12 13 18.5" />
  </svg>
);

export const MailIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
    <path d="m3.8 6.8 8.2 6 8.2-6" />
  </svg>
);

export const LockIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="2.2" />
    <path d="M8 10V7.8a4 4 0 0 1 8 0V10" />
  </svg>
);

export const EyeIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>
);

export const EyeOffIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M4 4.5 20 20" />
    <path d="M9.6 6.2A9.9 9.9 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.8 3.6" />
    <path d="M6.2 8A17.4 17.4 0 0 0 2.5 12S6 18 12 18a9.7 9.7 0 0 0 3.3-.6" />
    <path d="M10.1 10.2a2.7 2.7 0 0 0 3.7 3.7" />
  </svg>
);

export const RefreshIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 12a8 8 0 1 1-2.4-5.7" />
    <path d="M20.4 4.6v4.6h-4.6" />
  </svg>
);

export const InfoIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="8.6" />
    <path d="M12 11v5.2M12 7.8v.2" />
  </svg>
);

export const SparkIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 3.2l1.7 5 5 1.8-5 1.8-1.7 5-1.7-5-5-1.8 5-1.8Z" />
    <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" />
  </svg>
);

export const CameraIcon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3.5 8.8h3l1.4-2.3h8.2l1.4 2.3h3v10.2h-17Z" />
    <circle cx="12" cy="13.6" r="3.2" />
  </svg>
);
