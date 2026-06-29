import React, { ReactNode } from "react";
import {
  mergeButtonClasses,
  ButtonVariants,
  ButtonSizes,
} from "@/features/education/utils/design-system";

interface ButtonProps {
  children: ReactNode;
  size?: keyof typeof ButtonSizes;
  variant?: keyof typeof ButtonVariants;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => {
  return (
    <button
      type={type}
      className={mergeButtonClasses(variant, size, disabled, className)}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
