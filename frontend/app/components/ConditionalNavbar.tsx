"use client";

import { useAuth } from "@clerk/nextjs";
import NavbarComponent from "./NavbarComponent";
import DashNavbarComponent from "./DashNavbarComponent";

type ConditionalNavbarProps = {
  showReturnHome?: boolean;
};

export default function ConditionalNavbar({
  showReturnHome = false,
}: ConditionalNavbarProps) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <header className="absolute top-0 left-0 right-0 z-50 h-20 w-full" />
    );
  }

  return isSignedIn ? (
    <DashNavbarComponent showReturnHome={showReturnHome} />
  ) : (
    <NavbarComponent showReturnHome={showReturnHome} />
  );
}
