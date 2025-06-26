// app/ticket-preview/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plane, Download, Plus } from "lucide-react";

// Component Imports
import { Button } from "@/app/_components/forms/Button";
import { Card, CardContent } from "@/app/_components/Card";
import ProgressStepper from "@/app/_components/ProgressStepper";
import AirlineLogo from "@/app/_components/AirlineLogo";

// Context and Types/Utils
import { useFlightContext } from "@/app/context/FlightContext";
import { GeneratedTicket } from "@/src/types/schema";

// --- Helper functions for generating mock data ---
const generateRandomString = (length: number, chars: string): string => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
const generateBookingReference = (): string =>
  generateRandomString(6, "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
const generateGate = (): string =>
  `${generateRandomString(1, "ABCDE")}${Math.floor(Math.random() * 30) + 1}`;
const generateSeatNumber = (): string =>
  `${Math.floor(Math.random() * 45) + 1}${generateRandomString(1, "ABCDEF")}`;
const calculateBoardingTime = (departureTime: string): string => {
  if (!departureTime || !departureTime.includes(":")) return "N/A";
  const [hours, minutes] = departureTime.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return "N/A";
  const departureDateObj = new Date();
  departureDateObj.setHours(hours, minutes, 0, 0);
  departureDateObj.setMinutes(departureDateObj.getMinutes() - 40);
  return departureDateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// --- The Final Ticket Preview Component ---
const TicketPreviewPage = () => {
  const router = useRouter();
  const {
    selectedFlight,
    passengerDetails,
    generatedTicket,
    setGeneratedTicket,
    resetFlightContext,
  } = useFlightContext();

  // We use the presence of 'generatedTicket' as our primary loading state.

  useEffect(() => {
    if (!selectedFlight || !passengerDetails) {
      router.replace("/");
      return;
    }

    if (!generatedTicket) {
      console.log("Generating new ticket details...");
      const newTicket: GeneratedTicket = {
        flight: selectedFlight,
        passenger: passengerDetails,
        bookingReference: generateBookingReference(),
        gate: generateGate(),
        seatNumber: generateSeatNumber(),
        boardingTime: calculateBoardingTime(selectedFlight.departure.time),
      };
      setGeneratedTicket(newTicket);
    }
  }, [
    selectedFlight,
    passengerDetails,
    generatedTicket,
    setGeneratedTicket,
    router,
  ]);

  const handleCreateAnother = () => {
    resetFlightContext();
    router.push("/select-flight");
  };

  const handleDownload = () => {
    alert(
      "PDF download functionality is a future feature! For now, please use your browser's Print to PDF option.",
    );
    console.log("Downloading ticket:", generatedTicket);
  };

  // --- Render Logic ---

  // PRIMARY FIX: Do not attempt to render anything until `generatedTicket` is populated.
  if (!generatedTicket) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <ProgressStepper currentStep={3} />
        <div className="max-w-3xl mx-auto text-center py-8 md:py-12">
          <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-foreground">
            Finalizing your ticket...
          </h3>
        </div>
      </div>
    );
  }

  // If we reach here, `generatedTicket` is guaranteed to exist.
  const {
    flight,
    passenger,
    seatNumber,
    gate,
    boardingTime,
    bookingReference,
  } = generatedTicket;

  // Perform the date formatting safely, now that we know `flight.departure.date` is valid.
  const formattedDepartureDate = new Date(
    flight.departure.date + "T00:00:00",
  ).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={3} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">
          Your Generated Ticket
        </h2>

        <div className="mb-6 md:mb-8 rotate-ticket">
          <Card className="border-border bg-card boarding-pass shadow-2xl">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 pb-6 sm:pb-0 sm:pr-6">
                  {/* ... Rest of the ticket JSX ... */}
                  <div className="flex justify-between items-start mb-4">
                    <AirlineLogo
                      airlineLogo={flight.airline.logo || ""}
                      airlineName={flight.airline.name}
                      size={40}
                    />
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Boarding Pass
                      </p>
                      <p className="font-medium text-base md:text-lg text-primary">
                        {flight.class.replace("_", " ").toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg md:text-xl text-foreground">
                      {passenger.firstName} {passenger.lastName}
                    </h3>
                    <p className="text-muted-foreground text-xs md:text-sm">
                      Passenger
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-muted-foreground text-xs">From</p>
                      <p className="font-semibold text-foreground">
                        {flight.departure.airport.city}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {flight.departure.airport.code}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">To</p>
                      <p className="font-semibold text-foreground">
                        {flight.arrival.airport.city}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {flight.arrival.airport.code}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Flight</p>
                      <p className="font-medium text-foreground">
                        {flight.flightNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Date</p>
                      <p className="font-semibold text-foreground">
                        {formattedDepartureDate}
                      </p>
                    </div>{" "}
                    {/* Use the safe variable */}
                    <div>
                      <p className="text-muted-foreground text-xs">Boarding</p>
                      <p className="font-semibold text-foreground">
                        {boardingTime}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 pt-6 sm:pt-0 sm:pl-6 border-t sm:border-t-0 border-dashed border-border sm:border-l">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-muted-foreground text-xs">Flight</p>
                      <p className="font-medium text-foreground">
                        {flight.flightNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">Gate</p>
                      <p className="font-semibold text-foreground">{gate}</p>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <div className="text-center">
                        <p className="font-semibold text-xl text-foreground">
                          {flight.departure.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {flight.departure.airport.code}
                        </p>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="flex items-center">
                          <div className="h-0.5 flex-1 bg-muted relative">
                            <Plane
                              className="text-primary absolute -top-1.5 right-1/2 transform translate-x-1/2"
                              size={14}
                            />
                          </div>
                        </div>
                        <div className="text-center text-muted-foreground text-xs mt-1">
                          {flight.duration}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-xl text-foreground">
                          {flight.arrival.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {flight.arrival.airport.code}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Seat</p>
                      <p className="font-semibold text-lg text-foreground">
                        {seatNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Class</p>
                      <p className="font-semibold text-lg text-foreground">
                        {flight.class.charAt(0).toUpperCase() +
                          flight.class.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-center mt-4">
                    <div className="h-12 w-full bg-muted-foreground/10 flex items-center justify-center font-mono text-xs text-muted-foreground">
                      {bookingReference}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button onClick={handleDownload} size="lg">
            <Download className="mr-2" size={16} /> Download Ticket
          </Button>
          <Button onClick={handleCreateAnother} size="lg" variant="outline">
            <Plus className="mr-2" size={16} /> Create Another Ticket
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewPage;
