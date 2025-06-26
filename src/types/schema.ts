// src/types/schema.ts

import { z } from "zod";

// ====== FORM & CONTEXT TYPES ======

// The data captured from the flight selection form
export type FlightSearchData = {
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string;
  departureTime: string;
  // This will hold all the calculated details like arrival time, duration, etc.
  calculatedFlightData: EnhancedFlightDetails;
};

// The Zod schema for validating the passenger details form
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
// These types represent the "mock" data we generate and pass between pages.

// Represents a generated flight, including all calculated details
export type MockFlight = {
  id: number; // A mock ID
  flightNumber: string;
  airline: {
    id: number;
    code: string;
    name: string;
    logo?: string;
    region?: string;
  };
  departure: {
    airport: {
      code: string;
      name: string;
      city: string;
      country: string;
    };
    time: string; // e.g., "09:00"
    date: string; // e.g., "2024-12-25"
  };
  arrival: {
    airport: {
      code: string;
      name: string;
      city: string;
      country: string;
    };
    time: string; // e.g., "11:30"
    date: string; // e.g., "2024-12-25"
  };
  duration: string; // e.g., "2h 30m"
  class: string; // e.g., "Economy"
};

// Represents a fully generated ticket for the final page
export type GeneratedTicket = {
  flight: MockFlight;
  passenger: PassengerDetailsForm;
  seatNumber: string;
  bookingReference: string;
  gate: string;
  boardingTime: string;
};


// ====== UTILITY TYPES ======
// These are used by the flight calculator utility

export interface EnhancedFlightDetails {
  departureAirport: string;
  departureAirportName: string;
  arrivalAirport: string;
  arrivalAirportName: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  flightNumber: string;
  airline: {
    id: number;
    code: string;
    name: string;
    logo?: string;
    region?: string;
  };
  duration: string;
  cabin: string;
  distanceKm: number;
  calculatedData: {
    timezoneDifference?: string;
    dayChange?: number;
    exitDay?: string;
    durationFormatted?: string;
    departureTimeLocal?: string;
    arrivalTimeLocal?: string;
    departureDateLocal?: string;
    arrivalDateLocal?: string;
    durationMinutes?: number;
    departureUTC?: Date;
    arrivalUTC?: Date;
    distanceKm?: number;
  };
}