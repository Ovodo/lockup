"use client";
import { TransactionInProgress } from "@/actions/transactions";
import AppButton from "@/components/ui/AppButton";
import WhiteBackground from "@/components/WhiteBackground";
import clientConfig from "@/config/clientConfig";
import { LoginContext } from "@/contexts/ZkLoginContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setActiveTransaction } from "@/redux/slices/transactions";
import { Intermediary } from "@/types/Intermediary";
import { LoginContextType } from "@/types/todo";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useState } from "react";
import toast from "react-hot-toast";

const ConfirmIntermediaryModal = ({
  close,
  item,
  proceed,
}: {
  close: (e: boolean) => void;
  proceed: (e: boolean) => void;
  item: Intermediary;
}) => {
  // --------------------------------------------VARIABLES
  const [disabled, setDisabled] = useState(true);
  const router = useRouter();
  const account = useCurrentAccount();
  const address = account?.address;
  const {
    sendAmount,
    senderCountry,
    receiverAmount,
    receiverCountry,
    sendAmountSui,
  } = useAppSelector((state) => state.payment);
  const { signAndSubmitTransaction, handleZkProof } = useContext(
    LoginContext
  ) as LoginContextType;
  const client = useSuiClient();

  const dispatch = useAppDispatch();

  const searchParams = useSearchParams();
  const id = searchParams?.get("id") as string;

  //-----------------------------------------------------------FUNCTIONS
  console.log(address, "address");

  const confirmAndNotifyIntermediary = async () => {
    const toastId = toast.loading("Creating Payment...");
    if (
      !sendAmount ||
      !receiverAmount ||
      !sendAmountSui ||
      !senderCountry ||
      !receiverCountry ||
      !sendAmountSui
    ) {
      toast.error("Please fill in all fields", { id: toastId });
      return;
    }
    try {
      const txb = new Transaction();

      txb.moveCall({
        target: `${clientConfig.PACKAGE_ID}::lockup::create_cross_border_payment`,
        arguments: [
          txb.object(clientConfig.APP_ID),
          txb.object(clientConfig.CLOCK_ID),
          txb.pure.u64(sendAmount),
          txb.pure.string(senderCountry),
          txb.pure.u64(receiverAmount),
          txb.pure.string(receiverCountry),
          txb.pure.u64(sendAmountSui),
          txb.pure.address(item.address as string),
        ],
      });

      const result = await signAndSubmitTransaction(txb, toastId);
      console.log(result, "result");
      if (result) {
        const eventsResult = await client.queryEvents({
          query: { Transaction: result.digest },
        });
        // console.log(eventsResult, "events");
        toast.success("Cross Border Payment Created", { id: toastId });

        // if (eventsResult) {
        //   const id = eventsResult?.data[0]?.parsedJson as any;
        //   router.push(`/marketplace/active?id=${id.id}`);
        // }
      }

      // const res: any = await executeTransactionBlockWithoutSponsorship({
      //   tx: txb,
      //   options: {
      //     showEffects: true,
      //     showObjectChanges: true,
      //     showEvents: true,
      //   },
      // });
      // console.log(res);
      // const transactionId = await TransactionInProgress(id, address as string);
      // dispatch(setActiveTransaction(transactionId?.toString() as string));
      // toast.success("Intermediary Selected", { id: toastId });
    } catch (error) {
      toast.error("Error", { id: toastId });
      console.error(error);
    }
  };

  //------------------------------------------------------------------USE EFFECTS

  return (
    <WhiteBackground styles="p-10 w-[90vw] lg:w-[797px] h-max">
      <div>
        <div className="mb-2 sm:mb-4">
          <h6 className="text-base sm:text-2xl mb-2 text-black font-medium">
            Confirm Intermediary Selection
          </h6>
          <p className="text-sm sm:text-lg text-[#757575]">
            Review the intermediary details before proceeding with your
            transaction.
          </p>
        </div>
        <div className=" mt-8 lg:mt-0 grid gap-y-2  lg:gap-y-3 grid-cols-1 lg:grid-cols-[1fr,1.3fr]">
          <p className="text-[#757575] text-sm sm:text-xl">
            Intermediarys&apos; Name:
          </p>
          <p className="text-[#1b1b1b] font-semibold text-lg sm:text-2xl">
            {item.name}
          </p>
          <p className="text-[#757575] text-sm sm:text-xl">Ratings</p>
          <p className="text-[#1b1b1b] flex items-center font-semibold text-lg sm:text-2xl">
            4.8/5.0{" "}
            <Image
              src={"assets/icons/star.svg"}
              width={24}
              height={24}
              alt="star"
            />
          </p>
          <p className="text-[#757575] text-sm sm:text-xl">Charge Rate:</p>
          <p className="text-[#1b1b1b] font-semibold text-base sm:text-2xl">
            0.7 SUI (₦1,400)
          </p>
          <p className="text-[#757575] text-sm sm:text-xl">
            Maximum Transaction Capacity:
          </p>
          <p className="text-[#1b1b1b] font-semibold text-lg sm:text-2xl">{`#${item?.maxAmount?.toLocaleString()}`}</p>
          <p className="text-[#757575] center-all text-sm lg:text-xl">
            Bank Details:
          </p>
          <div className="grid gap-y-1 grid-cols-2">
            <p className="text-[#1b1b1b] font-bold text-base sm:text-2xl">
              Bank Name:
            </p>
            <p className="text-[#757575] center-all text-sm lg:text-xl">
              First Bank Nigeria
            </p>
            <p className="text-[#1b1b1b] font-bold text-base sm:text-2xl">
              Account Name:
            </p>
            <p className="text-[#757575] center-all text-sm lg:text-xl">
              Nancy Tolu
            </p>
            <p className="text-[#1b1b1b]  font-bold text-base sm:text-2xl">
              Account Number:
            </p>
            <p className="text-[#757575]  center-all text-sm lg:text-xl">
              0767656434
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 sm:mt-16">
        <div className="flex items-center mb-4 gap-4">
          <input
            type="checkbox"
            onChange={() => setDisabled(!disabled)}
            className="text-appBlue"
          />
          <p className="text-[#666666] text-xs sm:text-xl">
            Once confirmed, you will review the transaction summary in the next
            step
          </p>
        </div>
        <AppButton
          disabled={disabled}
          action={() => {
            confirmAndNotifyIntermediary();
            router.push(`/notification?id=${id}`);
          }}
          title="Proceed to Send Money"
          style="w-full disabled:bg-[#c4c4c4] bg-appBlue text-white"
        />
        <button
          onClick={() => close(false)}
          className="w-full hover:scale-[.98] duration-300 h-[53px] border mt-4 rounded-[8px] border-appBlue text-appBlue"
        >
          Cancel
        </button>
        {/* <AppButton
          href='/'
          title='Cancel'
          style='w-full bg-transparent mt-2 text-appBlue'
        /> */}
      </div>
    </WhiteBackground>
  );
};

export default ConfirmIntermediaryModal;
