// https://tailwindcss.com/docs/responsive-design
export const MediaQueryBreakpoints = {
  sm: "(max-width: 767px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  xxl: "(min-width:  1536px)",
  pointerFine: "(pointer: fine)",
};

export const MutuallyExclusiveMediaQueryBreakpoints = {
  sm: "(min-width: 0px) and (max-width: 767px)",
  md: "(min-width: 768px) and (max-width: 1023px)",
  lg: "(min-width: 1024px) and (max-width: 1279px)",
  xl: "(min-width: 1280px) and (max-width: 1536px)",
  xxl: "(min-width:  1536px)",
  pointerFine: "(pointer: fine)",
};

export function osThemeIsDark() {
  return (
    window.matchMedia("(prefers-color-scheme: dark)").matches ||
    document.documentElement.classList.contains("dark") ||
    document.documentElement.hasAttribute("force-dark-mode")
  );
}

export function isMobileScreen() {
  return window.matchMedia(MutuallyExclusiveMediaQueryBreakpoints.sm).matches;
}

export function isTabletScreen() {
  return window.matchMedia(MutuallyExclusiveMediaQueryBreakpoints.md).matches;
}

export function isPcScreen() {
  return (
    window.matchMedia(MutuallyExclusiveMediaQueryBreakpoints.lg).matches ||
    window.matchMedia(MutuallyExclusiveMediaQueryBreakpoints.xl).matches ||
    window.matchMedia(MutuallyExclusiveMediaQueryBreakpoints.xxl).matches
  );
}

export function getPageWidth() {
  return document.documentElement.clientWidth || document.body.offsetWidth;
}
export function getPageHeight() {
  return document.documentElement.clientHeight || document.body.offsetHeight;
}
