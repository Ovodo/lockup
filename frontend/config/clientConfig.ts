import { z } from "zod";

/*
 * The schema for the client-side environment variables
 * These variables should be defined in the app/.env file
 * These variables are NOT SECRET, they are exposed to the client side
 * They can and should be tracked by Git
 * All of the env variables must have the NEXT_PUBLIC_ prefix
 */

const clientConfigSchema = z.object({
  SUI_NETWORK: z.string(),
  SUI_NETWORK_NAME: z.enum(["mainnet", "testnet", "devnet", "localnet"]),
  ENOKI_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  PACKAGE_ID: z.string(),
  APP_ID: z.string(),
  VAULT: z.string(),
  CLOCK_ID: z.string(),
  REDIRECT_URI: z.string(),
  MASTER_SEED: z.string(),
});

const clientConfig = clientConfigSchema.parse({
  SUI_NETWORK: process.env.NEXT_PUBLIC_SUI_NETWORK!,
  SUI_NETWORK_NAME: process.env.NEXT_PUBLIC_SUI_NETWORK_NAME as
    | "mainnet"
    | "testnet"
    | "devnet"
    | "localnet",
  ENOKI_API_KEY: process.env.NEXT_PUBLIC_ENOKI_API_KEY!,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  PACKAGE_ID: process.env.NEXT_PUBLIC_PACKAGE_ID!,
  APP_ID: process.env.NEXT_PUBLIC_APP_ID!,
  VAULT: process.env.NEXT_PUBLIC_VAULT!,
  CLOCK_ID: process.env.NEXT_PUBLIC_CLOCK_ID!,
  REDIRECT_URI: `${process.env.NEXTAUTH_URI}/auth`,
  MASTER_SEED: "tricodelockup", // Replace with a securely stored master seed
});

export default clientConfig;
