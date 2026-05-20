import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

/**
 * Thin wrapper around Clerk's hooks so we keep Clerk-specific
 * imports in one place. Swap out Clerk here if auth ever changes.
 */
export const useAuth = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded, signOut } = useClerkAuth();

  return {
    user,
    isSignedIn,
    isLoaded: userLoaded && authLoaded,
    signOut,
    displayName: user
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.emailAddresses[0]?.emailAddress
      : "",
    avatarUrl: user?.imageUrl ?? "",
  };
};
