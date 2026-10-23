import { LOADING } from "@/constants/content/board";
import { Skeleton } from "../Skeleton";
import { PitchMarkings } from "./PitchMarkings";

// Name widths down the squad list, so it reads as a list of names rather than a stack of bars.
const ROW_WIDTHS = ["58%", "44%", "66%", "50%", "38%", "62%", "47%", "55%"] as const;

/**
 * The board's shape while its code loads: the header, the squad down the side and an empty pitch,
 * laid out as Pick the team is, so the loaded board drops into place rather than jumping in.
 */
export function BoardSkeleton() {
  return (
    <div className="board board--steps container-lg has-pt-4" role="status" aria-busy="true" aria-label={LOADING.board}>
      <div className="board-header is-flex is-flex-wrap is-align-end is-justify-between has-gap-3 has-mb-4 has-pb-3">
        <div className="board-header__ident is-min-w-0">
          <div className="is-flex is-align-center has-gap-3">
            <Skeleton className="skeleton--crest skeleton--round" />
            <Skeleton className="skeleton--title" width="min(60%, 320px)" />
          </div>
          <Skeleton className="skeleton--line has-mt-3" width="min(40%, 180px)" />
          <Skeleton className="skeleton--line has-mt-3" width="min(52%, 240px)" />
        </div>
        <div className="board-header__steps">
          <Skeleton className="skeleton--tabs" />
        </div>
      </div>
      <div className="board-step board-step--pick board-step--no-right">
        <div className="board-step__left">
          <div className="panel has-pt-4">
            <Skeleton className="skeleton--line has-mb-4" width="30%" />
            {ROW_WIDTHS.map((w, i) => (
              <div key={i} className="skeleton-row is-flex is-align-center has-gap-3">
                <Skeleton className="skeleton--disc skeleton--round" />
                <Skeleton className="skeleton--line" width={w} />
              </div>
            ))}
          </div>
        </div>
        <div className="board-step__centre">
          <div className="shape-panel">
            <Skeleton className="skeleton--line has-mb-4" width="45%" />
            <div className="pitch has-radius-panel">
              <PitchMarkings />
              <Skeleton className="skeleton--over" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
