"use client";

import React from "react";
import { Check } from "lucide-react";

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  description?: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  size = "md",
  variant = "default",
  description,
  className = "",
  labelClassName = "",
  required = false,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          checkbox: "w-4 h-4",
          icon: "w-3 h-3",
          text: "text-base",
          description: "text-xs",
        };
      case "lg":
        return {
          checkbox: "w-6 h-6",
          icon: "w-4 h-4",
          text: "text-lg",
          description: "text-base",
        };
      default: // md
        return {
          checkbox: "w-5 h-5",
          icon: "w-3.5 h-3.5",
          text: "text-base",
          description: "text-base",
        };
    }
  };

  const getVariantClasses = () => {
    if (disabled) {
      return {
        checkbox: "border-gray-300 bg-gray-100",
        checked: "bg-button-bg border-button-bg",
        focus: "focus:ring-gray-200",
      };
    }

    switch (variant) {
      case "primary":
        return {
          checkbox: "border-blue-300 hover:border-blue-400",
          checked: "bg-blue-600 border-blue-600 hover:bg-blue-700",
          focus: "focus:ring-blue-200",
        };
      case "success":
        return {
          checkbox: "border-green-300 hover:border-green-400",
          checked: "bg-green-600 border-green-600 hover:bg-green-700",
          focus: "focus:ring-green-200",
        };
      case "warning":
        return {
          checkbox: "border-orange-300 hover:border-orange-400",
          checked: "bg-orange-600 border-orange-600 hover:bg-orange-700",
          focus: "focus:ring-orange-200",
        };
      case "danger":
        return {
          checkbox: "border-red-300 hover:border-red-400",
          checked: "bg-red-600 border-red-600 hover:bg-red-700",
          focus: "focus:ring-red-200",
        };
      default:
        return {
          checkbox: "border-gray-300 hover:border-gray-400",
          checked: "bg-green-600 border-gray-200 hover:bg-green-400",
          focus: "focus:ring-gray-200",
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  const handleChange = () => {
    if (!disabled) {
      console.log(disabled);
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-start font-light space-x-2 ${className}`}>
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only" // Hide the default checkbox
          required={required}
        />
        <label
          htmlFor={id}
          className={`
            relative inline-flex text-base items-center justify-center
            ${sizeClasses.checkbox}
            border rounded-[4px] cursor-pointer transition-colors duration-200
            ${checked ? variantClasses.checked : variantClasses.checkbox}
            ${variantClasses.focus}
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
          `}
        >
          {checked && (
            <Check
              className={`${sizeClasses.icon} text-white transition-opacity duration-200`}
              strokeWidth={3}
            />
          )}
        </label>
      </div>

      <div className="flex-1">
        <label
          htmlFor={id}
          className={`
  cursor-pointer text-gray-100 text-sm transition-colors duration-200 font-medium
            ${sizeClasses.text}
           
            ${labelClassName}
          `}
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default Checkbox;
