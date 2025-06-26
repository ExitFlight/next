// app/select-flight/page.tsx
'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowRight, Plane, Calendar as CalendarIcon, RefreshCcw } from "lucide-react";
import { format } from "date-fns";

// Component Imports
import { Button } from "@/app/_components/forms/Button";
import { Card, CardContent } from "@/app/_components/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/forms/Select";
import { Calendar } from "@/app/_components/forms/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/_components/Popover";
import { Separator } from "@/app/_components/Separator";
import { Input } from "@/app/_components/forms/Input";
import { Label } from "@/app/_components/forms/Label";
import { Badge } from "@/app/_components/Badge";
import ProgressStepper from "@/app/_components/ProgressStepper";
import { AirportCombobox } from "@/app/_components/forms/AirportCombobox"; // <-- IMPORT OUR NEW COMPONENT

// Context and Utils
import { useFlightContext } from "@/app/context/FlightContext";
import { calculateEnhancedFlightDetails, EnhancedFlightDetails } from "@/src/lib/enhancedFlightCalculator";
import { allAirlines } from "@/src/lib/airlineUtil";
import { majorAirports } from "@/src/constants/majorAirports";
import { MockFlight } from "@/src/types/schema";
import { formatDistance } from "@/src/lib/utils";

// --- Constants and Type Definitions ---
const allAirportsFlat = Object.values(majorAirports).flat().sort((a, b) => a.code.localeCompare(b.code));
const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const minuteOptions = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));
const cabinClasses = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];
const LOCAL_STORAGE_KEY = "exitFlightFormState";

// A simplified state object for our form
interface FlightFormState {
  departureAirport: string;
  destinationAirport: string;
  departureDate: string; // Store as ISO string 'YYYY-MM-DD'
  departureHour: string;
  departureMinute: string;
  selectedAirline: string;
  flightNumberDigits: string;
  selectedCabin: string;
}

