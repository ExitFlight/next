export const flightImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1559769775-9d9d4f5cfc7d?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?ixlib=rb-4.0.3",
];

export function directFlightExists(
  origin: string,
  destination: string,
): boolean {
  if (origin === destination) {
    return false;
  }

  return true;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function calculateBoardingTime(departureTime: string): string {
  const [hours, minutes] = departureTime.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes);
  date.setMinutes(date.getMinutes() - 30);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function generateBookingReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateSeatNumber(preference?: string): string {
  const row = Math.floor(Math.random() * 30) + 1;
  let seat: string;

  if (preference === "window") {
    seat = Math.random() > 0.5 ? "A" : "F";
  } else if (preference === "aisle") {
    seat = Math.random() > 0.5 ? "C" : "D";
  } else if (preference === "middle") {
    seat = Math.random() > 0.5 ? "B" : "E";
  } else {
    seat = String.fromCharCode(65 + Math.floor(Math.random() * 6));
  }

  return `${row}${seat}`;
}
