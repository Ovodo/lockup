"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { useContext, useEffect } from "react";
import { Transaction } from "@mysten/sui/transactions";
import clientConfig from "@/config/clientConfig";
import { usePathname, useRouter } from "next/navigation";
import {
  useConnectWallet,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useWallets,
} from "@mysten/dapp-kit";
import { AuthProvider, EnokiWallet, isEnokiWallet } from "@mysten/enoki";
import { LoginContext } from "@/contexts/ZkLoginContext";
import { LoginContextType } from "@/types/todo";

export default function ProfilePopover() {
  const router = useRouter();
  const pathname = usePathname();
  const { login, address, logout } = useContext(
    LoginContext
  ) as LoginContextType;

  const wallets = useWallets().filter(isEnokiWallet);
  const walletsByProvider = wallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<AuthProvider, EnokiWallet>()
  );

  const googleWallet = walletsByProvider.get("google");
  const facebookWallet = walletsByProvider.get("facebook");
  useEffect(() => {
    const registerUser = async () => {
      try {
        const txb = new Transaction();

        txb.moveCall({
          target: `${clientConfig.PACKAGE_ID}::lockup::create_cross_border_payment`,
          arguments: [txb.object(clientConfig.APP_ID), txb.object("0x6")],
        });

        // const res = await executeTransactionBlockWithoutSponsorship({
        //   tx: txb,
        //   options: {    new Map<AuthProvider, EnokiWallet>()

        //     showEffects: true,
        //     showObjectChanges: true,
        //   },
        // });
      } catch (error) {}
    };

    if (address) {
      pathname === "/" ? router.push("/dashboard") : null;
      // window.location.href = "/dashboard";
    }
    console.log("connected", address);
  }, [address]);

  if (address) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="">
            <Button
              className="hidden bg-appBlack text-white text-sm sm:block  hover:opacity-80  rounded-[12px] w-max px-4 h-[53px]"
              variant={"secondary"}
            >
              <span>{`${address?.slice(0, 5)}...${address?.slice(63)}`}</span>
            </Button>
            <Avatar className="block sm:hidden">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="text-black">CN</AvatarFallback>
            </Avatar>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-max p-0">
          <Card className="border-none justify-center  h-[80px] w-[150px] sm:w-[200px] bg-appBlack text-white flex flex-col items-center shadow-none">
            <CardContent className="p-0">
              <div className="flex flex-row gap-1 items-center">
                <div className="flex flex-row text-sm gap-1">
                  <span>{`${address?.slice(0, 5)}...${address?.slice(
                    63
                  )}`}</span>
                  <a
                    href={`https://suiscan.xyz/devnet/account/${address}`}
                    target="_blank"
                  >
                    <ExternalLink width={12} />
                  </a>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex m-0 p-0">
              <Button
                variant={"destructive"}
                size={"sm"}
                className="w-full active:scale-105 p-0 h-max text-center"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button
      className="bg-appBlack text-white  hover:opacity-80 text-sm rounded-[12px] w-[100px] sm:w-[154px] h-[53px]"
      onClick={login}
    >
      <span className="hidden sm:flex">Connect Wallet</span>
      <span className="block sm:hidden">Connect </span>
    </Button>
  );
}