// --- The Component ---
const SelectFlightPage = () => {
  const router = useRouter();
  const { setFlightDetails, setSelectedFlight } = useFlightContext();
  const ticketPreviewRef = useRef<HTMLDivElement>(null);

  // --- State Management ---
  const [formState, setFormState] = useState<FlightFormState>({
    departureAirport: "",
    destinationAirport: "",
    departureDate: format(new Date(), "yyyy-MM-dd"),
    departureHour: "09",
    departureMinute: "00",
    selectedAirline: "",
    flightNumberDigits: "123",
    selectedCabin: "economy",
  });

  const [flightData, setFlightData] = useState<EnhancedFlightDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isDepartureCalendarOpen, setIsDepartureCalendarOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {    
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) setFormState(JSON.parse(savedState));
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formState));
  }, [formState]);

  useEffect(() => {
    if (flightData && ticketPreviewRef.current) {
      ticketPreviewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [flightData]);

  // --- Event Handlers ---
  const handleFormChange = (field: keyof FlightFormState, value: string) => {
    setFormState(prevState => ({ ...prevState, [field]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) handleFormChange("departureDate", format(date, "yyyy-MM-dd"));
    setIsDepartureCalendarOpen(false);
  };

  const handleResetAll = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setFormState({
      departureAirport: "", destinationAirport: "",
      departureDate: format(new Date(), "yyyy-MM-dd"), departureHour: "09", departureMinute: "00",
      selectedAirline: "", flightNumberDigits: "123", selectedCabin: "economy",
    });
    setFlightData(null);
    setError("");
  };

  const handleGenerateFlight = async () => {
    const { departureAirport, destinationAirport, selectedAirline, flightNumberDigits } = formState;

    if (!departureAirport || !destinationAirport || !selectedAirline || !/^\d{1,5}$/.test(flightNumberDigits)) {
      alert("Please fill all required fields: Airports, Airline, and a valid Flight Number (1-5 digits).");
      return;
    }
    if (departureAirport === destinationAirport) {
      alert("Departure and destination airports cannot be the same.");
      return;
    }

    setIsLoading(true);
    setError("");
    setFlightData(null);

    try {
      const departureTimeInput = `${formState.departureHour}:${formState.departureMinute}`;
      const calculatedData = await calculateEnhancedFlightDetails(departureAirport, destinationAirport, formState.departureDate, departureTimeInput);
      
      const airlineInfo = allAirlines.find(a => a.code === selectedAirline);
      const departureAirportInfo = allAirportsFlat.find(a => a.code === departureAirport);
      const destinationAirportInfo = allAirportsFlat.find(a => a.code === destinationAirport);

      if (!airlineInfo || !departureAirportInfo || !destinationAirportInfo || !calculatedData.departureDateLocal) {
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
        airline: { id: 0, ...airlineInfo }, // Mock ID
        cabin: formState.selectedCabin,
      };
      setFlightData(enhancedFlightData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
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
    
    const mockFlight: MockFlight = {
      id: 1, flightNumber: flightData.flightNumber,
      airline: { id: 0, code: flightData.airline.code, name: flightData.airline.name, logo: flightData.airline.logo || "", region: flightData.airline.region || "" },
      departure: { airport: { code: flightData.departureAirport, name: flightData.departureAirportName, city: flightData.departureAirportName.split(",")[0], country: "N/A" }, time: flightData.departureTime, date: flightData.departureDate },
      arrival: { airport: { code: flightData.arrivalAirport, name: flightData.arrivalAirportName, city: flightData.arrivalAirportName.split(",")[0], country: "N/A" }, time: flightData.arrivalTime, date: flightData.arrivalDate },
      duration: flightData.duration, class: flightData.cabin,
    };
    setSelectedFlight(mockFlight);
    router.push("/passenger-details");
  };
  
  const departureDateAsDate = new Date(formState.departureDate + 'T00:00:00');

  // --- Render ---
  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={1} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">Select Your Flight</h2>

        <Card className="border-border bg-card">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <FormElement label="Departure Airport">
                  <AirportCombobox
                    airports={allAirportsFlat}
                    value={formState.departureAirport}
                    onChange={(value) => handleFormChange('departureAirport', value)}
                    placeholder="Select departure..."
                  />
                </FormElement>
                <FormElement label="Departure Date">
                    <Popover open={isDepartureCalendarOpen} onOpenChange={setIsDepartureCalendarOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal bg-background">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formState.departureDate ? format(departureDateAsDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={departureDateAsDate} onSelect={handleDateChange} initialFocus disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} />
                        </PopoverContent>
                    </Popover>
                </FormElement>
                 <FormElement label="Airline">
                    <Select value={formState.selectedAirline} onValueChange={(v) => handleFormChange('selectedAirline', v)}>
                        <SelectTrigger><SelectValue placeholder="Select airline" /></SelectTrigger>
                        <SelectContent>{allAirlines.map(a => <SelectItem key={a.code} value={a.code}>{a.code} - {a.name}</SelectItem>)}</SelectContent>
                    </Select>
                </FormElement>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                 <FormElement label="Destination Airport">
                    <AirportCombobox
                      airports={allAirportsFlat}
                      value={formState.destinationAirport}
                      onChange={(value) => handleFormChange('destinationAirport', value)}
                      placeholder="Select destination..."
                    />
                 </FormElement>
                <FormElement label="Departure Time">
                    <div className="flex space-x-2">
                        <Select value={formState.departureHour} onValueChange={(v) => handleFormChange('departureHour', v)}>
                            <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                            <SelectContent>{hourOptions.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={formState.departureMinute} onValueChange={(v) => handleFormChange('departureMinute', v)}>
                            <SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger>
                            <SelectContent>{minuteOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </FormElement>
                 <FormElement label="Flight Number (Digits)">
                     <Input id="flightNumberDigits" type="text" placeholder="e.g., 123" value={formState.flightNumberDigits} onChange={(e) => handleFormChange('flightNumberDigits', e.target.value.replace(/\D/g, "").slice(0, 5))} />
                     {formState.selectedAirline && formState.flightNumberDigits && <p className="text-xs text-muted-foreground mt-1">Full: <Badge variant="secondary">{formState.selectedAirline.toUpperCase()}{formState.flightNumberDigits}</Badge></p>}
                 </FormElement>
                 <FormElement label="Cabin Class">
                    <Select value={formState.selectedCabin} onValueChange={(v) => handleFormChange('selectedCabin', v)}>
                        <SelectTrigger><SelectValue placeholder="Select cabin" /></SelectTrigger>
                        <SelectContent>{cabinClasses.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                 </FormElement>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center flex-wrap gap-4">
                <Button variant="outline" onClick={handleResetAll} className="text-muted-foreground border-muted hover:text-destructive">
                    <RefreshCcw className="mr-2 h-4 w-4" /> Reset Form
                </Button>
                <Button onClick={handleGenerateFlight} disabled={isLoading}>
                    {isLoading ? "Generating Preview..." : "Preview Ticket"}
                </Button>
            </div>
            {error && <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">{error}</div>}
          </CardContent>
        </Card>

        {flightData && (
          <Card ref={ticketPreviewRef} className="border-border bg-card">
            <CardContent className="p-4 md:p-6">
               <div className="mb-4 flex justify-between items-center">
                   <div className="flex items-center">
                       {flightData.airline.logo && <img src={flightData.airline.logo} alt={`${flightData.airline.name} logo`} className="w-10 h-10 rounded-full mr-3 object-contain"/>}
                       {!flightData.airline.logo && <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full mr-3"><Plane className="h-5 w-5 text-primary"/></div>}
                       <div><h3 className="text-lg font-bold">{flightData.flightNumber}</h3><p className="text-sm text-muted-foreground">{flightData.airline.name}</p></div>
                   </div>
                   <Badge variant="outline">{cabinClasses.find(c => c.value === flightData.cabin)?.label}</Badge>
               </div>
               <Separator className="my-4"/>
               <div className="flex justify-between items-center mb-4">
                  <div className="text-center"><div className="text-3xl font-bold">{flightData.departureTimeLocal}</div><div className="text-sm">{flightData.departureAirport}</div><div className="text-xs text-muted-foreground">{flightData.departureAirportName}</div></div>
                  <div className="flex-1 text-center px-4"><div className="text-xs text-muted-foreground mb-1">{flightData.durationFormatted}</div><div className="relative w-full"><div className="h-0.5 bg-primary w-full"></div><Plane className="absolute -top-2 right-0 h-4 w-4 text-primary rotate-90"/></div><div className="text-xs text-muted-foreground mt-1">{formatDistance(flightData.distanceKm)}</div></div>
                  <div className="text-center"><div className="text-3xl font-bold">{flightData.arrivalTimeLocal}</div><div className="text-sm">{flightData.arrivalAirport}</div><div className="text-xs text-muted-foreground">{flightData.arrivalAirportName}</div></div>
               </div>
               <div className="mt-6 flex justify-end">
                  <Button onClick={handleContinue}><ArrowRight className="mr-2 h-4 w-4"/> Continue to Passenger Details</Button>
               </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const FormElement = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div><Label className="block text-foreground font-medium mb-1.5 text-sm">{label}</Label>{children}</div>
);

export default SelectFlightPage;