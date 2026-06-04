import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "solid" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2.5 text-[0.78rem] font-medium uppercase tracking-luxe transition-all duration-500 [transition-timing-function:var(--ease-luxe)] disabled:opacity-40 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  solid:
    "bg-gold text-[#faf8f4] px-8 py-3.5 hover:opacity-85 hover:tracking-[0.22em]",
  outline:
    "border border-hairline text-bone px-8 py-3.5 hover:border-gold hover:text-gold",
  ghost: "text-mist px-2 py-1 hover:text-gold",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "solid",
  className = "",
  children,
  ...rest
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "solid",
  className = "",
  children,
  href,
  ...rest
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
