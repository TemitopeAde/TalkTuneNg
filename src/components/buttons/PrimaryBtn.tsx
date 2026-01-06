import { cn } from "@/lib/utils";
import React from "react";

interface PrimaryBtnProps {
  label: string | React.ReactNode;
  containerclass?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  style?: React.CSSProperties
}

const PrimaryBtn: React.FC<PrimaryBtnProps> = ({
  label,
  containerclass = "",
  disabled = false,
  type = "button",
  onClick,
  style
}) => {
  return (
    <button
      type={type}
      className={cn(
        "bg-white transition-all duration-300 z-0 whitespace-nowrap hover:bg-white/90 rounded-[8px] py-3 px-5",
        disabled && "opacity-50 cursor-not-allowed",
        containerclass
      )}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      <h4 className={cn("text-[#00246B] text-base font-medium")}>{label}</h4>
    </button>
  );
};

export default PrimaryBtn;
