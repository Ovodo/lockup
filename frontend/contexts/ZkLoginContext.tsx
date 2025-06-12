import React, { useEffect, useState } from "react";
import axios from "axios";
import { JwtPayload, LoginContextType } from "../types/todo";
import { Ed25519Keypair, Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import {
  generateRandomness,
  generateNonce,
  getExtendedEphemeralPublicKey,
  genAddressSeed,
  getZkLoginSignature,
} from "@mysten/sui/zklogin";
import { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

import clientConfig from "@/config/clientConfig";
import { jwtDecode } from "jwt-decode";
import { generateUserSalt, PartialZkLoginSignature } from "@/lib/utils";
import { networkConfig } from "@/config/networkConfig";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const suiClient = new SuiClient({ url: networkConfig.devnet.url });

export const LoginContext = React.createContext<LoginContextType | null>(null);

const LoginProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [zkProofResult, setZkProofResult] = useState<any>(null); // Store the zkProof result
  const keyPair = new Ed25519Keypair();
  const router = useRouter();

  useEffect(() => {
    const storedAddress = window.sessionStorage.getItem("address");
    const storedJwt = window.sessionStorage.getItem("jwt");
    if (storedAddress) {
      setAddress(storedAddress);
    } else {
      router.push("/");
    }
    if (storedJwt) setJwt(storedJwt);
  }, []);

  const login = async () => {
    try {
      const randomness = generateRandomness();
      window.sessionStorage.setItem("randomness", randomness);
      const proof = window.sessionStorage.getItem("proof");
      const keyPair = new Ed25519Keypair();
      const { epoch } = await suiClient.getLatestSuiSystemState();
      const maxEpoch = Number(epoch) + 2; // Active for 2 epochs from now
      if (!proof) {
        window.sessionStorage.setItem("proof", keyPair.getSecretKey());
        window.sessionStorage.setItem("epoch", maxEpoch.toString());
      }
      const pubKey = proof
        ? Ed25519Keypair.fromSecretKey(proof).getPublicKey()
        : keyPair.getPublicKey();

      const generatedNonce = generateNonce(pubKey, maxEpoch, randomness);
      if (!generatedNonce) {
        console.error("Nonce is not ready yet.");
        return;
      }

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientConfig.GOOGLE_CLIENT_ID}&response_type=id_token&redirect_uri=${clientConfig.REDIRECT_URI}&scope=openid&nonce=${generatedNonce}`;
    } catch (error) {
      console.error("Error generating nonce:", error);
    }
  };

  const handleZkProof = async (idToken: string, id?: string) => {
    try {
      const decodedJwt: JwtPayload = jwtDecode(idToken); // Decode JWT payload
      const userSalt = generateUserSalt(decodedJwt, clientConfig.MASTER_SEED);

      const proof = window.sessionStorage.getItem("proof");
      const randomness = window.sessionStorage.getItem("randomness");
      if (!proof) {
        toast.error("No Proof");
        return;
      }
      if (!randomness) {
        toast.error("No Randomness", { id: id });
        return;
      }
      const pubKey = Ed25519Keypair.fromSecretKey(proof).getPublicKey();

      const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(pubKey);
      const maxEpoch = window.sessionStorage.getItem("epoch");

      const response = await axios.post(
        "https://prover-dev.mystenlabs.com/v1",
        {
          jwt: idToken,
          extendedEphemeralPublicKey,
          maxEpoch,
          jwtRandomness: randomness,
          salt: userSalt.toString(),
          keyClaimName: "sub",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("zkProofResult:", response.data);
      window.sessionStorage.setItem("zkproof", JSON.stringify(response.data));
      return response.data;
    } catch (error: any) {
      console.error(
        "Error during zkProof generation:",
        error.response.data.message
      );
    }
  };

  const signAndSubmitTransaction = async (
    txb: Transaction,
    id?: string,
    recipient?: string,
    amount?: bigint
  ): Promise<SuiTransactionBlockResponse | undefined> => {
    try {
      const token = window.sessionStorage.getItem("jwt");
      const proof = window.sessionStorage.getItem("proof");
      const epoch = window.sessionStorage.getItem("epoch");
      if (!token) {
        toast.error("No Token", { position: "bottom-left", id: id });
        return;
      }
      const partialZkLoginSignature = window.sessionStorage.getItem("zkproof");
      if (!partialZkLoginSignature) {
        toast.loading("Fetching Proof", { id: id });
        await handleZkProof(token, id);
      }
      const decodedJwt: JwtPayload = jwtDecode(token); // Decode JWT payload
      const userSalt = generateUserSalt(decodedJwt, clientConfig.MASTER_SEED);

      const addressSeed = genAddressSeed(
        userSalt,
        "sub",
        decodedJwt.sub!,
        decodedJwt.aud! as string
      ).toString();

      if (!proof || !address) {
        console.error("No ephemeral Key");
        toast.error("No Keypair or Address", {
          position: "bottom-left",
          id: id,
        });
        return;
      }
      const zkLoginUserAddress = address; // Use the zkLogin user address
      const ephemeralKeyPair = Ed25519Keypair.fromSecretKey(proof); // Use the ephemeral key pair

      // const [coin] = txb.splitCoins(txb.gas, [amount]);
      // txb.transferObjects([coin], recipient);
      txb.setSender(zkLoginUserAddress!);
      // toast.loading("Signing", { id: id });
      const { bytes, signature: userSignature } = await txb.sign({
        client: suiClient,
        signer: ephemeralKeyPair,
      });

      const partialProof = JSON.parse(
        partialZkLoginSignature as string
      ) as PartialZkLoginSignature;
      const zkLoginSignature = getZkLoginSignature({
        inputs: {
          proofPoints: partialProof.proofPoints,
          issBase64Details: partialProof.issBase64Details,
          headerBase64: partialProof.headerBase64,
          addressSeed,
        },
        maxEpoch: epoch as unknown as number,
        userSignature,
      });

      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature: zkLoginSignature,
      });

      // console.log("Transaction Result:", result);

      return result;
    } catch (error: any) {
      console.error("Error signing and submitting transaction:", error);
      throw Error(error.message);
    }
  };

  const logout = () => {
    window.sessionStorage.clear();
    window.location.reload();
  };

  return (
    <LoginContext.Provider
      value={{
        logout,
        login,
        setJwt,
        jwt,
        address,
        setAddress,
        handleZkProof,
        zkProofResult,
        signAndSubmitTransaction,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginProvider;
