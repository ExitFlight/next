// app/ticket-preview/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plane, Download, Plus, ArrowLeft } from "lucide-react";

import { Button } from "@/app/_components/forms/Button";
import ProgressStepper from "@/app/_components/ProgressStepper";

import { useFlightContext } from "@/app/context/FlightContext";
import { GeneratedTicket } from "@/src/types/schema";
import { downloadTicketAsPDF } from "@/src/lib/pdfGenerator";
import { getAirlineTemplate } from "@/src/lib/airlineTemplate";
import { BoardingPass } from "../_components/BoardingPass";

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

const TicketPreviewPage = () => {
  const router = useRouter();
  const {
    selectedFlight,
    passengerDetails,
    generatedTicket,
    setGeneratedTicket,
    resetFlightContext,
  } = useFlightContext();

  useEffect(() => {

    const generateTicket = async () => {
      if (!selectedFlight || !passengerDetails) {
        router.replace("/");
        return;
      }

      if (!generatedTicket) {

        const template = await getAirlineTemplate(selectedFlight.airline.code);

        const newTicketData: GeneratedTicket = {
          flight: selectedFlight,
          passenger: passengerDetails,
          bookingReference: generateBookingReference(),
          gate: generateGate(),
          seatNumber: generateSeatNumber(),
          boardingTime: calculateBoardingTime(selectedFlight.departure.time),
          template: template,
        };
        setGeneratedTicket(newTicketData);
      }
    };

    generateTicket();
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
    if (!generatedTicket) return;
    const fileName = `ExitFlight-Ticket-${generatedTicket.flight.flightNumber}-${generatedTicket.passenger.lastName}`;
    downloadTicketAsPDF("ticket-to-download", fileName);
  };

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

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <ProgressStepper currentStep={3} />
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-foreground">
          Your Generated Ticket
        </h2>

        <div id="ticket-to-download" className="mb-6 md:mb-8">
          <BoardingPass ticket={generatedTicket} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button onClick={() => router.back()} size="lg" variant="outline">
            <ArrowLeft className="mr-2" size={16} /> Back
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button onClick={handleDownload} size="lg">
              <Download className="mr-2" size={16} /> Download Ticket
            </Button>
            <Button onClick={handleCreateAnother} size="lg" variant="outline">
              <Plus className="mr-2" size={16} /> Create Another Ticket
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPreviewPage;