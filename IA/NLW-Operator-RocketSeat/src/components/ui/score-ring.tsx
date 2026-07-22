import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";

const scoreRingVariants = tv({
  base: "relative",
  variants: {
    size: {
      sm: "w-24 h-24",
      md: "w-32 h-32",
      lg: "w-45 h-45", // 180px exato do Pencil
      xl: "w-56 h-56",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export interface ScoreRingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scoreRingVariants> {
  score: number;
  maxScore?: number;
  showDenominator?: boolean;
}

const ScoreRing = React.forwardRef<HTMLDivElement, ScoreRingProps>(
  (
    { className, size, score, maxScore = 10, showDenominator = true, ...props },
    ref,
  ) => {
    // Dimensões baseadas exatamente no design do Pencil
    const getDimensions = () => {
      switch (size) {
        case "sm":
          return { dimension: 96, fontSize: 24, denomSize: 8 };
        case "md":
          return { dimension: 128, fontSize: 32, denomSize: 12 };
        case "lg":
          return { dimension: 180, fontSize: 48, denomSize: 16 }; // Especificação exata do Pencil
        case "xl":
          return { dimension: 224, fontSize: 56, denomSize: 20 };
        default:
          return { dimension: 180, fontSize: 48, denomSize: 16 };
      }
    };

    const { dimension, fontSize, denomSize } = getDimensions();
    const strokeWidth = 4; // thickness: 4 do Pencil
    const radius = (dimension - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;

    // Calcular o arco baseado no score (3.5/10 = 35% do círculo)
    const normalizedScore = Math.min(Math.max(score / maxScore, 0), 1);
    const dashLength = circumference * normalizedScore;

    const uniqueId = React.useId();

    return (
      <div
        ref={ref}
        className={scoreRingVariants({ className, size })}
        style={{ width: dimension, height: dimension }}
        {...props}
      >
        <div className="relative w-full h-full">
          <svg
            width={dimension}
            height={dimension}
            className="absolute inset-0"
            style={{ transform: "rotate(-90deg)" }} // startAngle: 90 do Pencil
          >
            <title>{`Score Ring: ${score}/${maxScore}`}</title>

            <defs>
              {/* Gradiente que simula o angular do Pencil: verde -> laranja */}
              <linearGradient
                id={`scoreGradient-${uniqueId}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor="#F59E0B" /> {/* Verde inicial */}
                <stop offset="70%" stopColor="#10B981" /> {/* Mantém verde */}
                <stop offset="100%" stopColor="#10B981" /> {/* Laranja final */}
              </linearGradient>
            </defs>

            {/* Círculo de fundo (outerRing do Pencil) */}
            <circle
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              stroke="#2A2A2A" // $border-primary exato do Pencil
              strokeWidth={strokeWidth}
              fill="none"
            />

            {/* Arco de progresso (gradientArc do Pencil) */}
            <circle
              cx={dimension / 2}
              cy={dimension / 2}
              r={radius}
              stroke={`url(#scoreGradient-${uniqueId})`}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${dashLength} ${circumference}`}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Score Center - replicando exatamente o scoreCenter do Pencil */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              width: dimension,
              height: dimension,
            }}
          >
            <div className="flex flex-col items-center" style={{ gap: 2 }}>
              {/* Score Number - especificações exatas: fontSize:48, fontWeight:700, lineHeight:1 */}
              <span
                className="font-mono font-bold text-devroast-text-primary"
                style={{
                  fontSize: `${fontSize}px`,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {score.toFixed(1)}
              </span>

              {/* Score Denominator - especificações exatas: fontSize:16, fontWeight:normal, lineHeight:1 */}
              {showDenominator && (
                <span
                  className="font-mono text-devroast-text-muted"
                  style={{
                    fontSize: `${denomSize}px`,
                    fontWeight: "normal",
                    lineHeight: 1,
                  }}
                >
                  /{maxScore}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
ScoreRing.displayName = "ScoreRing";

export { ScoreRing, scoreRingVariants };
