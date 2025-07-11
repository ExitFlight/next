// app/context/FlightContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  Flight,
  FlightSearchData,
  PassengerDetailsForm,
  FLIGHT_STORAGE_KEY,
  PASSENGER_STORAGE_KEY,
  GeneratedTicket,
} from "@/src/types/schema";

interface FlightContextType {
  flightDetails: FlightSearchData | null;
  selectedFlight: Flight | null;
  passengerDetails: PassengerDetailsForm | null;
  generatedTicket: GeneratedTicket | null;
  setFlightDetails: (details: FlightSearchData | null) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setPassengerDetails: (details: PassengerDetailsForm | null) => void;
  setGeneratedTicket: (ticket: GeneratedTicket | null) => void;
  resetFlightContext: () => void;
}

const FlightContext = createContext<FlightContextType | undefined>(undefined);

export const FlightProvider = ({ children }: { children: ReactNode }) => {
  const [flightDetails, setFlightDetails] = useState<FlightSearchData | null>(
    null,
  );
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [passengerDetails, setPassengerDetails] =
    useState<PassengerDetailsForm | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<any | null>(null);

  const resetFlightContext = () => {
    setFlightDetails(null);
    setSelectedFlight(null);
    setPassengerDetails(null);
    setGeneratedTicket(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(FLIGHT_STORAGE_KEY);
      localStorage.removeItem(PASSENGER_STORAGE_KEY);
    }
  };

  return (
    <FlightContext.Provider
      value={{
        flightDetails,
        selectedFlight,
        passengerDetails,
        generatedTicket,
        setFlightDetails,
        setSelectedFlight,
        setPassengerDetails,
        setGeneratedTicket,
        resetFlightContext,
      }}
    >
      {children}
    </FlightContext.Provider>
  );
};

export const useFlightContext = () => {
  const context = useContext(FlightContext);
  if (context === undefined) {
    throw new Error("useFlightContext must be used within a FlightProvider");
  }
  return context;
};
