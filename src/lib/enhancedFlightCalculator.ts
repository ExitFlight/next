import { format, addMinutes, differenceInDays, parse } from "date-fns";
import {
  toZonedTime,
  formatInTimeZone,
  getTimezoneOffset as getIANATimezoneOffset,
} from "date-fns-tz";

// --- NEW DATA IMPORTS ---
import airports from "@/src/data/airports.json";
import type { Airport } from "@/src/types/schema"; // Using the shared type

// --- NEW: Create a Map for fast O(1) lookups ---
// This is much more performant than using array.find() repeatedly.
const airportDataMap: Map<string, Airport> = new Map(
  airports.map((airport) => [airport.code, airport as Airport]),
);

// --- DELETE THESE CONSTANTS ---
// const airportCoordinates: { ... } = { ... };
// const airportTimezones: { ... } = { ... };

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function calculateRealisticFlightTimes(
  originCode: string,
  destCode: string,
  departureDateStrInput: string = new Date().toISOString().split("T")[0],
  departureTimeStrInput: string = "09:00",
): Promise<{
  durationMinutes: number;
  departureUTC: Date;
  arrivalUTC: Date;
  departureLocal: Date;
  arrivalLocal: Date;
  distanceKm: number;
}> {
  // --- UPDATED: Use the Map to get all airport data at once ---
  const originData = airportDataMap.get(originCode);
  const destData = airportDataMap.get(destCode);

  if (!originData)
    throw new Error(`Missing data for origin airport: ${originCode}`);
  if (!destData)
    throw new Error(`Missing data for destination airport: ${destCode}`);

  const distanceKm = getDistanceFromLatLonInKm(
    originData.lat,
    originData.lon,
    destData.lat,
    destData.lon,
  );

  const cruiseSpeedKmh = 875;
  const baseFlightTimeHours = distanceKm / cruiseSpeedKmh;
  const bufferMinutes = 36 + baseFlightTimeHours * 60 * 0.08;
  const durationMinutes = Math.round(baseFlightTimeHours * 60 + bufferMinutes);

  // --- UPDATED: Get timezones from our consolidated data source ---
  const originTimezone = originData.timezone || "UTC";
  const destTimezone = destData.timezone || "UTC";

  // The rest of this complex time calculation logic remains the same
  const departureDateToUse =
    departureDateStrInput || new Date().toISOString().split("T")[0];

  let departureUTC: Date;
  let departureLocalForReturn: Date;

  try {
    const departureLocalWallTimeString = `${departureDateToUse}T${departureTimeStrInput}:00`;
    const naiveParsedDate = parse(
      departureLocalWallTimeString,
      "yyyy-MM-dd'T'HH:mm:ss",
      new Date(),
    );

    if (isNaN(naiveParsedDate.getTime())) {
      throw new Error(
        `Could not parse input date/time for UTC conversion: "${departureLocalWallTimeString}"`,
      );
    }

    const originOffsetMilliseconds = getIANATimezoneOffset(
      originTimezone,
      naiveParsedDate,
    );

    const utcMsFromNaiveComponents = Date.UTC(
      naiveParsedDate.getFullYear(),
      naiveParsedDate.getMonth(),
      naiveParsedDate.getDate(),
      naiveParsedDate.getHours(),
      naiveParsedDate.getMinutes(),
      naiveParsedDate.getSeconds(),
      naiveParsedDate.getMilliseconds(),
    );
    departureUTC = new Date(
      utcMsFromNaiveComponents - originOffsetMilliseconds,
    );

    departureLocalForReturn = toZonedTime(departureUTC, originTimezone);

    if (isNaN(departureLocalForReturn.getTime())) {
      throw new Error(
        "toZonedTime for departureLocalForReturn resulted in Invalid Date.",
      );
    }
  } catch (e) {
    console.error(
      "Error processing departure time:",
      e,
      "\nInput date string:",
      departureDateToUse,
      "\nInput time string:",
      departureTimeStrInput,
      "\nOrigin timezone:",
      originTimezone,
    );
    throw new Error(
      `Failed to process departure time "${departureDateToUse} ${departureTimeStrInput}" in timezone "${originTimezone}". Original error: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  const arrivalUTC = addMinutes(departureUTC, durationMinutes);

  if (isNaN(arrivalUTC.getTime())) {
    throw new Error("Calculation of arrivalUTC resulted in Invalid Date.");
  }

  let arrivalLocalForReturn: Date;
  try {
    arrivalLocalForReturn = toZonedTime(arrivalUTC, destTimezone);
    if (isNaN(arrivalLocalForReturn.getTime())) {
      throw new Error("toZonedTime for arrival resulted in Invalid Date.");
    }
  } catch (e) {
    console.error("Error in toZonedTime for arrival:", e);
    throw new Error(
      `Failed to convert arrival time to local using timezone: ${destTimezone}. Original error: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  return {
    durationMinutes,
    departureUTC,
    arrivalUTC,
    departureLocal: departureLocalForReturn,
    arrivalLocal: arrivalLocalForReturn,
    distanceKm,
  };
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
}

export function calculateTimezoneDifference(
  timezone1: string,
  timezone2: string,
): number {
  const referenceDate = new Date();

  const getOffsetInHours = (tz: string): number => {
    try {
      const offsetStringWithColon = formatInTimeZone(referenceDate, tz, "xxx");
      const sign = offsetStringWithColon[0] === "-" ? -1 : 1;
      const parts = offsetStringWithColon.substring(1).split(":");
      const hours = parseInt(parts[0], 10);
      const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
      if (isNaN(hours) || isNaN(minutes)) {
        console.warn(
          `Could not parse offset string: ${offsetStringWithColon} for timezone ${tz}. Falling back to 0 offset.`,
        );
        return 0;
      }
      return sign * (hours + minutes / 60);
    } catch (e) {
      console.warn(
        `Error formatting/parsing offset for timezone ${tz}:`,
        e,
        `Falling back to 0 offset.`,
      );
      return 0;
    }
  };

  const offset1Hours = getOffsetInHours(timezone1);
  const offset2Hours = getOffsetInHours(timezone2);

  return offset2Hours - offset1Hours;
}

export function formatTimezoneDifference(hoursDiff: number): string {
  const sign = hoursDiff >= 0 ? "+" : "-";
  const absDiff = Math.abs(hoursDiff);
  const hours = Math.floor(absDiff);
  const minutes = Math.round((absDiff - hours) * 60);

  if (minutes === 0) {
    return `${sign}${hours}h`;
  } else {
    return `${sign}${hours}h ${minutes}m`;
  }
}

export async function calculateEnhancedFlightDetails(
  originCode: string,
  destCode: string,
  departureDateStr?: string,
  departureTimeStr?: string,
): Promise<{
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
}> {
  const {
    durationMinutes,
    departureUTC,
    arrivalUTC,
    distanceKm,
    departureLocal,
    arrivalLocal,
  } = await calculateRealisticFlightTimes(
    originCode,
    destCode,
    departureDateStr,
    departureTimeStr,
  );

  // --- UPDATED: Get timezones from our consolidated data source via the Map ---
  const originTimezone = airportDataMap.get(originCode)?.timezone || "UTC";
  const destTimezone = airportDataMap.get(destCode)?.timezone || "UTC";

  if (!departureUTC || isNaN(departureUTC.getTime())) {
    throw new Error(
      "[CalcEFD] calculateRealisticFlightTimes returned an invalid departureUTC date.",
    );
  }
  if (!arrivalUTC || isNaN(arrivalUTC.getTime())) {
    throw new Error(
      "[CalcEFD] calculateRealisticFlightTimes returned an invalid arrivalUTC date.",
    );
  }

  const departureTimeLocalStr = formatInTimeZone(
    departureUTC,
    originTimezone,
    "HH:mm",
  );
  const departureDateLocalStr = formatInTimeZone(
    departureUTC,
    originTimezone,
    "yyyy-MM-dd",
  );
  const arrivalTimeLocalStr = formatInTimeZone(
    arrivalUTC,
    destTimezone,
    "HH:mm",
  );
  const arrivalDateLocalStr = formatInTimeZone(
    arrivalUTC,
    destTimezone,
    "yyyy-MM-dd",
  );

  const tzDiffHours = calculateTimezoneDifference(originTimezone, destTimezone);
  const timezoneDifference = formatTimezoneDifference(tzDiffHours);

  const dayChange = differenceInDays(arrivalLocal, departureLocal);
  const exitDay = formatInTimeZone(arrivalUTC, destTimezone, "EEEE");
  const durationFormatted = formatDuration(durationMinutes);

  return {
    durationFormatted,
    departureTimeLocal: departureTimeLocalStr,
    arrivalTimeLocal: arrivalTimeLocalStr,
    departureDateLocal: departureDateLocalStr,
    arrivalDateLocal: arrivalDateLocalStr,
    durationMinutes,
    departureUTC,
    arrivalUTC,
    distanceKm,
    timezoneDifference,
    dayChange,
    exitDay,
  };
}
