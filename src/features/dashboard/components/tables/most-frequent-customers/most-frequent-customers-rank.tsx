import { Badge as RankBadgeIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type RankTone = {
  iconClassName: string;
  numberClassName: string;
};

const rankToneByPosition: Record<number, RankTone> = {
  1: {
    iconClassName: "fill-warning text-warning",
    numberClassName: "text-warning-foreground",
  },
  2: {
    iconClassName: "fill-muted text-muted-foreground",
    numberClassName: "text-muted-foreground",
  },
  3: {
    iconClassName: "fill-warning-soft text-warning",
    numberClassName: "text-warning-soft-foreground",
  },
};

const fallbackRankTone: RankTone = {
  iconClassName: "fill-background text-muted-foreground",
  numberClassName: "text-muted-foreground",
};

export function MostFrequentCustomersRank({ position }: { position: number }) {
  const topThree = [1, 2, 3];
  const rankTone = rankToneByPosition[position] ?? fallbackRankTone;

  if (topThree.includes(position)) {
    return (
      <span
        className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden mt-1.5 sm:mt-0 "
        aria-label={`${position}ª posição`}
      >
        <RankBadgeIcon
          aria-hidden="true"
          className={cn("absolute inset-0 size-7 stroke-2", rankTone.iconClassName)}
        />
        <span
          className={cn(
            "relative z-10 text-sm font-semibold leading-none tabular-nums",
            rankTone.numberClassName,
          )}
        >
          {position}
        </span>
      </span>
    );
  }

  return (
    <span
      className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full border mt-1.5 sm:mt-0"
      aria-label={`${position}ª posição`}
    >
      <span
        className={cn(
          "relative z-10 bg-muted p-2 text-sm font-semibold leading-none tabular-nums",
          rankTone.numberClassName,
        )}
      >
        {position}
      </span>
    </span>
  );
}
