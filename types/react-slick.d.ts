declare module "react-slick" {
  import { ComponentType, ReactNode } from "react";

  interface Settings {
    dots?: boolean;
    infinite?: boolean;
    speed?: number;
    slidesToShow?: number;
    slidesToScroll?: number;
    autoplay?: boolean;
    autoplaySpeed?: number;
    arrows?: boolean;
    pauseOnHover?: boolean;
    responsive?: Array<{
      breakpoint: number;
      settings: Partial<Settings>;
    }>;
    className?: string;
    centerMode?: boolean;
    centerPadding?: string;
    [key: string]: unknown;
  }

  const Slider: ComponentType<Settings & { children?: ReactNode }>;
  export default Slider;
}
