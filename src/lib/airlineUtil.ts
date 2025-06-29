import airlinesData from "@/src/data/airlines.json";
import { Airline } from "@/src/types/schema";

export const allAirlines: Airline[] = [...airlinesData].sort((a, b) =>
  a.name.localeCompare(b.name),
);
