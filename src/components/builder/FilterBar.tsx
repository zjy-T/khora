"use client";

export type FilterOption = { value: string; label: string };
export type FilterGroup = { id: string; label: string; options: FilterOption[] };
/** A single-select sort control rendered above the filter facets. */
export type SortControl = {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
};

type Props = {
  groups: FilterGroup[];
  /** groupId → selected option values (multi-select; OR within a group). */
  selected: Record<string, string[]>;
  onToggle: (groupId: string, value: string) => void;
  onReset: () => void;
  /** Pre-formatted result count, e.g. "4 pieces". */
  resultLabel: string;
  resetLabel: string;
  /** Optional sort control — rendered as a single-select list at the top. */
  sort?: SortControl;
};

/**
 * A quiet, vertical filter rail — no boxes or chips, meant to sit off to the
 * side. Each facet is a faint label with its options stacked beneath as plain
 * words; the active ones are simply underlined. It is entirely optional: ignore
 * it and the full catalog stays in view. Selecting several options in a group is
 * an OR; different groups combine with AND. Fully controlled by the parent.
 */
export function FilterBar({
  groups,
  selected,
  onToggle,
  onReset,
  resultLabel,
  resetLabel,
  sort,
}: Props) {
  const anyActive = Object.values(selected).some((v) => v.length > 0);

  return (
    <div className="text-[0.62rem] uppercase tracking-luxe">
      <div className="space-y-6">
        {sort && (
          <div className="space-y-2.5">
            <p className="text-faint/70">{sort.label}</p>
            <div className="flex flex-col items-start gap-2">
              {sort.options.map((o) => {
                const on = sort.value === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => sort.onChange(o.value)}
                    aria-pressed={on}
                    className={`text-left transition-colors duration-200 ${
                      on
                        ? "text-bone underline decoration-1 underline-offset-4"
                        : "text-mist hover:text-bone"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {groups.map((g) => (
          <div key={g.id} className="space-y-2.5">
            <p className="text-faint/70">{g.label}</p>
            <div className="flex flex-col items-start gap-2">
              {g.options.map((o) => {
                const on = selected[g.id]?.includes(o.value) ?? false;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => onToggle(g.id, o.value)}
                    aria-pressed={on}
                    className={`text-left transition-colors duration-200 ${
                      on
                        ? "text-bone underline decoration-1 underline-offset-4"
                        : "text-mist hover:text-bone"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-hairline-soft pt-4 text-faint/70">
        <span>{resultLabel}</span>
        {anyActive && (
          <button
            type="button"
            onClick={onReset}
            className="underline decoration-dotted underline-offset-4 transition-colors hover:text-clay"
          >
            {resetLabel}
          </button>
        )}
      </div>
    </div>
  );
}
