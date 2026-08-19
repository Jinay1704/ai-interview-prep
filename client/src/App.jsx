// client/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";

import LandingPage   from "@/pages/LandingPage";
import Dashboard     from "@/pages/Dashboard";
import JobSetup      from "@/pages/JobSetup";
import InterviewPage from "@/pages/InterviewPage";
import Results       from "@/pages/Results";
import ResumeUpload  from "@/pages/ResumeUpload";
import NotFound      from "@/pages/NotFound";
import LoginPage     from "@/pages/LoginPage";
import Navbar        from "@/components/layout/Navbar";

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  return isSignedIn ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const { isLoaded } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-right" richColors />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

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
  );
}