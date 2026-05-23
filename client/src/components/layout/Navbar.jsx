// client/src/components/layout/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/clerk-react";
import { BrainCircuit, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingModal } from "@/App";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { openPricing, userPlan } = usePricingModal();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span>AI Interview</span>
        </Link>

        {/* Nav links */}
        {isSignedIn && (
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/jobs/new" className="text-muted-foreground hover:text-foreground transition-colors">
              New Interview
            </Link>
            <Link to="/resume" className="text-muted-foreground hover:text-foreground transition-colors">
              Resume
            </Link>
          </nav>
        )}

        {/* Auth controls */}
        <div className="flex items-center gap-3">
          {!isLoaded ? null : isSignedIn ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={openPricing}
                className="flex items-center gap-1.5 border-primary/40 text-primary hover:bg-primary/5 capitalize"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {userPlan === "free" || userPlan === "basic" ? "Upgrade" : `Plan: ${userPlan}`}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/jobs/new")}
                className="hidden sm:flex"
              >
                Start Interview
              </Button>

              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Sign in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Get started</Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}