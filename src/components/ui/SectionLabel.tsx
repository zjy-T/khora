type Props = {
  children: React.ReactNode;
  className?: string;
  /** Show the thin flanking gold rule. */
  ruled?: boolean;
};

/** The small uppercase eyebrow used to open every section. */
export function SectionLabel({ children, className = "", ruled }: Props) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {ruled && <span className="h-px w-10 bg-gold/40" />}
      <span className="eyebrow">{children}</span>
    </div>
  );
}
