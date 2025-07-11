// app/select-flight/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  Plane,
  Calendar as CalendarIcon,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { Button } from "@/app/_components/forms/Button";
import { Card, CardContent } from "@/app/_components/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/forms/Select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/Popover";
import { Separator } from "@/app/_components/Separator";
import { Input } from "@/app/_components/forms/Input";
import { Label } from "@/app/_components/forms/Label";
import { Badge } from "@/app/_components/Badge";
import ProgressStepper from "@/app/_components/ProgressStepper";
import { AirportCombobox } from "@/app/_components/forms/AirportCombobox";
import { AirlineCombobox } from "@/app/_components/forms/AirlineCombobox";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/Alert";

import { useFlightContext } from "@/app/context/FlightContext";
import { calculateEnhancedFlightDetails } from "@/src/lib/enhancedFlightCalculator";
import { allAirlines } from "@/src/lib/airlineUtil";
import {
  Flight,
  EnhancedFlightDetails,
  FLIGHT_STORAGE_KEY,
} from "@/src/types/schema";
import { formatDistance } from "@/src/lib/helper";
import allAirports from "@/src/data/airports.json";

const hourOptions = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const minuteOptions = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0"),
);
const cabinClasses = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

interface FlightFormState {
  departureAirport: string;
  destinationAirport: string;
  departureDate: string;
  departureHour: string;
  departureMinute: string;
  selectedAirline: string;
  flightNumberDigits: string;
  selectedCabin: string;
}

const defaultFormState: FlightFormState = {
  departureAirport: "",
  destinationAirport: "",
  departureDate: format(new Date(), "yyyy-MM-dd"),
  departureHour: "09",
  departureMinute: "00",
  selectedAirline: "",
  flightNumberDigits: "123",
  selectedCabin: "economy",
};

