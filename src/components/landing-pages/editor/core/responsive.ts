import { DeviceMode, EditorBlock } from "../types";

export function mergeResponsiveProps<TProps extends Record<string, unknown>>(
  defaultProps: TProps,
  block: EditorBlock<TProps>,
  deviceMode: DeviceMode,
): TProps {
  return {
    ...defaultProps,
    ...block.props,
    ...(block.responsive?.[deviceMode] ?? {}),
  };
}

export function isResponsiveStyleField(fieldName: string): boolean {
  return [
    "fontSize",
    "lineHeight",
    "paddingX",
    "paddingY",
    "height",
    "minHeight",
    "columns",
    "gap",
    "borderRadius",
    "textAlign",
    "align",
    "width",
  ].includes(fieldName);
}
