"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import React from "react";

export type CountryOption = {
  name: string;
  code: string; // ISO 3166-1 alpha-2 (e.g., US, GB, NG)
  dial_code: string; // e.g., +1
};

type Props = {
  countries: CountryOption[];
  valueCode?: string; // currently selected country code
  onSelect: (country: CountryOption) => void;
  disabled?: boolean;
  className?: string;
};

const CountrySelect: React.FC<Props> = ({
  countries,
  valueCode,
  onSelect,
  disabled,
  className,
}) => {
  const selected = countries.find((c) => c.code === valueCode) || countries[0];
  const displayCode = selected ? (selected.code === "GB" ? "UK" : selected.code) : "US";
  const displayLabel = selected ? `${displayCode} (${selected.dial_code})` : "Select";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            "h-[48px] min-w-[120px] px-3 justify-between bg-white/20 border border-gray-600 text-white hover:bg-white/30 hover:text-white",
            className
          )}
        >
          <span className="truncate text-base font-medium">{displayLabel}</span>
          <ChevronDown className="size-4 opacity-80" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[260px] max-h-72 overflow-y-auto bg-[#121212] text-white border-gray-600"
      >
        {countries.map((c) => {
          const code = c.code === "GB" ? "UK" : c.code;
          return (
            <DropdownMenuItem
              key={c.code}
              onClick={() => onSelect(c)}
              className="cursor-pointer focus:bg-white/10"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold w-14">{code}</span>
                <span className="text-gray-300">{c.name}</span>
                <span className="ml-auto text-gray-400">{c.dial_code}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelect;