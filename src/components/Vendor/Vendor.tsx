/* VendorsPage.tsx */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail } from "lucide-react"; // Removed MapPin import
import { ReactComponent as CustomMapPin } from "./map-pin.svg"; // Ensure correct path
import { ReactComponent as WhatsAppIcon } from "./whatsapp.svg"; // Import WhatsApp SVG
import "./Vendor.css";

// Firebase Imports
import { auth, db } from "../../firebase"; // Adjust the path as needed
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import axios from "axios";

// Define Vendor and Product Interfaces
interface Product {
  name: string;
  price: string;
  description: string;
}

interface Vendor {
  name: string;
  representative: string;
  location: string;
  phone: string;
  gstNo: string;
  products: Product[];
}

// Sample Vendors Data
const vendors: Vendor[] = [
  {
    name: "Victor Solar",
    representative: "Donald Vaz",
    location: "Shop No. 09/11B, Unique Corner Building, Vasai-Virar, MH 401202",
    phone: "9860560575",
    gstNo: "27AFMPV4394P1Z8",
    products: [
      {
        name: "Solar Kit Pro",
        price: "₹20,000",
        description: "Includes advanced solar panels, inverter, and a powerful battery.",
      },
      {
        name: "Solar Inverter 3KW",
        price: "₹50,000",
        description: "High capacity inverter for large-scale usage.",
      },
    ],
  },
  {
    name: "PR Solar",
    representative: "Roshan Gonsalves",
    location: "Chitramwadi, Remedy church, Vasai West, MH 401201",
    phone: "9923047897",
    gstNo: "27AMEPP2040H1Z9",
    products: [
      {
        name: "Solar Water Heater",
        price: "₹25,000",
        description: "Efficient solar water heater for residential use.",
      },
      {
        name: "Emergency Solar Backup",
        price: "₹15,000",
        description: "Backup power system for emergencies.",
      },
    ],
  },
  {
    name: "Morning Solar",
    representative: "Orvile A. D'Souza",
    location: "Panditwadi road, Wakiwadi, Vasai west, MH 401201",
    phone: "9834558662",
    gstNo: "27AMIPD3051A1ZQ",
    products: [
      {
        name: "Morning Solar Starter Kit",
        price: "₹15,000",
        description: "Basic solar power setup for small-scale use.",
      },
      {
        name: "Solar Ventilation Fan",
        price: "₹5,500",
        description: "Solar fan for efficient cooling and ventilation.",
      },
    ],
  },
];

// Utility function for reverse geocoding
const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          format: "jsonv2",
          lat: latitude,
          lon: longitude,
        },
        headers: {
          "Accept-Language": "en",
          "User-Agent": "YourAppName/1.0", // Replace with your app name
        },
      }
    );

    const address = response.data.address;
    const city =
      address?.city ||
      address?.town ||
      address?.village ||
      address?.state ||
      address?.county;
    const country = address?.country;

    if (city && country) {
      return `${city}, ${country}`;
    } else if (country) {
      return country;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
};

const VendorsPage: React.FC = () => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationString, setLocationString] = useState<string | null>(null);
  const [searchUrl, setSearchUrl] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [user, userLoadingAuth, userErrorAuth] = useAuthState(auth);
  const userId = user ? user.uid : null;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestLocation = async () => {
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
              setUserCoords({ latitude, longitude });
              const readableLocation = await reverseGeocode(latitude, longitude);
              if (readableLocation) {
                setLocationString(readableLocation);
                const encodedLocation = encodeURIComponent(
                  `solar vendors near ${readableLocation}`
                );
                // Using Google Maps search with query
                const url = `https://www.google.com/maps/search/?api=1&query=solar+vendors+near+${encodeURIComponent(
                  readableLocation
                )}`;
                setSearchUrl(url);
              } else {
                setLocationError("Unable to determine your location.");
              }
            } else {
              setLocationError("Location data is incomplete.");
            }
          } else {
            setLocationError("No location data found.");
          }
        } catch (error: any) {
          console.error("Error fetching location:", error);
          setLocationError("Failed to fetch location data.");
        } finally {
          setLoadingLocation(false);
        }
      } else {
        setLocationError("User is not authenticated.");
        setLoadingLocation(false);
      }
    };

    fetchLatestLocation();
  }, [userId]);

  return (
    <div className="vendors-page">
      <div className="vendors-container">
        <h1 className="vendors-title">Our Solar Partners</h1>
        <p className="vendors-description">
          Meet our trusted solar partners helping bring sustainable energy to every
          corner of India.
        </p>

        <div className="vendors-grid">
          {vendors.map((vendor, index) => (
            <div key={vendor.name} className="vendor-card">
              <div className="vendor-card-header">
                <div className="vendor-card-info">
                  <h2 className="vendor-name">{vendor.name}</h2>
                  <p className="vendor-rep">Representative: {vendor.representative}</p>
                </div>
              </div>
              <div className="vendor-card-body">
                <div className="vendor-details">
                  <div className="vendor-detail">
                    {/* Custom MapPin SVG */}
                    <CustomMapPin className="detail-icon" />
                    <span className="detail-text">{vendor.location}</span>
                  </div>
                  <div className="vendor-detail">
                    <Phone className="detail-icon" />
                    <a href={`tel:${vendor.phone}`} className="detail-link">
                      {vendor.phone}
                    </a>
                  </div>
                  <div className="vendor-detail">
                    <Mail className="detail-icon" />
                    <span className="detail-text">GST No: {vendor.gstNo}</span>
                  </div>
                </div>
                <div className="vendor-actions">
                  <button
                    className="btn btn-whatsapp"
                    onClick={() =>
                      window.open(
                        `https://api.whatsapp.com/send?phone=91${vendor.phone}`,
                        "_blank"
                      )
                    }
                    aria-label={`Send a WhatsApp message to ${vendor.name}`}
                  >
                    {/* WhatsApp SVG Icon */}
                    <WhatsAppIcon className="whatsapp-icon" />
                    WhatsApp
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setSelectedVendor(vendor)}
                  >
                    View Products
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* "Explore Other Vendors" Button */}
        <div className="explore-button-container">
          {loadingLocation ? (
            <p>Loading your location...</p>
          ) : locationError ? (
            <p className="error-message">{locationError}</p>
          ) : searchUrl ? (
            <button
              className="btn btn-explore"
              onClick={() => window.open(searchUrl, "_blank")}
              aria-label="Explore other solar vendors nearby on Google Maps"
            >
              Explore Other Vendors 
            </button>
          ) : null}
        </div>

        {selectedVendor && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedVendor(null)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2 className="modal-title">{selectedVendor.name} Products</h2>
                <button
                  className="modal-close"
                  onClick={() => setSelectedVendor(null)}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                {selectedVendor.products.map((product, index) => (
                  <div key={index} className="product-item">
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.description}</p>
                      <p className="product-price">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;
