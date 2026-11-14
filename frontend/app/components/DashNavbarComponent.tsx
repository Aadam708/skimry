'use client'
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Adjust the path to your logo if needed based on the components folder
import logo from '../../public/images/logo.png';
import ProfileMenu from "./ProfileMenu";

type DashNavbarProps = {
  showReturnHome?: boolean;
};

const DashNavbarComponent = ({ showReturnHome = false }: DashNavbarProps) => {

  const path = usePathname()

  const setDesign = (pathname:String)=>{

    return "px-3 py-2 transition-colors duration-500 " + (pathname === path ? "text-pink-500" :"text-white hover:text-pink-500")
  }
  return (
    <header className="flex w-full items-center justify-between p-6 px-8 absolute top-0 left-0 right-0 z-50">
      {/* Top Left: Logo and side navigation */}
      <div className="flex flex-col items-start gap-3">
        {showReturnHome ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-white transition-colors duration-500 hover:text-pink-500"
          >
            <span aria-hidden="true" className="text-lg">
              ←
            </span>
            <span>Return home</span>
          </Link>
        ) : (
          <>
            <Link href="/dashboard">
              <Image
                src={logo}
                alt="Skimry Logo"
                width={120}
                height={40}
                className="h-auto w-auto object-contain"
                priority
              />
            </Link>

          </>
        )}
      </div>

      {/* Top Right: Nav Items with 5px gap */}
      <nav className="flex gap-1.25 text-sm font-medium md:text-base">
        <Link href="/extension" className={setDesign("/extension")}>
          Extension
        </Link>
        <Link href="/pricing" className={setDesign("/pricing")}>
          Plans
        </Link>
        <ProfileMenu/>
      </nav>


    </header>
  );
};

export default DashNavbarComponent;
