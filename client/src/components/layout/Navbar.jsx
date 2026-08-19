// client/src/components/layout/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { BrainCircuit, Sparkles, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { isSignedIn, isLoaded, user, signOut, displayName, avatarUrl } = useAuth();
  const navigate = useNavigate();


  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : "U";

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
                onClick={() => navigate("/jobs/new")}
                className="hidden sm:flex"
              >
                Start Interview
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate("/login")}>
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}