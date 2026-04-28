interface QALivesProps {
  count?: number;
  max?: number;
  size?: number;
  gap?: number;
}

/** Inline life pips. Empty pips render as outlined circles. */
export function QALives({ count = 3, max = 3, size = 10, gap = 4 }: QALivesProps) {
  return (
    <div className="inline-flex" style={{ gap }}>
      {Array.from({ length: max }).map((_, i) => {
        const on = i < count;
        return (
          <div
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: on
                ? "radial-gradient(circle at 30% 30%, #FF8FA8, #FF4D6D 70%)"
                : "transparent",
              border: on ? "0" : "1px solid rgba(255,77,109,0.35)",
              boxShadow: on ? "0 0 8px rgba(255,77,109,0.6)" : "none",
            }}
          />
        );
      })}
    </div>
  );
}
