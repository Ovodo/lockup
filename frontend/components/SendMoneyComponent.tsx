// components/SendMoneyComponent.tsx
"use client";

import clientConfig from "@/config/clientConfig";
import { LoginContext } from "@/contexts/ZkLoginContext";
import { useFonts } from "@/hooks/useFonts";
import { LoginContextType } from "@/types/todo";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import axios from "axios";
import { countries, Country } from "country-data";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import SelectComponent from "./ui/SelectComponent";
import WhiteBackground from "./WhiteBackground";
import { setSlip, Slip } from "@/redux/slices/payment";
import { useDispatch } from "react-redux";

const SendMoneyComponent: React.FC = () => {
  const [sendersCountry, setSenderCountry] = useState<Country | null>(null);
  const [receiversCountry, setReceiverCountry] = useState<Country | null>(null);
  const [sendAmount, setSendAmount] = useState("");
  const [to, setTo] = useState(0);
  const [receiveCountryError, setReceiverCountryError] = useState(false);
  const [senderCountryError, setSenderCountryError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [paymentChannel, setPaymentChannel] = useState<string>("");
  const [paymentChannelError, setPaymentChannelError] = useState(false);
  const [bankDetails, setBankDetails] = useState<string>("");
  const [bankDetailsError, setBankDetailsError] = useState(false);

  const { lexend } = useFonts();
  const router = useRouter();
  const dispatch = useDispatch();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { signAndSubmitTransaction, handleZkProof } = useContext(
    LoginContext
  ) as LoginContextType;

  const fromSymb = sendersCountry?.currencies[0] ?? "";
  const toSymb = receiversCountry?.currencies[0] ?? "";
  const client = useSuiClient();

  const paymentMethods = [
    { value: "bank", name: "Bank Account" },
    { value: "card", name: "Credit/Debit Card" },
    { value: "BTC", name: "Wallet Address" },
  ];

  //-----------------------------------------------------------FUNCTIONS

  const setSender = (e: any) => {
    setSenderCountryError(false);
    setSenderCountry(e);
  };
  const setReceiver = (e: any) => {
    setReceiverCountryError(false);
    setReceiverCountry(e);
  };
  const setAmounts = (e: any) => {
    setAmountError(false);
    setSendAmount(e);
  };

  const handleSubmit = async () => {
    if (!sendersCountry) {
      setSenderCountryError(true);
    }
    if (!receiversCountry) {
      setReceiverCountryError(true);
    }
    if (!sendAmount) {
      setAmountError(true);
    }
    if (!paymentChannel) {
      setPaymentChannelError(true);
    }
    if (!bankDetails) {
      setBankDetailsError(true);
    }

    if (
      senderCountryError || 
      receiveCountryError || 
      amountError || 
      paymentChannelError || 
      bankDetailsError || 
      !sendersCountry || 
      !receiversCountry || 
      !sendAmount || 
      !paymentChannel || 
      !bankDetails
    ) {
      return;
    }

    // Convert the sendAmount (fiat) to SUI using the API
    try {
      const fromSymb = sendersCountry?.currencies[0] ?? "";
      const res = await axios.get(`/api/convert?from=${fromSymb}&to=SUI`);
      const rate = res.data.message;
      const sendAmountSui = (parseFloat(sendAmount) / rate).toFixed(6); // 6 decimals for SUI

      const slip: Slip = {
        sendAmount: parseFloat(sendAmount),
        receiverAmount: (parseFloat(sendAmount) * to).toFixed(
          2
        ) as unknown as number,
        senderCountry: sendersCountry?.alpha3 as string,
        receiverCountry: receiversCountry?.alpha3 as string,
        sendAmountSui: parseFloat(sendAmountSui),
        paymentChannel: paymentChannel,
        bankDetails: bankDetails,
      };

      dispatch(setSlip(slip));
      router.push(`/marketplace/active`);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ?? "Error converting to SUI",
        {}
      );
    }

    // const txb = new Transaction();
    // txb.moveCall({
    //   target: `${clientConfig.PACKAGE_ID}::lockup::create_cross_border_payment`,
    //   arguments: [
    //     txb.object(clientConfig.APP_ID),
    //     txb.object(clientConfig.CLOCK_ID),
    //     txb.pure.u64(sendAmount),
    //     txb.pure.string(sendersCountry?.alpha3 as string),
    //     txb.pure.u64((parseFloat(sendAmount) * to).toFixed(0)),
    //     txb.pure.string(receiversCountry?.alpha3 as string),
    //     txb.pure.u64(30),
    //   ],
    // });

    // const result = await signAndSubmitTransaction(txb, toastId);
    // if (result) {
    //   const eventsResult = await client.queryEvents({
    //     query: { Transaction: result.digest },
    //   });
    //   // console.log(eventsResult, "events");
    //   toast.success("Cross Border Payment Created", { id: toastId });

    //   if (eventsResult) {
    //     const id = eventsResult?.data[0]?.parsedJson as any;
    //     router.push(`/marketplace/active?id=${id.id}`);
    //   }
    // }
  };

  //------------------------------------------------------------------USE EFFECTS

  useEffect(() => {
    if (toSymb) {
      const convert = async () => {
        try {
          const res = await axios.get(
            `/api/convert?from=${fromSymb}&to=${toSymb}`
          );
          setTo(res.data.message);
        } catch (error: any) {
          toast.error(error.response.data.message ?? "error converting");
        }
      };
      convert();
    }
  }, [toSymb]);

  return (
    <div className="flex w-full mx-auto sm:w-[468px] flex-col">
      <div className="h-[24px] w-full mb-[10px] flex items-center justify-center gap-3 bg-[#FFFADB] rounded-sm">
        <p className=" text-sm sm:text-base">{`1 ${fromSymb} = ${
          to ?? ""
        } ${toSymb}*`}</p>
        <p className="text-xs underline">Show fees</p>
      </div>
      <WhiteBackground
        styles={`${lexend.className} w-full  h-max  relative  rounded-lg shadow-sm p-[30px]`}
      >
        <h2 className="text-xl sm:text-2xl text-start font-semibold text-[#212529] mb-5">
          Send money online
        </h2>

        <div className="mb-5 relative">
          <SelectComponent
            error={senderCountryError}
            style="z-50"
            labelStyles="block text-sm font-medium text-header_black mb-[10px]"
            label="Senders's country"
            onChange={setSender}
            items={countries.all as Country[]}
            placeholder="Select country"
            countries={!false}
          />
          {senderCountryError && (
            <p className="text-xs text-error mt-1">
              Please select your country
            </p>
          )}
        </div>

        <div className="relative">
          <SelectComponent
            error={receiveCountryError}
            style="z-40"
            label="Receiver's country"
            labelStyles="block text-sm font-medium text-header_black mb-[10px]"
            onChange={setReceiver}
            items={countries.all as Country[]}
            placeholder="Select country"
            countries={!false}
          />
          {receiveCountryError && (
            <p className="text-xs text-error mt-1">
              Please select the receiver country
            </p>
          )}
        </div>
        <div className="flex w-full mb-5 flex-col">
          <div className="flex w-full gap-2  items-center mt-5 ">
            <div className="">
              <label className="block text-sm font-medium text-header_black mb-2">
                Send amount
              </label>
              <input
                type="text"
                value={sendAmount}
                placeholder="0.00"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    setAmounts(value);
                  }
                }}
                className={`w-full sm:w-[188px] h-[50px] p-4 bg-[#fafafa] border ${
                  amountError ? "border-error" : "border-border"
                } rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <Image
              src={"/assets/icons/exchange.svg"}
              width={16.94}
              height={14}
              className="mt-6"
              alt="exchange"
            />

            <div className="">
              <label className="block text-sm font-medium text-header_black mb-2">
                Receive amount
              </label>
              <input
                type="text"
                placeholder="0.00"
                readOnly
                value={
                  sendAmount ? (parseFloat(sendAmount) * to).toFixed(2) : ""
                }
                className={`w-full sm:w-[188px] h-[50px] p-4 bg-[#fafafa] border ${
                  amountError ? "border-error" : "border-border"
                } rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
          {amountError && (
            <p className="text-xs text-error mt-1">
              Please select an amount to send
            </p>
          )}
        </div>
        <div className="mb-5 relative">
          <SelectComponent
            error={paymentChannelError}
            style="z-50 "
            labelStyles="block text-sm font-medium text-header_black mb-[10px]"
            label="How does your receiver want the money?"
            onChange={(val) => {
              setPaymentChannelError(false);
              setPaymentChannel(val.value);
            }}
            items={[
              { value: "Bank Transfer", name: "Bank Transfer" },
              { value: "Paypal", name: "Paypal" },
              { value: "Google Pay", name: "Google Pay" },
              { value: "Apple Pay", name: "Apple Pay" },
            ]}
            placeholder="Select Payment Channel"
            countries={false}
          />
          {paymentChannelError && (
            <p className="text-xs text-error mt-1">
              Please select a payment channel
            </p>
          )}
        </div>

        <div className="mb-5 relative">
          <label className="block text-sm font-medium text-header_black mb-[10px]">
            Enter Bank Account Details
          </label>
          <textarea
            value={bankDetails}
            onChange={(e) => {
              setBankDetailsError(false);
              setBankDetails(e.target.value);
            }}
            placeholder="Enter account number, bank name, and any other required details"
            className={`w-full h-[120px] p-4 bg-[#fafafa] border ${
              bankDetailsError ? "border-error" : "border-border"
            } rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
          />
          {bankDetailsError && (
            <p className="text-xs text-error mt-1">
              Please enter bank account details
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center h-[50px] gap-2 bg-[#FFDD00]  hover:bg-[#E3C500] text-appBlack font-semibold py-4 px-6 rounded-md mt-5"
        >
          Continue
          <Image
            className={`-rotate-90  relative top-[1px]`}
            src={"/assets/icons/arrow-down.svg"}
            width={10}
            height={17}
            alt="down"
          />
        </button>
      </WhiteBackground>
    </div>
  );
};

export default SendMoneyComponent;
