"use client";
import React from "react";
import { TeaLandingProps } from "../types";

interface TeaLandingBlockProps {
  props: TeaLandingProps;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate?: (props: Record<string, unknown>) => void;
}

const leafSvg = (color: string) =>
  `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='${encodeURIComponent(color)}' stroke-width='2' opacity='.42'%3E%3Cpath d='M64 92C48 74 48 50 74 28c18 20 15 44-10 64Z'/%3E%3Cpath d='M60 88c4-20 9-37 26-52'/%3E%3Cpath d='M25 71c20-9 36-6 48 12-19 9-35 5-48-12Z'/%3E%3Cpath d='M31 72c14 1 25 5 36 10'/%3E%3C/g%3E%3C/svg%3E")`;

const Editable: React.FC<{
  value: string;
  isSelected: boolean;
  className?: string;
  style?: React.CSSProperties;
  onCommit: (value: string) => void;
  as?: "span" | "p" | "h1" | "h2" | "h3";
}> = ({ value, isSelected, className, style, onCommit, as = "span" }) => {
  const Tag = as;
  return (
    <Tag
      contentEditable={isSelected}
      suppressContentEditableWarning
      onBlur={(e) => onCommit(e.currentTarget.textContent || "")}
      onClick={(e) => {
        if (isSelected) e.stopPropagation();
      }}
      className={className}
      style={{ ...style, outline: "none" }}
    >
      {value}
    </Tag>
  );
};

