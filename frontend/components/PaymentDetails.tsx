"use client";
import Image from "next/image";
import SelectComponent from "./ui/SelectComponent";
import { countries, Country } from "country-data";
import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { PaymentDetails as Payment } from "@/types/Intermediary";

const PaymentDetails = ({
  item,
  remove,
  index,
  setPayment,
  length,
}: {
  item: Payment;
  remove: any;
  index: number;
  length: number;
  setPayment: React.Dispatch<React.SetStateAction<Payment>>;
}) => {
  console.log(item, "item");
  // Controlled state, initialized from item
  const [country, setCountry] = useState<Country | null>(null);
  const [amount, setAmount] = useState<string>(item.amount || "");
  const [bankCode, setBankCode] = useState<number>(item.bankCode || 0);
  const [banks, setBanks] = useState<any[]>([]);
  const [bankName, setBankName] = useState<string>(item.bank || "");
  const [accntName, setAccntName] = useState<string>(item.accountName || "");
  const [accntNum, setAccntNum] = useState<string>(item.accountNumber || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [modeOfPayment, setModeOfPayment] = useState<string>(
    item.modeOfPayment || ""
  );
  const [showDetails, setShowDetails] = useState(false);

  const setMode = (params: any) => {
    setModeOfPayment(params.value);
    setShowDetails(true);
    // Update parent
    setPayment((prev) => ({
      ...prev,
      modeOfPayment: params.value,
    }));
  };

  // Effect to auto-fetch account name when bank and account number are set
  useEffect(() => {
    const fetchAccountName = async () => {
      if (bankCode && accntNum.length === 10) {
        setIsVerifying(true);
        setVerifyError("");
        try {
          // Replace this with your real API endpoint and key
          // Example: Paystack endpoint
          const res = await axios.get(
            `https://api.paystack.co/bank/resolve?account_number=${accntNum}&bank_code=${bankCode}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_KEY}`,
              },
            }
          );
          setAccntName(res.data.data.account_name || "");
          setPayment((prev) => ({
            ...prev,
            accountName: res.data.data.account_name || "",
          }));
        } catch (err: any) {
          setAccntName("");
          setVerifyError("Could not verify account. Check details.");
        } finally {
          setIsVerifying(false);
        }
      } else {
        setAccntName("");
        setVerifyError("");
      }
    };
    fetchAccountName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCode, accntNum]);

  // a use effect to fetch banks based on the selected country
  useEffect(() => {
    const fetchBanks = async () => {
      if (country) {
        try {
          const res = await axios.get(
            `https://api.paystack.co/bank?country=${country.name}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_KEY}`,
              },
            }
          );
          setBanks(res.data.data);
        } catch (err) {
          console.error("Error fetching banks:", err);
        }
      }
    };
    fetchBanks();
  }, [country]);

  // Sync local state with item prop (for editing existing payments)
  useEffect(() => {
    // Only update if we have meaningful data or when fields should be cleared
    if (item) {
      setAmount(item.amount || "");
      setBankCode(item.bankCode || 0);
      setBankName(item.bank || "");
      setAccntName(item.accountName || "");
      setAccntNum(item.accountNumber || "");
      setModeOfPayment(item.modeOfPayment || "");

      // Set country if possible
      if (item.currency) {
        const found = (countries.all as Country[]).find(
          (c) => c.currencies?.[0] === item.currency
        );
        if (found) setCountry(found);
      } else {
        setCountry(null);
      }
    }
  }, [item]);

  // Only allow supported countries for bank selection
  const supportedCountries = [
    { name: "Ghana", value: "ghana", alpha2: "GH" },
    { name: "Kenya", value: "kenya", alpha2: "KE" },
    { name: "Nigeria", value: "nigeria", alpha2: "NG" },
    { name: "South Africa", value: "south africa", alpha2: "ZA" },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <p className="text-appBlack2 font-semibold text-base leading-5">
          Item {index + 1}
        </p>
        <button onClick={() => setShowDetails(!showDetails)}>
          <Image
            className={`duration-200 ${
              showDetails ? "rotate-180 z-20" : "rotate-0"
            }`}
            src={"/assets/icons/arrow-down.svg"}
            width={12}
            height={12}
            alt="down"
          />
        </button>
      </div>
      <div className="mt-2 flex gap-5 items-center w-full">
        <SelectComponent
          style="z-[100] "
          labelStyles="block text-sm font-medium text-header_black mb-[10px]"
          label=""
          onChange={(c: Country) => {
            setCountry(c);
            setPayment((prev) => ({
              ...prev,
              currency: c.currencies?.[0] || "",
            }));
          }}
          items={
            (countries.all as Country[]).filter((country) =>
              supportedCountries.some(
                (supported) => supported.alpha2 === country.alpha2
              )
            )
            // .map((country) => ({
            //   ...country,
            //   name:
            //     country.currencies && country.currencies.length > 0
            //       ? country.currencies[0]
            //       : country.name,
            // }))
          }
          placeholder="Select Currency"
          countries={true}
          defCountry={country?.name ?? ""}
        />
        <SelectComponent
          style="z-[100] "
          onChange={(val: any) => {
            setAmount(val.value);
            setPayment((prev) => ({
              ...prev,
              amount: val.value,
            }));
          }}
          labelStyles="block text-sm font-medium text-header_black mb-[10px]"
          items={[
            { value: "100 - 1000", name: "100 - 1000" },
            { value: "1000 - 10000", name: "1000 - 10000" },
            { value: "10000 - 100000", name: "10000 - 100000" },
            { value: "100000 - 500000", name: "100000 - 500000" },
          ]}
          placeholder="Select Amount"
          countries={false}
          label=""
          def={item.amount}
        />
        <SelectComponent
          style={""}
          zIndex={10 / (index + 1)}
          onChange={setMode}
          labelStyles="block text-sm font-medium text-header_black mb-[10px]"
          items={[
            { value: "Bank Transfer", name: "Bank Transfer" },
            { value: "Paypal", name: "Paypal" },
            { value: "Google Pay", name: "Google Pay" },
            { value: "Apple Pay", name: "Apple Pay" },
          ]}
          placeholder="Mode of Transaction"
          countries={false}
          label=""
          def={item.modeOfPayment}
        />
      </div>

      <AnimatePresence>
        {/* {showDetails && (
          <motion.div
            className="mt-4 flex flex-col gap-5"
            initial={{ height: 0, opacity: 1 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            > */}
        {modeOfPayment === "Bank Transfer" ? (
          <motion.div
            animate={{ height: showDetails ? "300px" : "0", opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`border-[#EBECE6] overflow-hidden ${
              showDetails ? "h" : "h-"
            }  flex flex-col items-center justify-center rounded-[8px] border mt-2.5 w-full`}
          >
            <div
              className={`flex w-full ${
                showDetails ? "translate-y-0" : "-translate-y-full"
              } flex-col gap-[19px] duration-300 py-4 px-5`}
            >
              <div className="mb-2">
                <label className="block text-[#212529] text-sm font-bold mb-2">
                  Bank Name
                </label>
                <SelectComponent
                  style="z-[100] w-[100%]"
                  labelStyles=""
                  label=""
                  onChange={(option: any) => {
                    setBankName(option.name);
                    setBankCode(option.code);
                    setPayment((prev) => ({
                      ...prev,
                      bankCode: option.code,
                      bank: option.name,
                    }));
                  }}
                  items={banks.map((b: any) => ({
                    value: b.code,
                    name: b.name,
                    code: b.code,
                  }))}
                  placeholder="Select Bank"
                  countries={false}
                  def={bankName || item.bank}
                />
              </div>
              <div className="">
                <label className="block text-[#212529] text-sm font-bold mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  className="w-[100%] placeholder:text-[#212529] placeholder:font-light p-3 text-sm bg-[#FAFAFA] border border-gray-[#EBECE6] rounded-md text-header_black font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Account Name"
                  value={accntName}
                  readOnly
                />
                {isVerifying && (
                  <p className="text-xs text-blue-500 mt-1">Verifying...</p>
                )}
                {verifyError && (
                  <p className="text-xs text-red-500 mt-1">{verifyError}</p>
                )}
              </div>
              <div className="">
                <label className="block text-[#212529] text-sm font-bold mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  className="w-[100%] placeholder:text-[#212529] placeholder:font-light p-3 text-sm bg-[#FAFAFA] border border-gray-[#EBECE6] rounded-md text-header_black font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Account Number"
                  value={accntNum}
                  maxLength={16}
                  onChange={(e) => {
                    setAccntNum(e.target.value);
                    setPayment((prev) => ({
                      ...prev,
                      accountNumber: e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            animate={{ height: showDetails ? "300px" : "0", opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`border-[#EBECE6] overflow-hidden ${
              showDetails ? "h" : "h-"
            }  flex flex-col items-center justify-center rounded-[8px] border mt-2.5 w-full`}
          >
            <div className="border-[#EAECF0] mb-5 w-[48px] h-[48px] flex items-center justify-center border rounded-[10px]">
              <Image
                src={"/icons/search.svg"}
                width={24}
                height={24}
                alt="search"
              />
            </div>
            <h5 className="text-[#101828] mb-2 font-semibold text-lg">
              No Mode of Transaction Selected
            </h5>
            <p className="text-[#475467] text-sm">
              Select a mode to see the requirements
            </p>
          </motion.div>
        )}
        {/* </motion.div> */}
        {/* )} */}
      </AnimatePresence>
      {index !== length - 1 && (
        <button
          onClick={() => remove(item)}
          className={`mt-4 ${
            showDetails ? "hidden" : "flex"
          }  ml-auto active:scale-95 cursor-pointer items-center`}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.625 4.125l-.465 7.519c-.119 1.92-.178 2.881-.66 3.572a3 3 0 01-.9.846c-.718.438-1.68.438-3.605.438-1.928 0-2.891 0-3.61-.439a3 3 0 01-.901-.847c-.481-.692-.54-1.654-.656-3.578l-.453-7.511M2.25 4.125h13.5m-3.708 0l-.512-1.056c-.34-.702-.51-1.053-.804-1.271a1.505 1.505 0 00-.206-.13C10.195 1.5 9.806 1.5 9.026 1.5c-.8 0-1.199 0-1.53.176a1.5 1.5 0 00-.208.134c-.297.228-.463.591-.794 1.318l-.454.997M7.125 12.375v-4.5M10.875 12.375v-4.5"
              stroke="#F04438"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-[#F04438] text-sm ml-1">Remove</p>
        </button>
      )}
    </div>
  );
};

export default PaymentDetails;
