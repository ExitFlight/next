// app/_components/BoardingPass.tsx
"use client";

import { Plane } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/app/_components/Card";
import { type GeneratedTicket } from "@/src/types/schema";

interface BoardingPassProps {
  ticket: GeneratedTicket;
}

export const BoardingPass = ({ ticket }: BoardingPassProps) => {
  const {
    flight,
    passenger,
    seatNumber,
    gate,
    boardingTime,
    bookingReference,
    template,
  } = ticket;

  const branding = template.branding;

  const formattedDepartureDate = new Date(
    flight.departure.date + "T00:00:00",
  ).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    // Use CSS variables for dynamic, data-driven styling
    <div
      style={
        {
          "--primary-color": branding.primaryColor,
          "--secondary-color": branding.secondaryColor,
          "--text-on-primary": branding.textColorOnPrimary,
          "--text-on-background": branding.textColorOnBackground,
        } as React.CSSProperties
      }
    >
      <Card className="border-border bg-card boarding-pass shadow-2xl">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row">
            {/* Left side of the ticket */}
            <div className="flex-1 pb-6 sm:pb-0 sm:pr-6">
              <div className="flex justify-between items-start mb-4">
                {/* Airline Logo */}
                <div className="w-12 h-12 flex items-center justify-center rounded-full mr-3 bg-[var(--primary-color)]/10">
                  {template.logoUrl ? (
                    <Image
                      src={template.logoUrl}
                      alt={`${template.airlineName} logo`}
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  ) : (
                    <Plane className="h-6 w-6 text-[var(--primary-color)]" />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Boarding Pass</p>
                  <p
                    className="font-medium text-base md:text-lg"
                    style={{ color: "var(--primary-color)" }}
                  >
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
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Boarding</p>
                  <p className="font-semibold text-foreground">
                    {boardingTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side of the ticket (stub) */}
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
                    <div className="flex items-center relative">
                      <div className="h-0.5 flex-1 bg-muted"></div>
                      <div style={{ color: "var(--primary-color)" }}>
                        <Plane
                          className="transform translate-x-1/2"
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
                      flight.class.slice(1).replace("_", " ")}
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
  );
};