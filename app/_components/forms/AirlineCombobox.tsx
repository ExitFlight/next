// app/_components/forms/AirlineCombobox.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Button } from "@/app/_components/forms/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/_components/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/Popover";

import { Airline } from "@/src/types/schema";

interface AirlineComboboxProps {
  airlines: Airline[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AirlineCombobox({
  airlines,
  value,
  onChange,
  placeholder = "Select Airline...",
}: AirlineComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedAirline = airlines.find(
    (airline) => airline.code.toLowerCase() === value.toLowerCase(),
  );

  const filteredAirlines = React.useMemo(() => {
    if (!searchQuery) {
      return airlines;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return airlines.filter(
      (airline) =>
        airline.name.toLowerCase().includes(lowercasedQuery) ||
        airline.code.toLowerCase().includes(lowercasedQuery),
    );
  }, [searchQuery, airlines]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background"
        >
          {selectedAirline
            ? `${selectedAirline.code} - ${selectedAirline.name}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          {/* --- UPDATED: Input now controls our state --- */}
          <CommandInput
            placeholder="Search airline by name or code..."
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No airline found.</CommandEmpty>
            <CommandGroup>
              {/* --- UPDATED: Map over the filtered list --- */}
              {filteredAirlines.map((airline) => (
                <CommandItem
                  key={airline.code}

                  onSelect={() => {
                    onChange(airline.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === airline.code.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span>
                    {airline.code} - {airline.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
