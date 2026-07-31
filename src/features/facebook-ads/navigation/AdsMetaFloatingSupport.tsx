"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

export default function AdsMetaFloatingSupport() {
  const [bubble, setBubble] = useState(true);
  const [open, setOpen] = useState(false);
  return (
    <>
      {bubble && !open && (
        <div className="adsmeta-support-prompt">
          <button type="button" className="adsmeta-support-prompt-close" onClick={() => setBubble(false)}><X size={12} /></button>
          <p>Bạn cần hỗ trợ gì không? 👋</p>
          <div><button type="button" onClick={() => setOpen(true)}>Có, giúp mình</button><button type="button" onClick={() => setBubble(false)}>Không cần</button></div>
        </div>
      )}
      {open && (
        <div className="adsmeta-mini-support">
          <div><b>Hỗ trợ AdsMeta</b><button type="button" onClick={() => setOpen(false)}><X size={14} /></button></div>
          <p>Xin chào Nguyễn Phương 👋<br />Bạn đang cần hỗ trợ thao tác nào?</p>
          <textarea placeholder="Mô tả vấn đề..." />
          <button type="button">Gửi yêu cầu</button>
        </div>
      )}
      <button type="button" className="adsmeta-support-button" aria-label="Mở hỗ trợ" onClick={() => setOpen((value) => !value)}>
        <MessageCircle size={23} /><span>1</span>
      </button>
    </>
  );
}
