import type { SVGProps } from "react";

export type IconName =
  | "search" | "cart" | "heart" | "scale" | "user" | "bell" | "menu" | "close"
  | "sun" | "moon" | "arrow-right" | "arrow-left" | "chevron-down" | "chevron-right"
  | "star" | "truck" | "shield" | "refresh" | "chat" | "home" | "box" | "location"
  | "calendar" | "check" | "copy" | "trash" | "plus" | "minus" | "edit" | "eye"
  | "logout" | "store" | "chart" | "filter" | "sparkles" | "dumbbell" | "activity"
  | "zap" | "circle" | "target" | "mountain" | "clock" | "ticket" | "info" | "package" | "image";

const paths: Record<IconName, string[]> = {
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m21 21-4.35-4.35"],
  cart: ["M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6", "M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", "M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"],
  heart: ["M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"],
  scale: ["M12 3v18", "M5 7h14", "M5 7 2 14h6L5 7Z", "M19 7l-3 7h6l-3-7Z", "M8 21h8"],
  user: ["M20 21a8 8 0 0 0-16 0", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"],
  bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9", "M10 21h4"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  close: ["M18 6 6 18", "M6 6l12 12"],
  sun: ["M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z", "M12 1v2", "M12 21v2", "M4.2 4.2l1.4 1.4", "M18.4 18.4l1.4 1.4", "M1 12h2", "M21 12h2", "M4.2 19.8l1.4-1.4", "M18.4 5.6l1.4-1.4"],
  moon: ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"],
  "arrow-right": ["M5 12h14", "m13 6 6 6-6 6"],
  "arrow-left": ["M19 12H5", "m11 18-6-6 6-6"],
  "chevron-down": ["m6 9 6 6 6-6"],
  "chevron-right": ["m9 18 6-6-6-6"],
  star: ["m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2Z"],
  truck: ["M3 6h11v10H3z", "M14 9h4l3 3v4h-7z", "M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  shield: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z", "m9 12 2 2 4-4"],
  refresh: ["M3 12a9 9 0 0 1 15-6.7L21 8", "M21 3v5h-5", "M21 12a9 9 0 0 1-15 6.7L3 16", "M3 21v-5h5"],
  chat: ["M21 15a4 4 0 0 1-4 4H8l-5 3V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10Z"],
  home: ["m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"],
  box: ["m12 2 9 5-9 5-9-5 9-5Z", "M3 7v10l9 5 9-5V7", "M12 12v10"],
  location: ["M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z", "M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  calendar: ["M4 5h16v16H4z", "M4 10h16", "M8 3v4", "M16 3v4"],
  check: ["m5 12 5 5L20 7"],
  copy: ["M8 8h12v12H8z", "M16 8V4H4v12h4"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 14h10l1-14"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  logout: ["M10 17l5-5-5-5", "M15 12H3", "M21 19V5a2 2 0 0 0-2-2h-6"],
  store: ["M3 9h18l-1.5-5h-15L3 9Z", "M5 9v11h14V9", "M9 20v-6h6v6"],
  chart: ["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20V8"],
  filter: ["M3 5h18", "M6 12h12", "M10 19h4"],
  sparkles: ["m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z", "m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"],
  dumbbell: ["M6.5 6.5 17.5 17.5", "M3 8l2-2 3 3-2 2-3-3Z", "M21 16l-2 2-3-3 2-2 3 3Z", "M2 12h2", "M20 12h2"],
  activity: ["M3 12h4l3-8 4 16 3-8h4"],
  zap: ["m13 2-9 12h7l-1 8 9-12h-7l1-8Z"],
  circle: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"],
  target: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"],
  mountain: ["m3 20 6-11 4 7 2-3 6 7H3Z"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"],
  ticket: ["M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4V6Z", "M12 6v12"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 11v6", "M12 7h.01"],
  package: ["m12 2 8 4.5v11L12 22l-8-4.5v-11L12 2Z", "m4 6.5 8 4.5 8-4.5", "M12 11v11"],
  image: ["M3 5h18v14H3z", "M3 16l5-5 4 4 3-3 6 6", "M15 9h.01"],
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
  filled?: boolean;
};

export function Icon({ name, size = 20, filled = false, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