export const TeaLandingBlock: React.FC<TeaLandingBlockProps> = ({ props, isSelected, onSelect, onUpdate }) => {
  const update = (next: Partial<TeaLandingProps>) => onUpdate?.({ ...props, ...next });
  const updateBlend = (id: string, patch: Partial<TeaLandingProps["blends"][number]>) => {
    update({ blends: props.blends.map((item) => item.id === id ? { ...item, ...patch } : item) });
  };
  const updateIngredient = (id: string, patch: Partial<TeaLandingProps["ingredients"][number]>) => {
    update({ ingredients: props.ingredients.map((item) => item.id === id ? { ...item, ...patch } : item) });
  };
  const updateBrewStep = (id: string, patch: Partial<TeaLandingProps["brewSteps"][number]>) => {
    update({ brewSteps: props.brewSteps.map((item) => item.id === id ? { ...item, ...patch } : item) });
  };

  return (
    <div
      onClick={onSelect}
      className={`relative w-full cursor-pointer overflow-hidden transition-all ${
        isSelected ? "ring-2 ring-purple-500 ring-offset-1" : "hover:ring-1 hover:ring-purple-400/40"
      }`}
      style={{
        backgroundColor: props.bgColor,
        backgroundImage: `${leafSvg("#78932f")}, linear-gradient(180deg, rgba(255,255,255,.76), rgba(245,242,231,.92))`,
        backgroundSize: "170px 170px, auto",
      }}
    >
      <div className="mx-auto max-w-[980px] bg-[#fffdf5]/95 shadow-[0_28px_70px_rgba(77,64,31,.18)]">
        <header className="flex items-center justify-between px-10 py-5 text-[12px] text-[#2f3d1c]">
          <Editable
            as="h3"
            value={props.brand}
            isSelected={isSelected}
            onCommit={(brand) => update({ brand })}
            className="text-xl font-black tracking-tight text-[#263312]"
          />
          <nav className="hidden items-center gap-6 md:flex">
            {props.navItems.map((item, index) => (
              <Editable
                key={`${item}-${index}`}
                value={item}
                isSelected={isSelected}
                onCommit={(value) => {
                  const navItems = [...props.navItems];
                  navItems[index] = value;
                  update({ navItems });
                }}
                className="font-semibold"
              />
            ))}
          </nav>
          <button className="rounded-full bg-[#6f8f22] px-4 py-1.5 text-[11px] font-bold text-white">Sign Up</button>
        </header>

        <section className="relative min-h-[460px] overflow-hidden">
          <div className="absolute inset-y-0 right-0 hidden w-[48%] md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.heroImage} alt={props.headline} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fffdf5] via-[#fffdf5]/30 to-transparent" />
          </div>
          <div className="relative z-10 flex min-h-[460px] flex-col justify-center px-12 py-14">
            <Editable
              as="h1"
              value={props.headline}
              isSelected={isSelected}
              onCommit={(headline) => update({ headline })}
              className="max-w-[430px] text-6xl font-black leading-[.93] tracking-tight text-[#22310f]"
            />
            <Editable
              as="p"
              value={props.subheadline}
              isSelected={isSelected}
              onCommit={(subheadline) => update({ subheadline })}
              className="mt-4 max-w-[360px] text-sm font-medium leading-relaxed text-[#6d754c]"
            />
            <a
              href={props.ctaUrl}
              onClick={(e) => e.preventDefault()}
              className="mt-6 inline-flex w-fit rounded-full px-5 py-2 text-xs font-black text-white shadow-lg"
              style={{ backgroundColor: props.accentColor }}
            >
              <Editable value={props.ctaText} isSelected={isSelected} onCommit={(ctaText) => update({ ctaText })} />
            </a>
          </div>
        </section>

        <section className="grid grid-cols-1 items-center gap-8 px-12 py-10 md:grid-cols-[180px_1fr]">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#bfce89] bg-[#f3f8df] text-5xl">🌿</div>
          <div>
            <Editable as="h2" value={props.philosophyTitle} isSelected={isSelected} onCommit={(philosophyTitle) => update({ philosophyTitle })} className="text-2xl font-black text-[#263312]" />
            <Editable as="p" value={props.philosophyText} isSelected={isSelected} onCommit={(philosophyText) => update({ philosophyText })} className="mt-2 text-sm leading-relaxed text-[#677047]" />
          </div>
        </section>

        <section className="px-12 pb-10 text-center">
          <h2 className="text-3xl font-black text-[#263312]">Our Blends</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#8a915f]">Revitalize your mind and body, naturally.</p>
          <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
            {props.blends.map((blend) => (
              <article key={blend.id} className="rounded-xl border border-[#d7dfad] bg-white p-5 shadow-sm">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef6d8] text-4xl">🌱</div>
                <Editable as="h3" value={blend.name} isSelected={isSelected} onCommit={(name) => updateBlend(blend.id, { name })} className="text-base font-black text-[#2b3618]" />
                <Editable as="p" value={blend.description} isSelected={isSelected} onCommit={(description) => updateBlend(blend.id, { description })} className="mt-2 min-h-10 text-[11px] leading-relaxed text-[#77805a]" />
                <button className="mt-4 rounded-full bg-[#7d8f2a] px-4 py-1.5 text-[10px] font-black text-white">View Blend</button>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 bg-[#fbfaf2] px-12 py-10 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <h2 className="text-2xl font-black text-[#263312]">Pure & Natural Ingredients</h2>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {props.ingredients.map((item) => (
                <div key={item.id} className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#eef6d8] text-3xl">🍃</div>
                  <Editable as="h3" value={item.name} isSelected={isSelected} onCommit={(name) => updateIngredient(item.id, { name })} className="text-sm font-black text-[#2b3618]" />
                  <Editable as="p" value={item.description} isSelected={isSelected} onCommit={(description) => updateIngredient(item.id, { description })} className="mt-1 text-[10px] leading-relaxed text-[#77805a]" />
                </div>
              ))}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#d9e3b6] bg-white p-5">
              <h3 className="text-lg font-black text-[#263312]">The Perfect Brew</h3>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {props.brewSteps.map((step) => (
                  <div key={step.id}>
                    <Editable value={step.value} isSelected={isSelected} onCommit={(value) => updateBrewStep(step.id, { value })} className="block text-sm font-black text-[#6f8f22]" />
                    <Editable value={step.label} isSelected={isSelected} onCommit={(label) => updateBrewStep(step.id, { label })} className="mt-1 block text-[10px] text-[#77805a]" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#d9e3b6] bg-white p-5">
              <h3 className="text-lg font-black text-[#263312]">Customer Reviews</h3>
              <div className="mt-3 text-[#f5a623]">★★★★★</div>
              <Editable as="p" value={props.reviewQuote} isSelected={isSelected} onCommit={(reviewQuote) => update({ reviewQuote })} className="mt-2 text-sm leading-relaxed text-[#58603c]" />
              <Editable value={props.reviewAuthor} isSelected={isSelected} onCommit={(reviewAuthor) => update({ reviewAuthor })} className="mt-3 block text-xs font-bold text-[#263312]" />
            </div>
          </aside>
        </section>

        <section className="px-12 py-10 text-center">
          <Editable as="h2" value={props.signupTitle} isSelected={isSelected} onCommit={(signupTitle) => update({ signupTitle })} className="text-2xl font-black text-[#263312]" />
          <div className="mx-auto mt-5 flex max-w-md overflow-hidden rounded-full border border-[#d4dfaa] bg-white p-1">
            <Editable value={props.signupPlaceholder} isSelected={isSelected} onCommit={(signupPlaceholder) => update({ signupPlaceholder })} className="flex-1 px-4 py-2 text-left text-xs text-[#8a915f]" />
            <button className="rounded-full px-5 py-2 text-xs font-black text-white" style={{ backgroundColor: props.accentColor }}>
              <Editable value={props.signupButton} isSelected={isSelected} onCommit={(signupButton) => update({ signupButton })} />
            </button>
          </div>
        </section>
      </div>

      {isSelected && (
        <div className="absolute left-2 top-2 z-20 rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
          HERB TEA TEMPLATE
        </div>
      )}
    </div>
  );
};
