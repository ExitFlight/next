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

const airlineSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export type Airline = z.infer<typeof airlineSchema>;

export const mockFlightSchema = z.object({
  flightNumber: z.string(),
  airline: airlineSchema,
  departure: z.object({
    airport: z.object({
      code: z.string(),
      name: z.string(),
      city: z.string(),
      country: z.string(),
    }),
    time: z.string(),
    date: z.string(),
  }),
  arrival: z.object({
    airport: z.object({
      code: z.string(),
      name: z.string(),
      city: z.string(),
      country: z.string(),
    }),
    time: z.string(),
    date: z.string(),
  }),
  duration: z.string(),
  class: z.string(),
});

export type MockFlight = z.infer<typeof mockFlightSchema>;

export const airlineTemplateSchema = z.object({
  airlineCode: z.string(),
  airlineName: z.string(),
  logoUrl: z.string(),
  branding: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    textColorOnPrimary: z.string(),
    textColorOnBackground: z.string(),
  }),
  data: z.object({
    frequentFlyerProgramName: z.string(),
  }),
});

export type AirlineTemplate = z.infer<typeof airlineTemplateSchema>;

export type GeneratedTicket = {
  flight: MockFlight;
  passenger: PassengerDetailsForm;
  seatNumber: string;
  bookingReference: string;
  gate: string;
  boardingTime: string;
  template: AirlineTemplate;
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

export const FLIGHT_STORAGE_KEY = "exitFlightFormState";

export const PASSENGER_STORAGE_KEY = "exitFlightPassengerDetails";
