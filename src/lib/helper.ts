export function formatDistance(distanceKm: number): string {
  return `${distanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`;
}
