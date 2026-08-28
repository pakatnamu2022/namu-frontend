"use client";

interface GoalFlagLabelProps {
  viewBox?: { x?: number; y?: number };
  text?: string;
}

export function GoalFlagLabel({
  viewBox,
  text = "Meta 100%",
}: GoalFlagLabelProps) {
  const x = viewBox?.x ?? 0;
  const y = viewBox?.y ?? 0;
  const width = 86;
  const height = 20;

  return (
    <g transform={`translate(${x - width / 2}, ${y - height - 6})`}>
      <rect
        width={width}
        height={height}
        rx={5}
        fill="var(--background)"
        stroke="var(--foreground)"
        strokeOpacity={0.35}
      />
      {/* Bandera de meta: mástil + paño a cuadros */}
      <g transform="translate(8, 4)">
        <line
          x1={0}
          y1={0}
          x2={0}
          y2={12}
          stroke="var(--foreground)"
          strokeOpacity={0.7}
          strokeWidth={1.2}
        />
        <clipPath id="goal-flag-clip">
          <rect x={0} y={0} width={9} height={7} />
        </clipPath>
        <g clipPath="url(#goal-flag-clip)">
          <rect width={9} height={7} fill="var(--background)" />
          {[0, 1].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={col * 3}
                y={row * 3.5}
                width={3}
                height={3.5}
                fill={
                  (row + col) % 2 === 0
                    ? "var(--foreground)"
                    : "var(--background)"
                }
                fillOpacity={(row + col) % 2 === 0 ? 0.75 : 1}
              />
            )),
          )}
        </g>
      </g>
      <text
        x={width / 2 + 10}
        y={height / 2 + 4}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={600}
        fill="var(--foreground)"
      >
        {text}
      </text>
    </g>
  );
}
