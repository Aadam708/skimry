import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Adjust the path to your logo if needed based on the components folder
import logo from '../../public/images/logo.png';

const DashNavbarComponent = () => {
  return (
    <header className="flex w-full items-center justify-between p-6 px-8 absolute top-0 left-0 right-0 z-50">
      {/* Top Left: Logo */}
      <div className="flex items-center">
        <Link href="/">
          <Image
            src={logo}
            alt="Skimry Logo"
            width={120} // Smaller size for the navbar
            height={40}  // Approximate height to avoid layout shift (adjust as needed)
            className="object-contain w-auto h-auto"
            priority
          />
        </Link>
      </div>

      {/* Top Right: Nav Items with 5px gap */}
      <nav className="flex gap-1.25 text-sm md:text-base font-medium">
        <Link href="/extension" className="px-3 py-2 text-white hover:text-pink-500 transition-colors duration-500">
          Extension
        </Link>
        <Link href="/pricing" className="px-3 py-2 text-white hover:text-pink-500 transition-colors duration-500">
          Plans
        </Link>
        <Link href="logout" className="px-3 py-2 text-white hover:text-pink-500 transition-colors duration-500">
          Logout
        </Link>
      </nav>
    </header>
  );
};

export default DashNavbarComponent;
