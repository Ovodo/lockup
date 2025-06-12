"use client";
import React, { useContext, useState } from "react";
import Link from "next/link";
import ProfilePopover from "@/components/ProfilePopover";
import Image from "next/image";
import { navItems } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useFonts } from "@/hooks/useFonts";
import { LoginContext } from "@/contexts/ZkLoginContext";
import { LoginContextType } from "@/types/todo";

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false); // State for Hamburger Menu
  const path = usePathname();
  const { sand } = useFonts();
  const { logout } = useContext(LoginContext) as LoginContextType;

  // Placeholder state for editable profile fields
  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    phoneNumber: "+123456789",
    email: "johndoe@example.com",
  });

  // Handle input changes
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setProfileData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle Profile Dropdown Toggle
  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Toggle Hamburger Menu
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <div
      style={sand.style}
      className={`${
        path == "/" || path?.includes("auth") ? "hidden" : "flex"
      } justify-between items-center h-[10.24svh] w-full px-12 border-b border-[#DCDCDC]`}
    >
      {/* Logo Section */}
      <div className="flex items-center">
        <Link href="/">
          <div className="relative w-[125px] h-[21.54px]">
            <Image src={"/icons/logo.svg"} fill alt="logo" />
          </div>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex gap-[39px]">
        {navItems.map(({ href, iconSrc, alt, label }, index) => (
          <div key={index} className="flex gap-2   items-center">
            <div className="relative w-[24px] h-[24px]">
              <Image src={iconSrc} fill className="object-cover" alt={alt} />
            </div>
            <Link className="hover:font-bold  duration-300" href={href}>
              {label}
            </Link>
          </div>
        ))}
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden ">
        <button
          onClick={toggleNav}
          className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}

      {isNavOpen && (
        <div className="absolute z-50 top-[88px] left-0 w-full bg-white shadow-md md:hidden">
          <div className="flex-col flex gap-4 p-4">
            {navItems.map(({ href, iconSrc, alt, label }, index) => (
              <div
                key={index}
                className="flex gap-2 hover:-translate-y-1 duration-150 border-appBlack  items-center"
              >
                <div className="relative w-[24px] h-[24px]">
                  <Image src={iconSrc} fill alt={alt} />
                </div>
                <Link href={href}>{label}</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search, Notifications, and Profile */}

      <div className="hidden md:flex items-center gap-4">
        <div className="bg-[#DCE0E5] w-10 cursor-pointer hover:scale-110 duration-100 h-10 rounded-[12px] flex items-center justify-center">
          <Image
            src={"/icons/search.svg"}
            width={20}
            height={20}
            alt="search"
          />
        </div>
        <div className="bg-[#DCE0E5] w-10 cursor-pointer hover:scale-110 duration-100 h-10 rounded-[12px] flex items-center justify-center">
          <Image
            src={"/icons/notification.svg"}
            width={20}
            height={20}
            alt="notification"
          />
        </div>
        <Link
          href={"/profile"}
          // onClick={logout}
          className="bg-[#1b1b1b] relative w-10 cursor-pointer hover:scale-110 duration-100 h-10 rounded-[12px] flex items-center justify-center"
        >
          <div className="w-[6px] h-[6px] rounded-full backdrop-blur-sm bg-lime-300 absolute top-[6px] right-[6px] animate-pulse" />
          <Image
            src={"/icons/connect.svg"}
            width={20}
            height={20}
            alt="connect"
          />
        </Link>
      </div>
      {/* <ProfilePopover /> */}

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 z-10 w-64 p-4 mt-[18rem] bg-white border rounded-lg shadow-lg">
          <h4 className="mb-2 text-sm font-bold text-gray-700">Edit Profile</h4>
          <div className="space-y-2">
            {/* Full Name */}
            <input
              type="text"
              name="fullName"
              value={profileData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {/* Phone Number */}
            <input
              type="text"
              name="phoneNumber"
              value={profileData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Phone Number"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {/* Email */}
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              placeholder="Email Address"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
