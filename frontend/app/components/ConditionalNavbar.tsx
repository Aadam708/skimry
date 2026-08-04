"use client";
import { useEffect, useState } from "react";
import NavbarComponent from "./NavbarComponent";
import DashNavbarComponent from "./DashNavbarComponent";

export default function ConditionalNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

 useEffect(() => {

    fetch("http://localhost:8080/api/users/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  if (isLoggedIn === null) return <NavbarComponent />;
  return isLoggedIn ? <DashNavbarComponent /> : <NavbarComponent />;
}
