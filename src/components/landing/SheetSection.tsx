"use client";

import { SHARE_URLS, SHEET_SECTION } from "@/constants/content/landing";
import { Button } from "../Button";
import { cx } from "../cx";
import { useLanding } from "./LandingProvider";

const SHARE_LINK = "button button--default is-inline-flex is-align-center has-py-3 has-px-5 has-radius-field has-font-bold text-md";

export function SheetSection() {
  const { copy, sheet, copyState, copySheet, initials, toggleInitials } = useLanding();
  const text = encodeURIComponent(sheet);

  return (
    <section id="sheet" className="landing-section bg-kit is-kit-ink">
      <div className="container landing-split is-grid is-align-center has-gap-9 landing-section__pad">
        <div className="is-flex is-flex-column has-gap-5">
          <h2 className="landing-display landing-display--section">{copy.sheetH}</h2>
          <p className="landing-pretty text-lg measure-52ch">{SHEET_SECTION.body}</p>
          <div className="is-flex is-flex-wrap has-gap-2">
            <a href={SHARE_URLS.whatsapp + text} target="_blank" rel="noopener" className={SHARE_LINK}>
              {SHEET_SECTION.whatsapp}
            </a>
            <a
              href={`${SHARE_URLS.mail}${encodeURIComponent(SHEET_SECTION.mailSubject)}&body=${text}`}
              className={SHARE_LINK}
            >
              {SHEET_SECTION.email}
            </a>
            <Button variant="outline" className="has-py-3 has-px-5 has-font-bold text-md" onClick={copySheet}>
              {copyState === "copied" ? SHEET_SECTION.copied : SHEET_SECTION.copy}
            </Button>
          </div>
          {/* Always in the page, so a screen reader hears it fill. A failure shows too; a success is on the button. */}
          <p role="status" className={cx("text-md", copyState !== "failed" && "sr-only")}>
            {copyState === "copied" && SHEET_SECTION.copiedSpoken}
            {copyState === "failed" && SHEET_SECTION.copyFailed}
          </p>
          <label className="landing-check is-flex is-align-center has-gap-3 text-md">
            <input type="checkbox" checked={initials} onChange={toggleInitials} />
            {SHEET_SECTION.initials}
          </label>
        </div>

        <div className="landing-chat bg-board is-w-full is-self-center has-radius-sheet has-p-5 is-flex is-flex-column has-gap-2">
          <p className="text-xs is-dim">{SHEET_SECTION.chat}</p>
          <p className="landing-chat__bubble bg-board-3 is-chalk is-self-end has-py-3 has-px-3 text-base leading-normal">
            {sheet}
          </p>
        </div>
      </div>
    </section>
  );
}
