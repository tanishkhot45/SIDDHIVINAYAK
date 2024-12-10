import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './components/context/AuthContext';
import Loading from './components/Loading/Loading';
import './App.css';

// Lazy-loaded components
const Welcome = lazy(() => import('./components/Welcome/Welcome'));
const Features = lazy(() => import('./components/Features/Features'));
const Services = lazy(() => import('./components/Services/Services'));
const About = lazy(() => import('./components/About/About'));
const CallToAction = lazy(() => import('./components/CallToAction/CallToAction'));
const Login = lazy(() => import('./components/Login/Login'));
const Signup = lazy(() => import('./components/Signup/Signup'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const LoggedInHome = lazy(() => import('./components/LoggedInHome/LoggedInHome'));
const Calculator = lazy(() => import('./components/Calculator/Calculator'));
const ConsumptionCalculator = lazy(() => import('./components/ConsumptionCalculator/ConsumptionCalculator'));
const Report = lazy(() => import('./components/Report/Report'));
const Vendor = lazy(() => import('./components/Vendor/Vendor'));

function PublicHomePage() {
  return (
    <div id="top">
      <Welcome />
      <Features />
      <Services />
      <About />
      <CallToAction />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Header />
        <main>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicHomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/home/*"
                element={
                  <ProtectedRoute>
                    <LoggedInHomeWrapper />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calculator"
                element={
                  <ProtectedRoute>
                    <Calculator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/energy-estimation"
                element={
                  <ProtectedRoute>
                    <ConsumptionCalculator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <Report />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendor"
                element={
                  <ProtectedRoute>
                    <Vendor />
                  </ProtectedRoute>
                }
              />
              {/* 404 Page */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

/* Wrapper component to handle hash links in LoggedInHome */
function LoggedInHomeWrapper() {
  const location = useLocation();
  return <LoggedInHome key={location.pathname + location.search + location.hash} />;
}
