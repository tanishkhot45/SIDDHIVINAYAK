import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Zap,
  Lightbulb,
  DollarSign,
  Box,
  Sun,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import "./ConsumptionCalculator.css";

// Firebase Imports
import { auth, db } from "../../firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import {
  indianTariffRates,
  IndianTariffRate,
} from "../../data/indianTariffRates";
import {
  getNearestIndianState,
  isUserInIndia,
  Coordinates,
} from "../../utils/locationUtils";

// Define the schema using Zod
const formSchema = z.object({
  monthlyBill: z
    .string()
    .min(1, "Monthly bill is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Monthly bill must be a valid number"),
  occupants: z
    .string()
    .min(1, "Number of occupants is required")
    .regex(/^\d+$/, "Number of occupants must be a number"),
});

type FormData = z.infer<typeof formSchema>;

interface ConsumptionData {
  monthlyBill: number;
  occupants: number;
  area: number; // in square meters
  consumptionFromBill: number; // in kWh/month
  tariffRate: number; // always store in INR per kWh
  timestamp: any;
}

const ConsumptionCalculator: React.FC = () => {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [area, setArea] = useState<number | null>(null);
  const [tariffRate, setTariffRate] = useState<number | null>(null);
  const [tariffLoading, setTariffLoading] = useState<boolean>(false);
  const [tariffError, setTariffError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [userRegion, setUserRegion] = useState<IndianTariffRate | null>(null);
  const [isIndia, setIsIndia] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [user, userLoadingAuth, userErrorAuth] = useAuthState(auth);
  const userId = user ? user.uid : null;

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyBill: "",
      occupants: "",
    },
  });

  const PER_PERSON_CONSUMPTION = 150; // kWh/month per person

  const fetchArea = useCallback(async () => {
    if (userId) {
      try {
        const calculationsRef = collection(db, "users", userId, "calculations");
        const q = query(calculationsRef, orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestCalculation = querySnapshot.docs[0].data();
          if (latestCalculation.area) {
            setArea(Number(latestCalculation.area));
          } else {
            setArea(0);
          }
        } else {
          console.warn("No calculations found for the user.");
          setArea(0);
        }
      } catch (error) {
        console.error("Error fetching area:", error);
        setArea(0);
      }
    }
  }, [userId]);

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number): Promise<string | null> => {
      try {
        const geocodeResponse = await axios.get(
          `https://nominatim.openstreetmap.org/reverse`,
          {
            params: {
              format: "jsonv2",
              lat: latitude,
              lon: longitude,
            },
            headers: {
              "Accept-Language": "en",
              "User-Agent": "YourAppName/1.0",
            },
          }
        );

        const address = geocodeResponse.data.address;
        const countryCode = address?.country_code?.toUpperCase();

        if (!countryCode) {
          throw new Error("Unable to determine country code from coordinates.");
        }

        return countryCode;
      } catch (error) {
        console.error("Error in reverse geocoding:", error);
        return null;
      }
    },
    []
  );

  const fetchElectricityTariff = useCallback(
    async (countryCode: string, coords: Coordinates | null) => {
      setTariffLoading(true);
      setTariffError(null);
      try {
        // Ensure exchangeRate is fetched
        if (exchangeRate === null) {
          throw new Error("Exchange rate not available yet.");
        }

        if (isUserInIndia(countryCode) && coords) {
          // User is in India
          const nearestState = getNearestIndianState(coords);
          if (!nearestState) {
            throw new Error("Unable to determine the nearest Indian state.");
          }
          setUserRegion(nearestState);
          setIsIndia(true);
          // Tariff is already in INR
          setTariffRate(Number(nearestState.averageTariffRate)); 
        } else {
          // User is outside India, fetch in USD and convert to INR
          setIsIndia(false);
          const nrelApiKey = process.env.REACT_APP_NREL_API_KEY || '';
          if (!nrelApiKey) {
            throw new Error("NREL API key is not set.");
          }

          const tariffResponse = await axios.get(
            `https://developer.nrel.gov/api/utility_rates/v3.json`,
            {
              params: {
                api_key: nrelApiKey,
                lat: coords?.latitude,
                lon: coords?.longitude,
                format: "json",
              },
            }
          );

          console.log("NREL Electricity Tariff Data:", tariffResponse.data);

          const outputs = tariffResponse.data.outputs;
          if (!outputs) {
            throw new Error("No outputs found in the tariff API response.");
          }

          const residentialRate = outputs.residential;
          if (residentialRate === undefined || residentialRate === null) {
            throw new Error(
              "Residential tariff rate is missing in the API response."
            );
          }

          // residentialRate is in USD/kWh, convert to INR/kWh
          // exchangeRate = rates.USD means: 1 INR = exchangeRate USD
          // To get INR from USD: INR = USD / rates.USD
          const tariffRateInINR = Number(residentialRate) / (exchangeRate || 1);
          setTariffRate(tariffRateInINR);
        }
      } catch (error: any) {
        console.error("Error fetching electricity tariff rate:", error);
        setTariffError(error.message || "Failed to fetch electricity tariff rate.");
        setTariffRate(null);
      } finally {
        setTariffLoading(false);
      }
    },
    [exchangeRate]
  );

  const fetchLatestLocation = useCallback(async () => {
    if (userId) {
      try {
        const locationsRef = collection(db, "users", userId, "locations");
        const q = query(locationsRef, orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestLocation = querySnapshot.docs[0].data();
          const latitude = latestLocation.latitude;
          const longitude = latestLocation.longitude;
          if (latitude && longitude) {
            const coords: Coordinates = { latitude, longitude };
            setUserCoords(coords);

            // Reverse Geocode to get country code
            const countryCode = await reverseGeocode(latitude, longitude);
            if (!countryCode) {
              throw new Error("Failed to obtain country code from coordinates.");
            }

            // Fetch tariff rate based on country code and coordinates
            await fetchElectricityTariff(countryCode, coords);

            return coords;
          } else {
            console.warn("Latitude or Longitude is missing in the latest location.");
            return null;
          }
        } else {
          console.warn("No locations found for the user.");
          return null;
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        return null;
      }
    }
    return null;
  }, [userId, reverseGeocode, fetchElectricityTariff]);

  const fetchExchangeRate = useCallback(async () => {
    try {
      // Base is INR, so rates.USD tells how many USD equals 1 INR
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/INR`
      );
      setExchangeRate(response.data.rates.USD);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  }, []);

  const watchedMonthlyBill = watch("monthlyBill");
  const watchedOccupants = watch("occupants");

  // consumptionFromBill = monthlyBill (in INR) / tariffRate (in INR/kWh)
  const consumptionFromBill = useMemo(() => {
    if (tariffRate === null) return 0;
    const bill = Number(watchedMonthlyBill);
    if (isNaN(bill) || bill <= 0) return 0;
    return parseFloat((bill / tariffRate).toFixed(2));
  }, [watchedMonthlyBill, tariffRate]);

  useEffect(() => {
    // First fetch exchange rate
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  useEffect(() => {
    if (userId && exchangeRate !== null) {
      fetchArea();
      fetchLatestLocation();
    }
  }, [fetchArea, fetchLatestLocation, userId, exchangeRate]);

  const onSubmit = async (data: FormData) => {
    if (area === null || tariffRate === null) {
      setSubmissionError("Area or electricity tariff rate is not available.");
      return;
    }

    if (!userId) {
      setSubmissionError("User is not authenticated.");
      console.error("Error: User is not authenticated.");
      return;
    }

    setLoading(true);
    setSubmissionError(null);
    setSuccess(false);
    try {
      const consumptionData: ConsumptionData = {
        monthlyBill: Number(data.monthlyBill),
        occupants: Number(data.occupants),
        area: area,
        consumptionFromBill: consumptionFromBill,
        tariffRate: tariffRate, // already in INR/kWh
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, "users", userId, "consumptionData"), consumptionData);

      setSuccess(true);
      reset();

      // Navigate to the report page after successful submission
      navigate("/report");

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Error saving consumption data:", error);
      setSubmissionError("Failed to save data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (userLoadingAuth) {
    return <div>Loading...</div>;
  }

  if (userErrorAuth) {
    return <div>Error: {userErrorAuth.message}</div>;
  }

  return (
    <div className="consumption-calculator min-h-screen bg-gradient">
      <div className="container">
        <div className="card">
          <header className="card-header">
            <div className="header-content">
              <Sun className="icon" />
              <h1 className="card-title">Solar Energy Consumption Calculator</h1>
            </div>
            <p className="card-description">
              Estimate your electricity consumption
            </p>
          </header>
          <main className="card-content">
            <form onSubmit={handleSubmit(onSubmit)} className="form">
              <div className="form-grid">
                {/* Monthly Bill */}
                <div className="form-group">
                  <label htmlFor="monthlyBill">
                    Monthly Electricity Bill (₹)
                  </label>
                  <input
                    id="monthlyBill"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter your monthly bill in INR"
                    {...register("monthlyBill")}
                    className={`input ${errors.monthlyBill ? "input-error" : ""}`}
                  />
                  {errors.monthlyBill && (
                    <p className="error-message">
                      {errors.monthlyBill.message}
                    </p>
                  )}
                </div>

                {/* Number of Occupants */}
                <div className="form-group">
                  <label htmlFor="occupants">Number of People</label>
                  <input
                    id="occupants"
                    type="number"
                    min="1"
                    placeholder="Enter number of occupants"
                    {...register("occupants")}
                    className={`input ${errors.occupants ? "input-error" : ""}`}
                  />
                  {errors.occupants && (
                    <p className="error-message">
                      {errors.occupants.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Info Cards */}
              <div className="info-cards">
                {/* Electricity Tariff Rate */}
                <InfoCard
                  title="Electricity Tariff Rate"
                  value={
                    tariffRate !== null
                      ? `₹${tariffRate.toFixed(2)}/kWh`
                      : tariffLoading
                      ? "Fetching..."
                      : tariffError
                      ? "Error"
                      : "Not Available"
                  }
                  description="Current electricity tariff rate (in INR)"
                  IconComponent={DollarSign}
                />

                {/* Consumption from Bill */}
                <InfoCard
                  title="Consumption from Bill"
                  value={`${consumptionFromBill} kWh/month`}
                  description="Derived from your monthly bill"
                  IconComponent={Lightbulb}
                />

                {/* Area */}
                <InfoCard
                  title="Area"
                  value={
                    area !== null
                      ? `${area.toFixed(2)} m²`
                      : "Fetching area..."
                  }
                  description="Available area for solar panels"
                  IconComponent={Box}
                />
              </div>

              {/* Tariff Loading/Error */}
              {tariffLoading && <p>Loading electricity tariff rate...</p>}
              {tariffError && <p className="error-message">{tariffError}</p>}

              {/* Submission Error */}
              {submissionError && (
                <p className="submission-error">{submissionError}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`submit-button ${success ? "button-success" : ""}`}
                disabled={loading || tariffLoading || area === null}
              >
                {loading ? (
                  "Saving..."
                ) : success ? (
                  "Saved!"
                ) : (
                  <>
                    <Zap className="button-icon" /> Save Consumption Data
                  </>
                )}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  value: string;
  description: string;
  IconComponent: React.ElementType;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  value,
  description,
  IconComponent,
}) => {
  return (
    <div className="info-card">
      <div className="info-card-header">
        <h3 className="info-card-title">{title}</h3>
        <IconComponent className="info-card-icon" />
      </div>
      <div className="info-card-content">
        <div className="info-value">{value}</div>
        <p className="info-description">{description}</p>
      </div>
    </div>
  );
};

export default ConsumptionCalculator;
