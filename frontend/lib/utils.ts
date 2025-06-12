import crypto from "crypto";
import { JwtPayload } from "jwt-decode";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getZkLoginSignature } from "@mysten/sui/zklogin";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Define type for the navigation item
interface NavItem {
  href: string;
  iconSrc: string;
  alt: string;
  label: string;
}

// Navigation items array with proper typing
export const navItems: NavItem[] = [
  {
    href: "/dashboard",
    iconSrc: "/icons/home.svg",
    alt: "home",
    label: "Dashboard",
  },
  {
    href: "/marketplace",
    iconSrc: "/icons/wallet.svg",
    alt: "market",
    label: "P2P Marketplace",
  },
  {
    href: "/assets",
    iconSrc: "/icons/assets.svg",
    alt: "assets",
    label: "Assets",
  },
  {
    href: "/investment",
    iconSrc: "/icons/coins.svg",
    alt: "invest",
    label: "Investments",
  },
];

export const baseUrl =
  process.env.NODE_ENV == "production"
    ? "https://lockup.ai/"
    : "http://localhost:3000/";

/**
 * Generate a user salt using HKDF.
 * @param jwt - The decoded JWT payload.
 * @param masterSeed - A master seed value (must be securely stored and consistent).
 * @returns A 16-byte salt as a hexadecimal string.
 */
export function generateUserSalt(jwt: JwtPayload, masterSeed: string): bigint {
  if (!jwt.iss || !jwt.aud || !jwt.sub) {
    throw new Error("JWT is missing required fields (iss, aud, sub).");
  }

  // Concatenate `iss` (issuer) and `aud` (audience) as the salt for HKDF
  const salt = `${jwt.iss}${jwt.aud}`;

  // Use HKDF to derive the user salt
  const hkdf = crypto.createHmac("sha256", masterSeed);
  hkdf.update(salt); // Use `iss || aud` as the salt
  hkdf.update(jwt.sub); // Use `sub` (subject) as the info

  // Generate a 16-byte (128-bit) salt
  const derivedKey = hkdf.digest().slice(0, 16); // Ensure it's 16 bytes

  // Convert the derived key to a BigInt
  const bigIntSalt = BigInt(`0x${derivedKey.toString("hex")}`);

  return bigIntSalt;
}

export type PartialZkLoginSignature = Omit<
  Parameters<typeof getZkLoginSignature>["0"]["inputs"],
  "addressSeed"
>;
