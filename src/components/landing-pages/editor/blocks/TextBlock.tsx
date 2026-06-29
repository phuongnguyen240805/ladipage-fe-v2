"use client";
import React from "react";
import { TextProps } from "../types";
import { InlineEditableText } from "../components/InlineEditableText";

interface TextBlockProps {
  props: TextProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (props: Record<string, unknown>) => void;
  isInlineEditing?: boolean;
  onBeginInlineEdit?: () => void;
  onEndInlineEdit?: () => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  props,
  isSelected,
  onSelect,
  onUpdate,
  isInlineEditing = false,
  onBeginInlineEdit,
  onEndInlineEdit,
}) => {
  const { content, fontSize, color, textAlign, lineHeight, paddingX, paddingY } = props;

  return (
    <div
      onClick={onSelect}
      className={`relative w-full cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-purple-500 ring-offset-1"
          : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{ paddingLeft: paddingX, paddingRight: paddingX, paddingTop: paddingY, paddingBottom: paddingY }}
    >
      <InlineEditableText
        tag="p"
        value={content}
        isSelected={isSelected}
        isInlineEditing={isInlineEditing}
        onRequestEdit={() => onBeginInlineEdit?.()}
        onCommit={(nextValue) => onUpdate?.({ ...props, content: nextValue })}
        onCancelEdit={() => onEndInlineEdit?.()}
        multiline
        style={{ fontSize, color, textAlign, lineHeight, margin: 0 }}
      />
      {isSelected && !isInlineEditing && (
        <div className="absolute top-1 left-1 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none">
          TEXT
        </div>
      )}
    </div>
  );
};