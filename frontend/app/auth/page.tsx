"use client";

import Loading from "@/components/Loading";
import { useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { LoginContext } from "@/contexts/ZkLoginContext";
import { JwtPayload, LoginContextType } from "@/types/todo";
import { generateUserSalt } from "@/lib/utils";
import { jwtToAddress } from "@mysten/sui/zklogin";
import clientConfig from "@/config/clientConfig";

export default function Page() {
  const { setJwt, address, jwt, setAddress, handleZkProof } = useContext(
    LoginContext
  ) as LoginContextType;
  const hash =
    typeof window !== "undefined" ? window.location.hash.substring(1) : "?"; // Remove the leading '#'

  const urlParams = new URLSearchParams(hash);
  useEffect(() => {
    const idToken = urlParams.get("id_token");
    console.log(idToken, "token");

    const handleAuth = async () => {
      if (idToken) {
        try {
          const decodedJwt = jwtDecode<JwtPayload>(idToken);

          // Update the LoginContext with the decoded JWT
          window.sessionStorage.setItem("jwt", idToken);
          setJwt(idToken);
          const userSalt = generateUserSalt(
            decodedJwt,
            clientConfig.MASTER_SEED
          );
          const zkLoginUserAddress = jwtToAddress(idToken, userSalt);
          window.sessionStorage.setItem("address", zkLoginUserAddress);
          await handleZkProof(idToken as string);
          window.location.href = "/";
        } catch (error) {
          console.error("Failed to decode JWT:", error);
        }
      }
    };
    handleAuth();
  }, []);

  return <Loading />;
}
