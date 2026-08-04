"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import logo from "../../public/images/logo.png";

const NavbarComponent = () => {
  const pathname = usePathname();

  const navLinkClass = (href: string) =>
    `px-3 py-2 transition-colors duration-500 ${
      pathname === href ? "text-pink-500" : "text-white hover:text-pink-500"
    }`;

  return (
    <header className="flex w-full items-center justify-between p-6 px-8 absolute top-0 left-0 right-0 z-50">
      <div className="flex items-center">
        <Link href="/">
          <Image
            src={logo}
            alt="Skimry Logo"
            width={120}
            height={40}
            className="object-contain w-auto h-auto"
            priority
          />
        </Link>
      </div>

      <nav className="flex gap-1.25 text-sm md:text-base font-medium">
        <Link href="/pricing" className={navLinkClass("/pricing")}>
          Pricing
        </Link>
        <Link href="/login" className={navLinkClass("/login")}>
          Login
        </Link>
        <Link href="/register" className={navLinkClass("/register")}>
          Register
        </Link>
      </nav>
    </header>
  );
};

export default NavbarComponent;
