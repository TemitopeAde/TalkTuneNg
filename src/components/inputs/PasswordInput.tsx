import { cn } from "@/lib/utils";
import { PasswordInputProps } from "@/types";
import React from "react";


const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder,
  type,
  name,
  value,
  onChange,
  containerclassname = "",
  className = "",
  required = false,
  showPassword = false,
  onTogglePassword,
}) => {
  return (
    <div
      className={cn(
        "relative bg-white/20 backdrop-blur-lg border border-gray-600 rounded-sm",
        containerclassname
      )}
    >
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-3 bg-transparent text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10",
          className
        )}
        required={required}
      />
      {onTogglePassword && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-100"
        >
          
        </button>
      )}
    </div>
  );
};

export default PasswordInput;