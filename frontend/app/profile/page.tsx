"use client";
import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import SelectComponent from "@/components/ui/SelectComponent";
import AppButton from "@/components/ui/AppButton";
import WhiteBackground from "@/components/WhiteBackground";
import { countries, Country } from "country-data";
import PaymentDetails from "@/components/PaymentDetails";
import {
  Intermediary,
  PaymentDetails as PaymentDetailsType,
} from "@/types/Intermediary";
import { LoginContext } from "@/contexts/ZkLoginContext";
import { LoginContextType } from "@/types/todo";
import {
  addPayment,
  getIntermediary,
  removePayment,
  updatePersonalDetails,
} from "@/actions/intermediaries";
import toast from "react-hot-toast";

const steps = [
  { name: "Step 1", desc: "Personal details", active: false },
  { name: "Step 2", desc: "Sender details", active: true },
  { name: "Step 3", desc: "Receiver details", active: false },
];

export default function Home() {
  // State for payment channels
  const [intermediary, setIntermediary] = useState<Intermediary | null>(null);
  const [payment, setPayment] = useState<PaymentDetailsType>({
    currency: "",
    amount: "",
    bank: "",
    bankCode: 0,
    accountName: "",
    accountNumber: "",
    modeOfPayment: "",
  });
  const [payments, setPayments] = useState<PaymentDetailsType[]>(
    intermediary?.payments || []
  );
  const [suiWallet, setSuiWallet] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState<Country>();
  const [step, setStep] = useState(1);
  const { address } = useContext(LoginContext) as LoginContextType;
  const [isLoading, setIsLoading] = useState(false);

  const [transferRate, setTransferRate] = useState("");
  const [senderCountryError, setSenderCountryError] = useState(false);

  const active = true;
  // Add new payment and update intermediary's payments in DB
  const addNewCurrency = async () => {
    if (address) {
      const res = await addPayment(address as string, payment);
      if (res.ok) {
        await fetchIntermediary();
        toast.success(res.message as string);
      }
      if (res.exist) {
        toast.error("Payment already exists");
      } else if (res.ok == false) {
        toast.error("Database Error");
      }
    }
  };

  // Function to remove a specific payment by index
  const removeCurrency = async (index: number) => {
    const paymentToRemove = payments[index];
    if (!address || !paymentToRemove) return;

    const res = await removePayment(address, paymentToRemove);
    if (res.ok) {
      await fetchIntermediary();
      toast.success(res.message || "Payment removed successfully");
    } else {
      toast.error(res.message || "Failed to remove payment");
    }
  };

  const nextStep = async (item: string) => {
    if (
      intermediary?.name == fullName &&
      intermediary?.country == country?.name
    ) {
      setStep(2);
      return;
    }
    setIsLoading(true);
    if (!address || !fullName || !country) {
      toast.error("Fill in all details");
      setIsLoading(false);
      return;
    }

    const res = await updatePersonalDetails(
      address as string,
      fullName,
      country?.name
    );

    if (res.ok) {
      setIsLoading(false);
      setStep(2);
    } else {
      setIsLoading(false);
      toast.error("Database Error");
    }
  };
  const prevStep = () => {
    setStep(1);
  };

  console.log(intermediary, "intermediary");
  const fetchIntermediary = async () => {
    const res = await getIntermediary(address as string);
    if (res?.ok) {
      setIntermediary(res.data as unknown as Intermediary);
      setFullName(res?.data?.name);
      const country = countries.all.find(
        (item) => item.name == res?.data?.country
      );
      if (country) {
        setCountry(country);
      }
      // Initialize payments from DB if available, else default to one empty object
      if (Array.isArray(res?.data?.payments) && res.data.payments.length > 0) {
        setPayments([
          ...res.data.payments,
          {
            currency: "",
            amount: "",
            bank: "",
            bankCode: 0,
            accountName: "",
            accountNumber: "",
            modeOfPayment: "",
          },
        ]);
      } else {
        setPayments([
          {
            currency: "",
            amount: "",
            bank: "",
            bankCode: 0,
            accountName: "",
            accountNumber: "",
            modeOfPayment: "",
          },
        ]);
      }
    }
  };

  useEffect(() => {
    if (!address) {
      window.location.href = "/";
    }
    fetchIntermediary();
  }, [address, step]);

  console.log(payments, "payments");
  return (
    <div className="min-h-screen pb-[224px]  w-full bg-blue-50 flex flex-col justify-start items-center">
      {/* Intermediary 1 */}
      <div className="w-[95%] max-w-[1337px] mb-[44.6px] bg-white mt-[5vh] h-max p-10 flex flex-col gap-4 rounded-[20px] shadow-[4px_4px_33px] shadow-black/5">
        <Image
          src="/icons/logo.svg"
          width={125}
          height={21.54}
          className=""
          alt=""
        />
        <h1 className="font-bold text-2xl leading-[28px] ">
          Become an Intermediary
        </h1>
        <p className="text-[#757575]  text-base font-semibold">
          As Intermediary here, you will be tasked with making SUI available in
          your wallet. This SUI will be Locked up to facilitate transaction and
          you will earn income from carrying out transactions.
        </p>
      </div>
      <WhiteBackground styles="rounded-[24px] h-max p-10 w-[90%] max-w-[1317px]">
        <div className="flex items-center gap-2">
          {steps.map((item, index) => {
            return (
              <div className="w-1/3 flex flex-col gap-5" key={item.name}>
                <div className="flex items-center gap-1">
                  <p
                    className={`font-bold text-lg ${
                      step == index + 1 ? "text-black" : "text-black/50"
                    }`}
                  >
                    {item.name}
                  </p>
                  <p
                    className={`font-semibold text-base ${
                      step == index + 1 ? "text-[#757575]" : "text-[#757575]/50"
                    } `}
                  >
                    {item.desc}
                  </p>
                </div>
                <div
                  className={`h-[11px] w-full ${
                    step == index + 1 ? "bg-appBlue" : "bg-[#F0F0F0]"
                  } rounded-[8px]`}
                />
              </div>
            );
          })}
        </div>

        <p className="my-[45px] text-black font-medium text-lg">
          Kindly provide the correct information below
        </p>
        {/* Step 1 */}
        {step == 1 && (
          <div>
            <div className="flex flex-col gap-[27px]">
              <div className="">
                <label className="block text-[#212529] text-base font-bold mb-2.5">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-[60%] placeholder:text-[#212529] placeholder:font-light p-3 text-sm bg-[#FAFAFA] border border-gray-[#EBECE6] rounded-md text-header_black font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <SelectComponent
                error={senderCountryError}
                defCountry={intermediary?.country}
                style="z-50 w-[60%]"
                labelStyles="block text-[#212529] text-base font-bold mb-2.5"
                label="Country of Residence"
                onChange={setCountry}
                items={countries.all as Country[]}
                placeholder="Select country"
                countries={!false}
              />
              <div className="">
                <label className="block text-[#212529] text-base font-bold mb-2.5">
                  Average Availability
                </label>
                <input
                  type="text"
                  className="w-[60%] placeholder:text-[#212529] placeholder:font-light p-3 text-sm bg-[#FAFAFA] border border-gray-[#EBECE6] rounded-md text-header_black font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Select Availability"
                  value={suiWallet}
                  onChange={(e) => setSuiWallet(e.target.value)}
                />
              </div>
            </div>
            <AppButton
              title="Next"
              isLoading={isLoading}
              style="w-full text-white font-bold mt-[64px]"
              action={nextStep}
            />
          </div>
        )}
        {/* Step 2 */}
        {step == 2 && (
          <div className="border-[#EBECE6] p-5 flex flex-col border-[1px] rounded-[4px] min-h-[40vh]">
            <h6 className="text-[#212529] mb-4 font-bold">
              Amount you can Send
            </h6>
            <div className="border-[#EBECE6] w-[65%] p-5 flex flex-col gap-4 border-[1px] rounded-[4px] h-max">
              {payments.map((payment, index) => (
                <PaymentDetails
                  key={index}
                  item={payment}
                  index={index}
                  length={payments.length}
                  remove={() => removeCurrency(index)}
                  setPayment={(updatedPayment) => {
                    // Update the specific payment item in the payments array
                    const newPayments = [...payments];
                    if (typeof updatedPayment === "function") {
                      // Handle functional updates
                      newPayments[index] = updatedPayment(payment);
                    } else {
                      // Handle object updates
                      newPayments[index] = updatedPayment as PaymentDetailsType;
                    }
                    setPayments(newPayments);
                    // Also update the current payment state
                    setPayment(newPayments[index]);
                  }}
                />
              ))}
            </div>
            <AppButton
              title="Add New Currency"
              style="border-appBlue mt-4 border active:scale-95 bg-white w-[160px] text-appBlue"
              action={addNewCurrency}
            />
          </div>
        )}
        {step == 2 && (
          <div className="flex items-center gap-16">
            <AppButton
              title="Previous"
              style="w-full text-appBlue  hover:bg-slate-50 border-appBlue max-h-[52px] bg-white font-bold mt-[64px]"
              action={prevStep}
            />
            <AppButton
              title="Next"
              isLoading={isLoading}
              style="w-full text-white max-h-[52px] font-bold mt-[64px]"
              action={nextStep}
            />
          </div>
        )}
      </WhiteBackground>
    </div>
  );
}

{
  /* Payment Channel */
}
//    <div className="md:col-span-1 bg-white p-6 rounded-lg shadow order-1 md:order-none">
//    <h3 className="font-semibold text-lg">Payment Channel</h3>
//    <div className="space-y-4 mt-4">
//      {/* Payment Channel Selections */}
//      {selectedPayments.map((payment, index) => {
//        return (
//          <SelectComponent
//            key={index}
//            zIndex={50 - index * 10}
//            label={`Set-up Payment Channel ${index + 1}`}
//            onChange={setSuiWallet}
//            items={[
//              { value: "bank_account", name: "Bank Account" },
//              { value: "crypto_wallet", name: "Crypto Wallet" },
//            ]}
//            placeholder="Select Option"
//            countries={false}
//          />
//        );
//      })}

//      {/* SUI Wallet Address */}
//      <div>
//        <label className="block text-gray-700 text-sm font-medium mb-1">
//          SUI Wallet Address
//        </label>
//        <input
//          type="text"
//          className="w-full p-3 text-sm bg-[#FAFAFA] border border-gray-[#EBECE6] rounded-md text-header_black font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
//          placeholder="1234-1234-1234-1234"
//          value={suiWallet}
//          onChange={(e) => setSuiWallet(e.target.value)}
//        />
//      </div>

//      {/* Transfer Rate % */}
//      <SelectComponent
//        onChange={setTransferRate}
//        items={[
//          { value: "1", name: "1%" },
//          { value: "2", name: "2%" },
//          { value: "3", name: "3%" },
//          { value: "4", name: "4%" },
//          { value: "5", name: "5%" },
//          { value: "10", name: "10%" },
//          { value: "15", name: "15%" },
//          { value: "20", name: "20%" },
//        ]}
//        placeholder="Select Option"
//        countries={false}
//        label="Transfer Rate %"
//      />
//    </div>

//    {/* <button className='mt-4 w-full bg-[#0057DB] text-white p-2 rounded hover:bg-blue-700'>
//      Confirm
//    </button> */}
//    <AppButton title="Confirm" style="mt-4 " href="/profile" />
//  </div>

//  {/* Bank Account */}
//  <div className="w-full md:col-span-1 bg-white p-6 rounded-lg shadow order-4 md:order-none self-start">
//    <h3 className="font-semibold text-lg">Bank Account</h3>
//    <div className="space-y-4 mt-4">
//      {[
//        "Bank Name",
//        "Account Name",
//        "Account Number",
//        "Bank Location",
//      ].map((field, index) => (
//        <div key={index}>
//          <label className="block text-gray-700 text-sm font-medium mb-1">
//            {field}
//          </label>
//          <input
//            type="text"
//            className="w-full p-3 text-sm bg-[#FAFAFA] border border-gray-[#EBECE6] rounded-md text-header_black font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
//            placeholder={`Enter ${field}`}
//          />
//        </div>
//      ))}
//    </div>

//    <AppButton title="Save" style="mt-4 " href="/profile" />
//  </div>
