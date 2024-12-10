// src/components/Report/Report.tsx

import React, { useRef, useState, useEffect } from "react";
import {
  ArrowRight,
  Download,
  Zap,
  Sun,
  Home,
  Battery,
  Leaf,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./Report.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Firebase imports
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

interface TooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="tooltip-item" style={{ color: entry.fill }}>
            {entry.name}: {entry.value} kWh
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Helper function to determine orientation from azimuth
function getOrientationFromAzimuth(azimuth: number): string {
  if ((azimuth >= 315 && azimuth <= 360) || (azimuth >= 0 && azimuth < 45)) {
    return "North";
  } else if (azimuth >= 45 && azimuth < 135) {
    return "East";
  } else if (azimuth >= 135 && azimuth < 225) {
    return "South";
  } else if (azimuth >= 225 && azimuth < 315) {
    return "West";
  }
  return "Unknown";
}

// MetricCard Component
interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  metrics: Array<{
    label: string;
    value: string;
  }>;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, icon, metrics }) => {
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <h3 className="metric-title">
          {icon}
          {title}
        </h3>
      </div>
      <div className="metric-content">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-item">
            <span className="metric-label">{metric.label}</span>
            <span className="metric-value">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// CarbonFootprintReduction Component
interface CarbonFootprintReductionProps {
  reduction: number; // in tons
}

const CarbonFootprintReduction: React.FC<CarbonFootprintReductionProps> = ({
  reduction,
}) => {
  const maxReduction = 10; // For percentage calculation
  const percentage = Math.min((reduction / maxReduction) * 100, 100);

  return (
    <div className="report-carbon-reduction">
      <div className="report-carbon-header">
        <span className="report-carbon-text">
          {reduction.toFixed(2)} tons CO₂/year
        </span>
        <span className="report-carbon-percentage">{percentage.toFixed(0)}%</span>
      </div>
      <div className="report-carbon-progress">
        <div
          className="report-carbon-progress-bar"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseClasses = "button base-button";
  const variantClasses =
    variant === "outline" ? "button-outline" : "button-default";
  const sizeClasses =
    size === "sm" ? "button-sm" : size === "lg" ? "button-lg" : "button-md";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ children, className = "", ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

interface ConsumptionData {
  monthlyBill: number;
  occupants: number;
  area: number; // in square meters
  consumptionFromBill: number; // in kWh/month
  tariffRate: number; // ₹ per kWh
  timestamp: any;
}

interface SolarData {
  area: number; // in square meters
  irradiance: number; // kWh/m²/day
  capacity: number; // kW
  dailyEnergy: number; // kWh/day
  tiltAngle: number; // degrees
  sunPosition: {
    azimuth: number;
    elevation: number;
  };
  timestamp: any;
}

const Report: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Authentication state
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const userId = user ? user.uid : null;

  // State variables for fetched data
  const [consumptionData, setConsumptionData] =
    useState<ConsumptionData | null>(null);
  const [solarData, setSolarData] = useState<SolarData | null>(null);

  // Calculated values
  const [usableRoofSpace, setUsableRoofSpace] = useState<number>(0);
  const [yearlyUsage, setYearlyUsage] = useState<number>(0);
  const [savings, setSavings] = useState<{ annual: number; total: number }>({
    annual: 0,
    total: 0,
  });
  const [roofAreaRequired, setRoofAreaRequired] = useState<number>(0);
  const [numberOfPanels, setNumberOfPanels] = useState<number>(0);
  const [co2Reduction, setCo2Reduction] = useState<number>(0);
  const [energyChartData, setEnergyChartData] = useState<any[]>([]);

  // Constants for calculations
  const PANEL_POWER_DENSITY = 200; // W/m²
  const PANEL_WATTAGE = 330; // W per panel
  const SYSTEM_EFFICIENCY = 0.75;
  const COVERAGE_RATIO = 0.8;
  const CO2_EMISSIONS_PER_KWH = 0.92; // kg CO2 per kWh

  useEffect(() => {
    const fetchDBData = async () => {
      if (!userId) return;

      try {
        // Fetch Consumption Data
        const consumptionRef = collection(db, "users", userId, "consumptionData");
        const cq = query(consumptionRef, orderBy("timestamp", "desc"), limit(1));
        const consumptionSnap = await getDocs(cq);
        let latestConsumption: ConsumptionData | null = null;
        if (!consumptionSnap.empty) {
          latestConsumption = consumptionSnap.docs[0].data() as ConsumptionData;
          setConsumptionData(latestConsumption);
        } else {
          console.warn("No consumptionData found for the user.");
        }

        // Fetch Solar Data
        const calculationsRef = collection(db, "users", userId, "calculations");
        const sq = query(calculationsRef, orderBy("timestamp", "desc"), limit(1));
        const solarSnap = await getDocs(sq);
        let latestSolar: SolarData | null = null;
        if (!solarSnap.empty) {
          const docData = solarSnap.docs[0].data();
          if ("capacity" in docData && "dailyEnergy" in docData && "area" in docData) {
            latestSolar = docData as SolarData;
            setSolarData(latestSolar);
          } else {
            console.warn("No valid solar data found for the user in calculations.");
          }
        } else {
          console.warn("No calculations found for the user.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDBData();
  }, [userId]);

  useEffect(() => {
    if (consumptionData && solarData) {
      const totalRoofSpace = solarData.area;
      const monthlyUsage = consumptionData.consumptionFromBill;
      const yearlyUsageCalc = monthlyUsage * 12;
      setYearlyUsage(yearlyUsageCalc);

      const requiredSystemSize = solarData.capacity;
      const dailyEnergy = solarData.dailyEnergy;
      const annualProductionNum = dailyEnergy * 365; // number

      // Calculate Savings
      const annualSavingsCalc = yearlyUsageCalc * consumptionData.tariffRate;
      const totalSavingsCalc = annualSavingsCalc * 25;
      setSavings({ annual: annualSavingsCalc, total: totalSavingsCalc });

      // Usable roof space
      const usableRoof = totalRoofSpace * COVERAGE_RATIO;
      setUsableRoofSpace(usableRoof);

      // Roof area required
      const requiredArea = (requiredSystemSize * 1000) / PANEL_POWER_DENSITY;
      setRoofAreaRequired(requiredArea);

      // Number of panels
      const numberOfPanelsCalc = Math.ceil(
        (requiredSystemSize * 1000) / PANEL_WATTAGE
      );
      setNumberOfPanels(numberOfPanelsCalc);

      // CO2 Reduction
      const annualCO2Reduction = (yearlyUsageCalc * CO2_EMISSIONS_PER_KWH) / 1000;
      setCo2Reduction(annualCO2Reduction);

      const annualProduction = parseFloat(annualProductionNum.toFixed(2));
      const yearlyUsageValNumber = parseFloat(yearlyUsageCalc.toFixed(2));

      // Create a single data point for the chart
      const newEnergyData = [
        {
          name: "Annual",
          production: annualProduction,
          consumption: yearlyUsageValNumber,
        },
      ];

      setEnergyChartData(newEnergyData);
    }
  }, [consumptionData, solarData]);

  const downloadReport = () => {
    const input = reportRef.current;
    if (input) {
      html2canvas(input, { scale: 2 })
        .then((canvas: HTMLCanvasElement) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "px", "a4");
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("report.pdf");
        })
        .catch((err: Error) => {
          console.error("Error generating PDF:", err);
          alert("Failed to generate PDF.");
        });
    }
  };

  if (loadingAuth) {
    return <div>Loading...</div>;
  }

  if (errorAuth) {
    return <div>Error: {errorAuth.message}</div>;
  }

  const totalRoofSpace = solarData?.area || 0;
  const yearlyUsageVal = yearlyUsage || 0;
  const requiredSystemSize = solarData?.capacity || 0;
  const annualProduction = solarData
    ? (solarData.dailyEnergy * 365).toFixed(2)
    : "0.00";

  const orientation = solarData?.sunPosition
    ? getOrientationFromAzimuth(solarData.sunPosition.azimuth)
    : "Unknown";

  return (
    <div className="report-container" ref={reportRef}>
      <div className="report-content">
        {/* Header */}
        <div className="report-header">
          <Zap className="report-icon" />
          <h1 className="report-title">Solar Energy Report</h1>
        </div>

        {/* Energy Production vs. Consumption Chart */}
        <Card className="chart-card">
          <div className="card-header">
            <h2 className="card-title">Energy Production vs. Consumption</h2>
          </div>
          <div className="card-content chart-container" style={{ height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={energyChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="production"
                  fill="#3B82F6"
                  name="Production"
                  animationDuration={1500}
                />
                <Bar
                  dataKey="consumption"
                  fill="#34D399"
                  name="Consumption"
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Metrics Grid */}
        <div className="metrics-grid">
          <MetricCard
            title="Roof Area"
            icon={<Home className="metric-icon blue-icon" />}
            metrics={[
              {
                label: "Total Roof Space",
                value: `${totalRoofSpace.toFixed(2)} m²`,
              },
              {
                label: "Usable Roof Space",
                value: `${usableRoofSpace.toFixed(2)} m²`,
              },
            ]}
          />

          <MetricCard
            title="Consumption"
            icon={<Battery className="metric-icon blue-icon" />}
            metrics={[
              {
                label: "Monthly Usage",
                value: `${(consumptionData?.consumptionFromBill || 0).toFixed(
                  2
                )} kWh`,
              },
              {
                label: "Yearly Usage",
                value: `${yearlyUsageVal.toFixed(2)} kWh`,
              },
            ]}
          />

          <MetricCard
            title="System Capacity"
            icon={<Zap className="metric-icon blue-icon" />}
            metrics={[
              {
                label: "Required System Size",
                value: `${requiredSystemSize.toFixed(2)} kW`,
              },
            ]}
          />

          <MetricCard
            title="Estimated Energy Output"
            icon={<Sun className="metric-icon blue-icon" />}
            metrics={[
              {
                label: "Annual Production",
                value: `${annualProduction} kWh`,
              },
            ]}
          />

          <MetricCard
            title="Savings"
            icon={<Leaf className="metric-icon green-icon" />}
            metrics={[
              { label: "Annual Savings", value: `₹${savings.annual.toFixed(2)}` },
              { label: "25-Year Savings", value: `₹${savings.total.toFixed(2)}` },
            ]}
          />

          <MetricCard
            title="Irradiance"
            icon={<Sun className="metric-icon blue-icon" />}
            metrics={[
              {
                label: "Average Daily",
                value: `${solarData?.irradiance?.toFixed(2) || 0} kWh/m²/day`,
              },
              {
                label: "Average Yearly",
                value: `${(
                  (solarData?.irradiance || 0) * 365
                ).toFixed(2)} kWh/m²`,
              },
            ]}
          />

          <MetricCard
            title="Roof Area Required"
            icon={<Home className="metric-icon blue-icon" />}
            metrics={[
              {
                label: "Based on Consumption",
                value: `${roofAreaRequired.toFixed(2)} m²`,
              },
            ]}
          />

          <MetricCard
            title="Tilt and Orientation"
            icon={<Sun className="metric-icon blue-icon" />}
            metrics={[
              {
                label: "Optimal Tilt",
                value: `${solarData?.tiltAngle?.toFixed(2) || 0}°`,
              },
              { label: "Optimal Orientation", value: orientation },
            ]}
          />

          <MetricCard
            title="Number of Panels"
            icon={<Sun className="metric-icon blue-icon" />}
            metrics={[
              { label: "Total Panels Required", value: `${numberOfPanels}` },
              { label: "Panel Wattage", value: `330 W` },
            ]}
          />
        </div>

        {/* Carbon Footprint Reduction */}
        <Card className="report-carbon-card">
          <div className="report-carbon-card-header">
            <Leaf className="report-carbon-icon report-carbon-green-icon" />
            <h3 className="report-carbon-card-title">Carbon Footprint Reduction</h3>
          </div>
          <div className="report-carbon-card-content">
            <CarbonFootprintReduction reduction={co2Reduction} />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Button
            className="explore-button"
            size="lg"
            onClick={() => navigate("/vendor")}
          >
            Explore Vendors
            <ArrowRight className="button-icon" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="download-button"
            onClick={downloadReport}
          >
            Download Report
            <Download className="button-icon" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Report;
