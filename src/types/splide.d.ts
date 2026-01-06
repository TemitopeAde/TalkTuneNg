declare module '@splidejs/react-splide' {
  import { ComponentType, ReactNode } from 'react';

  export interface Options {
    type?: 'slide' | 'loop' | 'fade';
    rewind?: boolean;
    speed?: number;
    rewindSpeed?: number;
    rewindByDrag?: boolean;
    width?: number | string;
    height?: number | string;
    fixedWidth?: number | string;
    fixedHeight?: number | string;
    heightRatio?: number;
    autoWidth?: boolean;
    autoHeight?: boolean;
    perPage?: number;
    perMove?: number;
    clones?: number;
    cloneStatus?: boolean;
    start?: number;
    focus?: number | 'center';
    gap?: number | string;
    padding?: number | string | { left?: number | string; right?: number | string };
    arrows?: boolean;
    pagination?: boolean;
    paginationKeyboard?: boolean;
    paginationDirection?: 'ltr' | 'rtl' | 'ttb';
    easing?: string;
    easingFunc?: (t: number) => number;
    drag?: boolean | 'free';
    snap?: boolean;
    noDrag?: string;
    dragMinThreshold?: number | { mouse?: number; touch?: number };
    flickPower?: number;
    flickMaxPages?: number;
    waitForTransition?: boolean;
    arrowPath?: string;
    autoplay?: boolean | 'pause';
    interval?: number;
    pauseOnHover?: boolean;
    pauseOnFocus?: boolean;
    resetProgress?: boolean;
    lazyLoad?: boolean | 'nearby' | 'sequential';
    preloadPages?: number;
    keyboard?: boolean | 'focused' | 'global';
    wheel?: boolean;
    wheelMinThreshold?: number;
    wheelSleep?: number;
    releaseWheel?: boolean;
    direction?: 'ltr' | 'rtl' | 'ttb';
    cover?: boolean;
    slideFocus?: boolean;
    isNavigation?: boolean;
    trimSpace?: boolean | 'move';
    updateOnMove?: boolean;
    throttle?: number;
    destroy?: boolean;
    mediaQuery?: 'min' | 'max';
    breakpoints?: {
      [key: number]: Partial<Options>;
    };
    classes?: {
      [key: string]: string;
    };
    i18n?: {
      [key: string]: string;
    };
  }

  export interface SplideProps {
    options?: Options;
    extensions?: any;
    transition?: any;
    hasTrack?: boolean;
    tag?: string;
    className?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    children?: ReactNode;
    onMounted?: () => void;
    onReady?: () => void;
    onMove?: () => void;
    onMoved?: () => void;
    onClick?: () => void;
    onActive?: () => void;
    onInactive?: () => void;
    onVisible?: () => void;
    onHidden?: () => void;
    onRefresh?: () => void;
    onUpdated?: () => void;
    onResize?: () => void;
    onResized?: () => void;
    onDrag?: () => void;
    onDragging?: () => void;
    onDragged?: () => void;
    onScroll?: () => void;
    onScrolled?: () => void;
    onDestroy?: () => void;
    onArrowsMounted?: () => void;
    onArrowsUpdated?: () => void;
    onPaginationMounted?: () => void;
    onPaginationUpdated?: () => void;
    onNavigationMounted?: () => void;
    onAutoplayPlay?: () => void;
    onAutoplayPause?: () => void;
    onAutoplayPlaying?: () => void;
    onLazyLoadLoaded?: () => void;
  }

  export interface SplideSlideProps {
    className?: string;
    children?: ReactNode;
  }

  export interface SplideTrackProps {
    className?: string;
    children?: ReactNode;
  }

  export const Splide: ComponentType<SplideProps>;
  export const SplideSlide: ComponentType<SplideSlideProps>;
  export const SplideTrack: ComponentType<SplideTrackProps>;
}

declare module '@splidejs/react-splide/css' {
  const content: any;
  export default content;
}