const SelectFlightPage = () => {
  const router = useRouter();
  const { setFlightDetails, setSelectedFlight } = useFlightContext();
  const ticketPreviewRef = useRef<HTMLDivElement>(null);

  const [formState, setFormState] = useState<FlightFormState>(() => {
    if (typeof window === "undefined") {
      return defaultFormState;
    }
    try {
      const savedState = localStorage.getItem(FLIGHT_STORAGE_KEY);
      return savedState ? JSON.parse(savedState) : defaultFormState;
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
      return defaultFormState;
    }
  });

  const [flightData, setFlightData] = useState<EnhancedFlightDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isDepartureCalendarOpen, setIsDepartureCalendarOpen] = useState(false);

  useEffect(() => {
    document.title = "Select Flight - ExitFlight";
  }, []);

  useEffect(() => {
    localStorage.setItem(FLIGHT_STORAGE_KEY, JSON.stringify(formState));
  }, [formState]);

  useEffect(() => {
    if (flightData && ticketPreviewRef.current) {
      ticketPreviewRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [flightData]);

  const handleFormChange = (field: keyof FlightFormState, value: string) => {
    setFormState((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleFormChange("departureDate", format(date, "yyyy-MM-dd"));
    }
    setIsDepartureCalendarOpen(false);
  };

  const handleResetAll = () => {
    localStorage.removeItem(FLIGHT_STORAGE_KEY);
    setFormState(defaultFormState);
    setFlightData(null);
    setError("");
  };

  const handleGenerateFlight = async () => {
    const {
      departureAirport,
      destinationAirport,
      selectedAirline,
      flightNumberDigits,
    } = formState;

    setError("");

    if (
      !departureAirport ||
      !destinationAirport ||
      !selectedAirline ||
      !/^\d{1,5}$/.test(flightNumberDigits)
    ) {
      setError(
        "Please fill all required fields: Airports, Airline, and a valid Flight Number (1-5 digits).",
      );
      return;
    }
    if (departureAirport === destinationAirport) {
      setError("Departure and destination airports cannot be the same.");
      return;
    }

    setIsLoading(true);
    setFlightData(null);

    try {
      const departureTimeInput = `${formState.departureHour}:${formState.departureMinute}`;
      const calculatedData = await calculateEnhancedFlightDetails(
        departureAirport,
        destinationAirport,
        formState.departureDate,
        departureTimeInput,
      );

      const airlineInfo = allAirlines.find((a) => a.code === selectedAirline);

      const departureAirportInfo = allAirports.find(
        (a) => a.code === departureAirport,
      );
      const destinationAirportInfo = allAirports.find(
        (a) => a.code === destinationAirport,
      );

      if (
        !airlineInfo ||
        !departureAirportInfo ||
        !destinationAirportInfo ||
        !calculatedData.departureDateLocal
      ) {
        throw new Error("Could not retrieve all necessary flight information.");
      }

      const enhancedFlightData: EnhancedFlightDetails = {
        ...calculatedData,
        departureAirport,
        departureAirportName: departureAirportInfo.name,
        arrivalAirport: destinationAirport,
        arrivalAirportName: destinationAirportInfo.name,
        departureTime: departureTimeInput,
        flightNumber: `${selectedAirline.toUpperCase()}${flightNumberDigits}`,
        airline: airlineInfo,
        cabin: formState.selectedCabin,
        departureDate: formState.departureDate,
      };
      setFlightData(enhancedFlightData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Error generating flight:", err);
      setError(`Failed to generate flight: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (!flightData) return;

    setFlightDetails({
      departureAirport: flightData.departureAirport,
      arrivalAirport: flightData.arrivalAirport,
      departureDate: flightData.departureDate,
      departureTime: flightData.departureTime,
      calculatedFlightData: flightData,
    });

    const cleanAirline = {
      code: flightData.airline.code,
      name: flightData.airline.name,
    };

    const flight: Flight = {
      flightNumber: flightData.flightNumber,
      airline: cleanAirline,
      departure: {
        airport: {
          code: flightData.departureAirport,
          name: flightData.departureAirportName,
          city:
            allAirports.find((a) => a.code === flightData.departureAirport)
              ?.city || "",
          country:
            allAirports.find((a) => a.code === flightData.departureAirport)
              ?.country || "N/A",
        },
        time: flightData.departureTimeLocal,
        date: flightData.departureDateLocal,
      },
      arrival: {
        airport: {
          code: flightData.arrivalAirport,
          name: flightData.arrivalAirportName,
          city:
            allAirports.find((a) => a.code === flightData.arrivalAirport)
              ?.city || "",
          country:
            allAirports.find((a) => a.code === flightData.arrivalAirport)
              ?.country || "N/A",
        },
        time: flightData.arrivalTimeLocal,
        date: flightData.arrivalDateLocal,
      },
      duration: flightData.durationFormatted,
      class: flightData.cabin,
    };

    setSelectedFlight(flight);
    router.push("/passenger-details");
  };

  const departureDateAsDate = new Date(formState.departureDate + "T00:00:00");

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={1} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">
          Select Your Flight
        </h2>

        <Card className="border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-4">
                <FormElement label="Departure Airport">
                  <AirportCombobox
                    airports={allAirports}
                    value={formState.departureAirport}
                    onChange={(value: string) =>
                      handleFormChange("departureAirport", value)
                    }
                    placeholder="Select departure..."
                  />
                </FormElement>
                <FormElement label="Departure Date">
                  <Popover
                    open={isDepartureCalendarOpen}
                    onOpenChange={setIsDepartureCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-background"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formState.departureDate ? (
                          format(departureDateAsDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DayPicker
                        mode="single"
                        selected={departureDateAsDate}
                        onSelect={handleDateChange}
                        initialFocus
                        disabled={(d) =>
                          d < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </FormElement>
                <FormElement label="Airline">
                  <AirlineCombobox
                    airlines={allAirlines}
                    value={formState.selectedAirline}
                    onChange={(value: string) =>
                      handleFormChange("selectedAirline", value)
                    }
                    placeholder="Select airline..."
                  />
                </FormElement>
              </div>
              <div className="space-y-4">
                <FormElement label="Destination Airport">
                  <AirportCombobox
                    airports={allAirports}
                    value={formState.destinationAirport}
                    onChange={(value: string) =>
                      handleFormChange("destinationAirport", value)
                    }
                    placeholder="Select destination..."
                  />
                </FormElement>
                <FormElement label="Departure Time">
                  <div className="flex space-x-2">
                    <Select
                      value={formState.departureHour}
                      onValueChange={(v: string) =>
                        handleFormChange("departureHour", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {hourOptions.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={formState.departureMinute}
                      onValueChange={(v: string) =>
                        handleFormChange("departureMinute", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {minuteOptions.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </FormElement>
                <FormElement label="Flight Number (Digits)">
                  <Input
                    id="flightNumberDigits"
                    type="text"
                    placeholder="e.g., 123"
                    value={formState.flightNumberDigits}
                    onChange={(e) =>
                      handleFormChange(
                        "flightNumberDigits",
                        e.target.value.replace(/\D/g, "").slice(0, 5),
                      )
                    }
                  />
                  {formState.selectedAirline &&
                    formState.flightNumberDigits && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Full:{" "}
                        <Badge variant="secondary">
                          {formState.selectedAirline.toUpperCase()}
                          {formState.flightNumberDigits}
                        </Badge>
                      </p>
                    )}
                </FormElement>
                <FormElement label="Cabin Class">
                  <Select
                    value={formState.selectedCabin}
                    onValueChange={(v: string) =>
                      handleFormChange("selectedCabin", v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cabin" />
                    </SelectTrigger>
                    <SelectContent>
                      {cabinClasses.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormElement>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={handleResetAll}
                className="text-muted-foreground border-muted hover:text-destructive"
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset Form
              </Button>
              <Button onClick={handleGenerateFlight} disabled={isLoading}>
                {isLoading ? "Generating Preview..." : "Preview Ticket"}
              </Button>
            </div>
            {error && (
              <div className="mt-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {flightData && (
          <Card ref={ticketPreviewRef} className="border-border bg-card mt-8">
            <CardContent className="p-4 md:p-6">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full mr-3">
                    <Plane className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {flightData.flightNumber}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {flightData.airline.name}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">
                  {
                    cabinClasses.find((c) => c.value === flightData.cabin)
                      ?.label
                  }
                </Badge>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {flightData.departureTimeLocal}
                  </div>
                  <div className="text-sm">{flightData.departureAirport}</div>
                  <div className="text-xs text-muted-foreground">
                    {flightData.departureAirportName}
                  </div>
                </div>
                <div className="flex-1 text-center px-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    {flightData.durationFormatted}
                  </div>
                  <div className="relative w-full flex items-center">
                    <div className="h-0.5 bg-primary w-full"></div>
                    <div>
                      <Plane className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistance(flightData.distanceKm)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {flightData.arrivalTimeLocal}
                  </div>
                  <div className="text-sm">{flightData.arrivalAirport}</div>
                  <div className="text-xs text-muted-foreground">
                    {flightData.arrivalAirportName}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleContinue}>
                  Continue to Passenger Details{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const FormElement = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <Label className="block text-foreground font-medium mb-1.5 text-sm">
      {label}
    </Label>
    {children}
  </div>
);

export default SelectFlightPage;
