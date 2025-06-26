// src/types/schema.ts

import { z } from "zod";

// ====== FORM & CONTEXT TYPES ======
export type FlightSearchData = {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  calculatedFlightData: EnhancedFlightDetails;
};

export const passengerDetailsSchema = z.object({
  title: z.string().optional(),
  firstName: z.string().min(1, { message: "First name is required." }),
  middleName: z.string().optional(),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().optional(),
  nationality: z.string().min(1, { message: "Nationality is required." }),
});

export type PassengerDetailsForm = z.infer<typeof passengerDetailsSchema>;

// ====== MOCK FLIGHT DATA STRUCTURES ======
export type MockFlight = {
  id: number;
  flightNumber: string;
  airline: {
    id: number;
    code: string;
    name: string;
    logo?: string;
    region?: string;
  };
  departure: {
    airport: { code: string; name: string; city: string; country: string };
    time: string;
    date: string;
  };
  arrival: {
    airport: { code: string; name: string; city: string; country: string };
    time: string;
    date: string;
  };
  duration: string;
  class: string;
};

export type GeneratedTicket = {
  flight: MockFlight;
  passenger: PassengerDetailsForm;
  seatNumber: string;
  bookingReference: string;
  gate: string;
  boardingTime: string;
};

// ====== UTILITY TYPES ======

// THIS IS THE FIX: The updated interface now includes all calculated properties.
export interface EnhancedFlightDetails {
  // Input properties
  departureAirport: string;
  departureAirportName: string;
  arrivalAirport: string;
  arrivalAirportName: string;
  departureTime: string;
  flightNumber: string;
  cabin: string;

  // Calculated properties that were missing from the old type
  durationFormatted: string;
  departureTimeLocal: string;
  arrivalTimeLocal: string;
  departureDateLocal: string;
  arrivalDateLocal: string;
  durationMinutes: number;
  departureUTC: Date;
  arrivalUTC: Date;
  distanceKm: number;
  timezoneDifference: string;
  dayChange: number;
  exitDay: string;

  // This one is needed from the original `flightData` object but wasn't in the calculator return type
  departureDate: string;

  // Airline info is also part of the final object
  airline: {
    id: number;
    code: string;
    name: string;
    logo?: string;
    region?: string;
  };
}
