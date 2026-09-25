"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TOAST_MS } from "@/constants/config";
import { MOTION } from "@/constants/motion";
import { useBoard } from "./BoardProvider";

export function Toast() {
  const { state } = useBoard();
  const notice = state.ui.notice;
  const noticeId = notice?.id ?? null;
  const [hiddenId, setHiddenId] = useState<number | null>(null);

  useEffect(() => {
    if (noticeId === null) return;
    const timer = setTimeout(() => setHiddenId(noticeId), TOAST_MS);
    return () => clearTimeout(timer);
  }, [noticeId]);

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
            exit={{ opacity: 0 }}
            transition={MOTION.toast}
          >
            {notice.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
