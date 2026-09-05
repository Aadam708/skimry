"use client";
import { useEffect, useState } from "react";
import NavbarComponent from "./NavbarComponent";
import DashNavbarComponent from "./DashNavbarComponent";

type ConditionalNavbarProps = {
  showReturnHome?: boolean;
  loggedIn: boolean | null;
};

export default function ConditionalNavbar({
  showReturnHome = false,
  loggedIn,
}: ConditionalNavbarProps) {
  if (loggedIn === null) {
    return <NavbarComponent showReturnHome={showReturnHome} />;
  }

  return loggedIn ? (
    <DashNavbarComponent showReturnHome={showReturnHome} />
  ) : (
    <NavbarComponent showReturnHome={showReturnHome} />
  );
}
