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

// Define the shape of an airport object we'll receive
interface Airport {
  code: string;
  name: string;
}

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

  // Find the full airport object from the selected value code
  const selectedAirport = airports.find(
    (airport) => airport.code.toLowerCase() === value.toLowerCase(),
  );

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
          <CommandInput placeholder="Search airport..." />
          <CommandList>
            <CommandEmpty>No airport found.</CommandEmpty>
            <CommandGroup>
              {airports.map((airport) => (
                <CommandItem
                  key={airport.code}
                  value={airport.name} // Search by name
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
                  {airport.code} - {airport.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
