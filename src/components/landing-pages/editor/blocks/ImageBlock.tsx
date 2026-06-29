"use client";
import React from "react";
import { ImageProps } from "../types";

interface ImageBlockProps {
  props: ImageProps;
  isSelected: boolean;
  onSelect: () => void;
}

const widthClasses: Record<string, string> = {
  full: "w-full",
  large: "w-4/5 mx-auto",
  medium: "w-3/5 mx-auto",
  small: "w-2/5 mx-auto",
};

export const ImageBlock: React.FC<ImageBlockProps> = ({ props, isSelected, onSelect }) => {
  const { src, alt, caption, width, borderRadius, showCaption, objectFit } = props;

  return (
    <div
      onClick={onSelect}
      className="w-full flex cursor-pointer p-4"
    >
      <div
        className={`relative transition-all ${widthClasses[width] || "w-full"} ${
          isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
        }`}
        style={{ borderRadius }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full"
            style={{ borderRadius, objectFit, display: "block", maxHeight: 500 }}
          />
        ) : (
          /* Placeholder when no image src */
          <div
            className="w-full flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 gap-2"
            style={{ minHeight: 200, borderRadius }}
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-sm font-medium">Thêm URL ảnh trong Inspector →</span>
          </div>
        )}
        {showCaption && caption && (
          <p className="text-center text-sm text-gray-500 mt-2 italic">{caption}</p>
        )}
        {isSelected && (
          <div className="absolute -top-7 left-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide z-20 select-none whitespace-nowrap">
            IMAGE
          </div>
        )}
      </div>
    </div>
  );
};
