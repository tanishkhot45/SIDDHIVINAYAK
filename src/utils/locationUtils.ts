// src/utils/locationUtils.ts

import { indianTariffRates, IndianTariffRate } from "../data/indianTariffRates";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Haversine formula to calculate the distance between two points on the Earth
export const getDistanceFromLatLonInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// Function to determine if the user is in India
export const isUserInIndia = (countryCode: string): boolean => {
  return countryCode === "IN";
};

// Function to determine the nearest Indian state based on coordinates
export const getNearestIndianState = (
  userCoords: Coordinates
): IndianTariffRate | null => {
  let nearestState: IndianTariffRate | null = null;
  let minDistance = Infinity;

  indianTariffRates.forEach((state) => {
    const distance = getDistanceFromLatLonInKm(
      userCoords.latitude,
      userCoords.longitude,
      state.latitude,
      state.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestState = state;
    }
  });

  return nearestState;
};
