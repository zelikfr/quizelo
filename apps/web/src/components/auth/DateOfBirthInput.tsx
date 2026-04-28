interface DateOfBirthInputProps {
  label: string;
  ddLabel: string;
  mmLabel: string;
  yyyyLabel: string;
  defaults?: { dd: string; mm: string; yyyy: string };
  /** Field name prefix for form data — gives `${name}.dd`, `.mm`, `.yyyy`. */
  name?: string;
}

const SLOT_BASE =
  "flex items-center justify-between rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-fg-1 transition-colors duration-120 focus-within:border-violet/60 focus-within:bg-violet/[0.06]";

const SLOT_INPUT = "w-full bg-transparent text-fg-1 outline-none";

export function DateOfBirthInput({
  label,
  ddLabel,
  mmLabel,
  yyyyLabel,
  defaults,
  name = "dob",
}: DateOfBirthInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] font-bold tracking-widest2 text-fg-3">
        {label}
      </label>
      <div className="flex gap-1.5">
        <div className={`${SLOT_BASE} flex-1`}>
          <input
            name={`${name}.dd`}
            inputMode="numeric"
            maxLength={2}
            placeholder={ddLabel}
            defaultValue={defaults?.dd}
            className={SLOT_INPUT}
            aria-label={ddLabel}
          />
          <span className="ml-1 font-mono text-[9px] text-fg-4">{ddLabel}</span>
        </div>
        <div className={`${SLOT_BASE} flex-1`}>
          <input
            name={`${name}.mm`}
            inputMode="numeric"
            maxLength={2}
            placeholder={mmLabel}
            defaultValue={defaults?.mm}
            className={SLOT_INPUT}
            aria-label={mmLabel}
          />
          <span className="ml-1 font-mono text-[9px] text-fg-4">{mmLabel}</span>
        </div>
        <div className={`${SLOT_BASE} flex-[1.4]`}>
          <input
            name={`${name}.yyyy`}
            inputMode="numeric"
            maxLength={4}
            placeholder={yyyyLabel}
            defaultValue={defaults?.yyyy}
            className={SLOT_INPUT}
            aria-label={yyyyLabel}
          />
          <span className="ml-1 font-mono text-[9px] text-fg-4">{yyyyLabel}</span>
        </div>
      </div>
    </div>
  );
}
