import { cn } from "@/lib/utils";
import React from "react";

interface TextAreaInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerclassname?: string;
}

const TextAreaInput: React.FC<TextAreaInputProps> = (props) => {
  return (
    <div
      className={cn(
        "ring-1 ring-white rounded-sm h-[131px] bg-white/20 backdrop-blur-lg min-w-[322px] w-full",
        props.containerclassname
      )}
    >
      <textarea {...props} draggable={false} className="w-full h-full bg-transparent p-4 outline-none" />
    </div>
  );
};

export default TextAreaInput;
