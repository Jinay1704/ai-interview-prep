// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import { createContext, useContext, useState, useCallback } from "react";

import LandingPage   from "@/pages/LandingPage";
import Dashboard     from "@/pages/Dashboard";
import JobSetup      from "@/pages/JobSetup";
import InterviewPage from "@/pages/InterviewPage";
import Results       from "@/pages/Results";
import ResumeUpload  from "@/pages/ResumeUpload";
import NotFound      from "@/pages/NotFound";
import Navbar        from "@/components/layout/Navbar";
import PricingModal  from "@/components/pricing/PricingModal";

export const PricingContext = createContext({
  openPricing: () => {},
  userPlan: "free",
});

export const usePricingModal = () => useContext(PricingContext);

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  return isSignedIn ? children : <Navigate to="/" replace />;
};

export default function App() {
  const [pricingOpen, setPricingOpen] = useState(false);
  const [userPlan, setUserPlan]       = useState(() => localStorage.getItem("userPlan") || "free");

  const openPricing  = useCallback(() => setPricingOpen(true),  []);
  const closePricing = useCallback(() => setPricingOpen(false), []);

  const handleUpgrade = useCallback((planId) => {
    setUserPlan(planId);
    localStorage.setItem("userPlan", planId);
  }, []);

  return (
    <PricingContext.Provider value={{ openPricing, userPlan }}>
      <BrowserRouter>
        <Navbar />
        <Toaster position="top-right" richColors />

        <PricingModal
          isOpen={pricingOpen}
          onClose={closePricing}
          currentPlan={userPlan}
          onUpgrade={handleUpgrade}
        />

        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          <Route path="/jobs/new" element={
            <ProtectedRoute><JobSetup /></ProtectedRoute>
          } />

          <Route path="/interview/:interviewId" element={
            <ProtectedRoute><InterviewPage /></ProtectedRoute>
          } />

          <Route path="/interview/:interviewId/results" element={
            <ProtectedRoute><Results /></ProtectedRoute>
          } />

          <Route path="/resume" element={
            <ProtectedRoute><ResumeUpload /></ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </PricingContext.Provider>
  );
}