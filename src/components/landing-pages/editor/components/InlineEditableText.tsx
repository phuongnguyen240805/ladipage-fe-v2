"use client";

import React, { useEffect, useRef } from "react";

type InlineTextTag = "p" | "span" | "h1" | "h2" | "h3" | "a" | "label";

interface InlineEditableTextProps {
  tag?: InlineTextTag;
  value: string;
  isSelected: boolean;
  isInlineEditing: boolean;
  onRequestEdit: () => void;
  onCommit: (value: string) => void;
  onCancelEdit: () => void;
  style?: React.CSSProperties;
  className?: string;
  multiline?: boolean;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  tag: Tag = "span",
  value,
  isSelected,
  isInlineEditing,
  onRequestEdit,
  onCommit,
  onCancelEdit,
  style,
  className,
  multiline = false,
}) => {
  const ref = useRef<HTMLElement>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    if (!isInlineEditing) return;
    committedRef.current = false;
    const node = ref.current;
    if (!node) return;
    node.focus();
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(node);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }, [isInlineEditing]);

  const commit = () => {
    if (committedRef.current) return;
    committedRef.current = true;
    const nextValue = ref.current?.textContent?.trim() ?? "";
    onCommit(nextValue);
    onCancelEdit();
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (!isSelected) return;
    onRequestEdit();
  };

  const handleBlur = () => {
    if (!isInlineEditing) return;
    commit();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isInlineEditing) return;

    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const cmdCtrl = isMac ? event.metaKey : event.ctrlKey;

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      if (ref.current) ref.current.textContent = value;
      committedRef.current = true;
      onCancelEdit();
      return;
    }

    if (cmdCtrl && event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      commit();
      return;
    }

    if (!multiline && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      commit();
    }
  };

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      data-inline-editable
      contentEditable={isInlineEditing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        if (isSelected || isInlineEditing) event.stopPropagation();
      }}
      onMouseDown={(event) => {
        if (isSelected || isInlineEditing) event.stopPropagation();
      }}
      className={className}
      style={{ ...style, outline: "none", cursor: isSelected ? "text" : undefined }}
    >
      {value}
    </Tag>
  );
};