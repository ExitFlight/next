// app/_components/forms/AirportCombobox.tsx
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

import { Airport } from "@/src/types/schema";

interface AirportComboboxProps {
  airports: Airport[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AirportCombobox({
  airports,
  value,
  onChange,
  placeholder = "Select airport...",
}: AirportComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedAirport = airports.find(
    (airport) => airport.code.toLowerCase() === value.toLowerCase(),
  );

  const filteredAirports = React.useMemo(() => {
    if (!searchQuery) {
      return airports;
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    const searchRegex = new RegExp(`\\b${lowercasedQuery}`, "i");

    return airports.filter((airport) => {

      const codeMatch = airport.code.toLowerCase().startsWith(lowercasedQuery);

      const nameMatch = searchRegex.test(airport.name);
      const cityMatch = searchRegex.test(airport.city);

      return codeMatch || nameMatch || cityMatch;
    });
  }, [searchQuery, airports]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background"
        >
          {selectedAirport
            ? `${selectedAirport.code} - ${selectedAirport.name}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          {/* --- UPDATED: CommandInput now updates our local state --- */}
          <CommandInput
            placeholder="Search by code, name, or city..."
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No airport found.</CommandEmpty>
            <CommandGroup>
              {/* --- UPDATED: We now map over our custom `filteredAirports` list --- */}
              {filteredAirports.map((airport) => (
                <CommandItem
                  key={airport.code}

                  onSelect={() => {
                    onChange(airport.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === airport.code.toLowerCase()
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {airport.code} - {airport.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {airport.city}, {airport.country}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
