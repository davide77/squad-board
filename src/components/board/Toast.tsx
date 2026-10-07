"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TOAST_MAX_MS, TOAST_MS, TOAST_MS_PER_CHAR } from "@/constants/config";
import { MOTION } from "@/constants/motion";
import { useBoard } from "./BoardProvider";

export function Toast() {
  const { state } = useBoard();
  const notice = state.ui.notice;
  const noticeId = notice?.id ?? null;
  // Long enough to read: "Saved. Good." goes quickly, a longer word from the Gaffer stays.
  const holdMs = Math.min(TOAST_MAX_MS, Math.max(TOAST_MS, (notice?.text.length ?? 0) * TOAST_MS_PER_CHAR));
  const [hiddenId, setHiddenId] = useState<number | null>(null);

  useEffect(() => {
    if (noticeId === null) return;
    const timer = setTimeout(() => setHiddenId(noticeId), holdMs);
    return () => clearTimeout(timer);
  }, [noticeId, holdMs]);

  const show = notice && notice.id !== hiddenId;
  return (
    <div className="toast-region" role="status" aria-live="polite">
      <AnimatePresence>
        {show && (
          <motion.p
            key={notice.id}
            className="toast text-base has-font-semibold bg-kit is-kit-ink has-radius-pill has-py-2 has-px-5"
            initial={{ opacity: 0, y: MOTION.toastY }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: MOTION.toastY }}
            transition={MOTION.toast}
          >
            {notice.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
