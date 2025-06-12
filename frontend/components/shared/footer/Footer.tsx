import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1B1B1B] py-8  text-[#FFFFFF]">
      <div className="px-4 sm:px-8 lg:px-12">
        {/* Top section with logo and navigation */}
        <div className="flex flex-row justify-between items-center">
          {/* Logo */}
          <Link
            href={"/"}
            className=" w-[80px] h-[22px] sm:w-[123px] sm:h-[22.08px] relative"
          >
            <Image src="/icons/logo_white.svg" alt="LockUP" fill className="" />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            <Link
              href="mailto:info@tricode.pro"
              className="text-[#FFFFFF] hover:text-gray-300 text-sm font-semibold"
            >
              Help
            </Link>
            <Link
              href="mailto:contact@tricode.pro"
              className="text-[#FFFFFF] hover:text-gray-300 text-sm font-semibold"
            >
              Contact Us
            </Link>
            <Link
              href="https://docs.google.com/document/d/1T68XZX00JoQTmrmVC5hxPFz9QmmsBy3BIT5AE56xgYI/edit?tab=t.0"
              target="_blank"
              className="text-[#FFFFFF] hover:text-gray-300 text-sm font-semibold"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Full-width horizontal line */}
      <hr className="border-t-2 border-[#FFFFFF]   my-8 border-opacity-90 w-full m-0" />

      {/* Bottom section */}
      <div className=" px-4 sm:px-8 lg:px-12">
        <div className="flex flex-row justify-between items-center">
          {/* Copyright text */}
          <div className="text-[#FFFFFF] text-xs sm:text-sm ">
            © {currentYear} LockUp. All rights reserved.
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-3 sm:space-x-4 lg:spaclinkse-x-6">
            <Link
              target="_blank"
              href="https://youtube.com/@tricodepro?si=gVDfr0pGwsmbnKZI"
              className="text-[#FFFFFF] hover:text-gray-300"
            >
              <Image
                src="/icons/youtube.svg"
                alt="YouTube"
                className="w-5 h-5"
                width={24}
                height={24}
              />
            </Link>
            <Link
              target="_blank"
              href="https://x.com/Sui_LockUp?t=4uukjSPZ72qafyT-HaEI3Q&s=09"
              className="text-[#FFFFFF] hover:text-gray-300"
            >
              <Image
                src="/icons/twitter.svg"
                alt="Twitter"
                className="w-5 h-5"
                width={24}
                height={24}
              />
            </Link>
            <Link
              target="_blank"
              href="https://www.instagram.com/tricode.pro?igsh=MWkycG5qemJoODJuMA=="
              className="text-[#FFFFFF] hover:text-gray-300"
            >
              <Image
                src="/icons/instagram.svg"
                alt="Instagram"
                className="w-5 h-5"
                width={24}
                height={24}
              />
            </Link>
            <Link
              href="https://www.linkedin.com/company/tricodepro"
              target="_blank"
              className="text-[#FFFFFF] hover:text-gray-300"
            >
              <Image
                src="/icons/linkedin.svg"
                alt="LinkedIn"
                className="w-5 h-5"
                width={24}
                height={24}
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
