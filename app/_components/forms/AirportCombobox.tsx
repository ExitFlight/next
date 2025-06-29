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

// Define the props our component will accept
interface AirportComboboxProps {
  airports: Airport[];
  value: string; // The currently selected airport code (e.g., "JFK")
  onChange: (value: string) => void; // Function to call when an airport is selected
  placeholder?: string;
}

export function AirportCombobox({
  airports,
  value,
  onChange,
  placeholder = "Select airport...",
}: AirportComboboxProps) {
  const [open, setOpen] = React.useState(false);
  // --- NEW: State to hold the search query from the input ---
  const [searchQuery, setSearchQuery] = React.useState("");

  // Find the full airport object from the selected value code for display
  const selectedAirport = airports.find(
    (airport) => airport.code.toLowerCase() === value.toLowerCase(),
  );

  // --- NEW: Custom filtering logic ---
  // We use useMemo to avoid re-calculating on every render, only when the query or airport list changes.
  const filteredAirports = React.useMemo(() => {
    if (!searchQuery) {
      return airports;
    }

    const lowercasedQuery = searchQuery.toLowerCase();

    // This regex looks for the query at the beginning of a word boundary (\b)
    // It's case-insensitive ('i')
    const searchRegex = new RegExp(`\\b${lowercasedQuery}`, "i");

    return airports.filter((airport) => {
      // Test 1: Does the IATA code start with the query? (e.g., "LAX")
      const codeMatch = airport.code.toLowerCase().startsWith(lowercasedQuery);

      // Test 2: Does the name or city match the regex? (e.g., "New" for "New York", "Kennedy" for "JFK")
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
            onValueChange={setSearchQuery} // Updates our search query state
          />
          <CommandList>
            <CommandEmpty>No airport found.</CommandEmpty>
            <CommandGroup>
              {/* --- UPDATED: We now map over our custom `filteredAirports` list --- */}
              {filteredAirports.map((airport) => (
                <CommandItem
                  key={airport.code}
                  // We no longer need the `value` prop for filtering, as we're handling it ourselves.
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
