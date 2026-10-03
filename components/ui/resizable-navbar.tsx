"use client";
import { cn } from "./utils";
import { Menu, X } from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

import React, { useRef, useState } from "react";
import Link from "next/link";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
  isSubmissionForm?: boolean;
}

interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  isSubmissionForm?: boolean;
}

interface NavItemsProps {
  items: {
    name: string;
    link: string;
  }[];
  className?: string;
  onItemClick?: () => void;
  pathname?: string;
}

interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
  isSubmissionForm?: boolean;
}

interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className, isSubmissionForm }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // Fixed at the top, top-0 or top-4 depending on scroll
      className={cn("fixed inset-x-0 top-0 z-50 w-full flex flex-col items-center transition-all duration-300", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean; isSubmissionForm?: boolean }>,
              { visible, isSubmissionForm },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible, isSubmissionForm }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: visible ? "0 8px 20px rgba(0, 0, 0, 0.14)" : "none",
        width: visible ? "75%" : "100%",
        y: visible ? 12 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 35,
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-[calc(100%-2rem)] max-w-7xl flex-row items-center justify-between rounded-full bg-background px-5 py-2.5 lg:flex transition-all duration-300 border border-border",
        visible && "border border-jaipur-gold/30",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick, pathname }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryItems = items.slice(0, 4);
  const overflowItems = items.slice(4);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "flex min-w-0 flex-1 flex-row items-center justify-center gap-1 text-sm font-medium transition duration-200 lg:flex",
        className,
      )}
    >
      {primaryItems.map((item, idx) => {
        const isActive = pathname === item.link;
        return (
          <Link
            onMouseEnter={() => setHovered(idx)}
            onClick={onItemClick}
            className={cn(
              "relative whitespace-nowrap px-3 py-2 transition-colors duration-200 rounded-full inline-block",
              isActive
                ? "text-jaipur-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            key={`link-${idx}`}
            href={item.link}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-jaipur-secondary dark:bg-[#2A1D16]"
              />
            )}
            <span className="relative z-20">{item.name}</span>
          </Link>
        );
      })}
      {overflowItems.length > 0 && (
        <div className="relative">
          <button type="button" onClick={() => setMoreOpen((open) => !open)} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-expanded={moreOpen} aria-haspopup="menu">
            More
          </button>
          {moreOpen && (
            <div role="menu" className="absolute right-0 top-full mt-2 min-w-40 rounded-xl border border-border bg-popover p-1 shadow-lg">
              {overflowItems.map((item) => (
                <Link key={item.link} href={item.link} role="menuitem" onClick={() => { setMoreOpen(false); onItemClick?.(); }} className={cn("block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent", pathname === item.link ? "bg-secondary text-primary" : "text-popover-foreground")}>
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible, isSubmissionForm }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        boxShadow: visible ? "0 8px 20px rgba(0, 0, 0, 0.14)" : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "16px" : "12px",
        paddingLeft: visible ? "16px" : "12px",
        borderRadius: visible ? "20px" : "0px",
        y: visible ? 10 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 35,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-[calc(100%-1rem)] max-w-[calc(100vw-1rem)] flex-col items-center justify-between rounded-2xl bg-background px-3 py-3 lg:hidden transition-all duration-300 border border-border",
        visible && "border border-jaipur-gold/30",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className,
}: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-xl bg-card px-6 py-8 shadow-lg border border-border",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return isOpen ? (
    <X className="text-foreground cursor-pointer size-6" onClick={onClick} />
  ) : (
    <Menu className="text-foreground cursor-pointer size-6" onClick={onClick} />
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-foreground"
    >
      <img
        src="/logo.png"
        alt="logo"
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-card text-card-foreground text-sm font-bold relative cursor-pointer transition-colors inline-block text-center border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  const variantStyles = {
    primary: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground border-border hover:bg-accent",
    dark: "bg-foreground text-background border-foreground hover:opacity-90",
    gradient: "bg-primary text-primary-foreground border-primary hover:bg-primary/90",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
