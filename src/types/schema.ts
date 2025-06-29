// src/types/schema.ts

import { z } from "zod";

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

export type MockFlight = {
  flightNumber: string;
  airline: Airline;
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

export interface EnhancedFlightDetails {
  departureAirport: string;
  departureAirportName: string;
  arrivalAirport: string;
  arrivalAirportName: string;
  departureTime: string;
  flightNumber: string;
  cabin: string;

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
  departureDate: string;

  airline: Airline;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  region: string;
}

export interface Airline {
  code: string;
  name: string;
  logo?: string;
  region?: string;
}
