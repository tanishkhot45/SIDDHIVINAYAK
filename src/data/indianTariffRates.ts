// src/data/indianTariffRates.ts

export interface IndianTariffRate {
    region: string;
    latitude: number;
    longitude: number;
    averageTariffRate: number; // in ₹ per kWh
  }
  
  export const indianTariffRates: IndianTariffRate[] = [
    {
      region: "Andhra Pradesh",
      latitude: 15.9129,
      longitude: 79.74,
      averageTariffRate: 5.97,
    },
    {
      region: "Maharashtra",
      latitude: 19.7515,
      longitude: 75.7139,
      averageTariffRate: 7.76,
    },
    {
      region: "Tamil Nadu",
      latitude: 11.1271,
      longitude: 78.6569,
      averageTariffRate: 6.5,
    },
    {
      region: "West Bengal",
      latitude: 22.9868,
      longitude: 87.855,
      averageTariffRate: 6.89,
    },
    {
      region: "Delhi",
      latitude: 28.7041,
      longitude: 77.1025,
      averageTariffRate: 5.8,
    },
    {
      region: "Gujarat",
      latitude: 22.2587,
      longitude: 71.1924,
      averageTariffRate: 6.1,
    },
    {
      region: "Karnataka",
      latitude: 15.3173,
      longitude: 75.7139,
      averageTariffRate: 7.2,
    },
    {
      region: "Kerala",
      latitude: 10.8505,
      longitude: 76.2711,
      averageTariffRate: 6.5,
    },
    {
      region: "Punjab",
      latitude: 31.1471,
      longitude: 75.3412,
      averageTariffRate: 6.75,
    },
    {
      region: "Rajasthan",
      latitude: 27.0238,
      longitude: 74.2179,
      averageTariffRate: 7.1,
    },
  ];
  