import { cn } from "@/lib/utils";
import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerclassname?: string;
}

const TextInput: React.FC<TextInputProps> = (props) => {
  return (
    <div
      className={cn(
        "ring-1 ring-white rounded-sm h-[48px] bg-white/20 backdrop-blur-lg min-w-[322px] w-full",
        props.containerclassname
      )}
    >
      <input
        {...props}
        className="w-full h-full bg-transparent p-4 outline-none"
      />
    </div>
  );
};

export default TextInput;
