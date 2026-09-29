"use client";

import { useRef } from "react";
import { BADGE_CONFIG } from "@/constants/config";
import { CLUB } from "@/constants/content/board";
import { readBadge } from "@/lib/board/badge";
import { Button } from "../Button";
import { useBoard } from "./BoardProvider";
import { Crest } from "./Crest";

interface BadgePickerProps {
  readonly team: string;
  readonly badge: string;
  readonly onChange: (badge: string) => void;
  readonly size?: "regular" | "tiny";
  readonly describedBy?: string;
}

/** Picks a club badge from the phone or computer, with the crest as it will look on the board. */
export function BadgePicker({ team, badge, onChange, size = "tiny", describedBy }: BadgePickerProps) {
  const { act } = useBoard();
  const fileRef = useRef<HTMLInputElement>(null);

  async function pick(file: File) {
    try {
      onChange(await readBadge(file));
    } catch {
      act({ type: "notify", text: CLUB.badgeUnreadable });
    }
  }

  return (
    <div className="is-flex is-align-center has-gap-3">
      <Crest team={team} badge={badge} />
      <Button size={size} aria-describedby={describedBy} onClick={() => fileRef.current?.click()}>
        {badge ? CLUB.badgeChange : CLUB.badgeAdd}
      </Button>
      {badge && (
        <Button size={size} variant="quiet" onClick={() => onChange("")}>
          {CLUB.badgeRemove}
        </Button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={BADGE_CONFIG.accept}
        className="is-hidden"
        aria-label={CLUB.badgeInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void pick(file);
        }}
      />
    </div>
  );
}
