import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";
import { classNames } from "../utils/classNames";

type ButtonProps = {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed";

const variantStyles: Record<string, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  ghost:
    "bg-transparent text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-300",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      type = "button",
      variant = "primary",
      loading = false,
      disabled = false,
      fullWidth = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        type={type}
        ref={ref}
        disabled={disabled || loading}
        className={classNames(
          baseStyles,
          variantStyles[variant],
          fullWidth && "w-full",
          "px-4 py-2"
        )}
        {...props}
      >
        {loading ? (
          <LoaderCircle className="animate-spin h-4 w-4" />
        ) : (
          icon && <span className="h-4 w-4">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
