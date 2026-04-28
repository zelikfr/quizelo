interface FeatureListProps {
  features: readonly string[];
}

export function FeatureList({ features }: FeatureListProps) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {features.map((f) => (
        <li key={f} className="flex items-center gap-2.5">
          <span aria-hidden className="text-sm text-success">✓</span>
          <span className="text-[13px] text-fg-1">{f}</span>
        </li>
      ))}
    </ul>
  );
}
