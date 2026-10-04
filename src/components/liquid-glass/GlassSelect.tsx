"use client";

import React, { Children, forwardRef, isValidElement, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Select, SelectContent, SelectItem } from "@/components/ui/select/Select";

type Props = React.SelectHTMLAttributes<HTMLSelectElement>;
type Option = { value: string; label: React.ReactNode; disabled: boolean };

function text(node: React.ReactNode): string {
  return Children.toArray(node).map((child) => isValidElement<{ children?: React.ReactNode }>(child) ? text(child.props.children) : String(child)).join("");
}
function optionsFrom(children: React.ReactNode, inheritedDisabled = false): Option[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child)) return [];
    if (child.type === "option") return [{ value: String(child.props.value ?? text(child.props.children)), label: child.props.label ?? child.props.children, disabled: inheritedDisabled || Boolean(child.props.disabled) }];
    return optionsFrom(child.props.children, inheritedDisabled || Boolean(child.props.disabled));
  });
}

/** Native form/ref/event contract with a keyboard-accessible, portal-based glass popup.
 * Options and business handlers remain owned by the original screen.
 */
export const GlassSelect = forwardRef<HTMLSelectElement, Props>(function GlassSelect({
  children, className = "", style, id, value, defaultValue, disabled, onChange, onBlur, onFocus,
  multiple, size, ...props
}, forwardedRef) {
  const native = useRef<HTMLSelectElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const options = optionsFrom(children);
  const [uncontrolled, setUncontrolled] = useState(() => String(defaultValue ?? options.find((option) => !option.disabled)?.value ?? ""));
  const requested = String(value ?? uncontrolled);
  const selected = options.some((option) => option.value === requested) ? requested : options.find((option) => !option.disabled)?.value ?? "";
  useImperativeHandle(forwardedRef, () => native.current!);
  // Native listboxes retain their multi-select/size behavior.
  const nativeOnly = Boolean(multiple || (size && size > 1));
  useEffect(() => {
    const element = native.current;
    if (!element || nativeOnly) return;
    const sync = () => queueMicrotask(() => { if (element.isConnected && value === undefined) setUncontrolled(element.value); });
    sync();
    element.form?.addEventListener("reset", sync);
    return () => element.form?.removeEventListener("reset", sync);
  }, [children, value, nativeOnly]);

  if (nativeOnly) return <select ref={native} {...props} id={id} className={className} style={style} value={value} defaultValue={defaultValue} disabled={disabled} multiple={multiple} size={size} onChange={onChange} onBlur={onBlur} onFocus={onFocus}>{children}</select>;
  const choose = (next: string | null) => {
    if (next === null || !native.current) return;
    const element = native.current;
    element.value = next;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  };
  return <>
    <Select value={selected} disabled={disabled} items={options.map((option) => ({ value: option.value, label: option.label }))} onValueChange={choose}>
      <SelectPrimitive.Trigger
        ref={trigger} id={id} className={`liquid-select-trigger ${className}`} style={style}
        aria-label={props["aria-label"]} aria-labelledby={props["aria-labelledby"]} aria-describedby={props["aria-describedby"]} aria-invalid={props["aria-invalid"]}
        aria-required={props.required} data-liquid-control="button"
        onBlur={() => native.current?.dispatchEvent(new FocusEvent("focusout", { bubbles: true }))}
      ><span>{options.find((option) => option.value === selected)?.label ?? selected}</span><ChevronDown aria-hidden="true" /></SelectPrimitive.Trigger>
      <SelectContent>{options.map((option, index) => <SelectItem key={`${option.value}-${index}`} value={option.value} disabled={option.disabled}>{option.label}</SelectItem>)}</SelectContent>
    </Select>
    <select
      {...props} ref={native} id={`${id ?? generatedId}-native`} className="liquid-native-select"
      tabIndex={-1} aria-hidden="true" value={value} defaultValue={defaultValue} disabled={disabled}
      onChange={(event) => { if (value === undefined) setUncontrolled(event.target.value); onChange?.(event); }}
      onFocus={(event) => { trigger.current?.focus(); onFocus?.(event); }} onBlur={onBlur}
      onInvalid={() => trigger.current?.focus()}
    >{children}</select>
  </>;
});
