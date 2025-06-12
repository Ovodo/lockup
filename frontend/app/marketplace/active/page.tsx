"use client";
import { getIntermediaries } from "@/actions/intermediaries";
import IntermediaryRow from "@/components/ui/IntermediaryRow";
import SelectComponent from "@/components/ui/SelectComponent";
import WhiteBackground from "@/components/WhiteBackground";
import { Intermediary } from "@/types/Intermediary";
import { WithId } from "mongodb";
import Image from "next/image";
import { useEffect, useState } from "react";

// --------------------------------------------CONSTANTS
const intermediaries = [
  {
    name: "Nancy Tolu",
    maxAmount: 500000,
    averageTime: "30 minutes",
    fee: 1,
    paymentChannel: "Bank Transfer",
  },
];

const Active = () => {
  // --------------------------------------------VARIABLES
  const [intermediaries, setIntermediaries] = useState<Intermediary[]>([]);
  const [allIntermediaries, setAllIntermediaries] = useState<Intermediary[]>(
    []
  );
  const [paymentChannel, setPaymentChannel] = useState<string>("");
  const [processingTime, setProcessingTime] = useState<string>("");
  const [charge, setCharge] = useState<string>("");

  //-----------------------------------------------------------FUNCTIONS

  // Filter intermediaries based on selected filters
  const filterIntermediaries = () => {
    let filtered = [...allIntermediaries];

    // Filter by payment channel
    if (paymentChannel) {
      filtered = filtered.filter(
        (item) =>
          item.payments &&
          item.payments.some(
            (payment) => payment.modeOfPayment === paymentChannel
          )
      );
    }

    // Filter by charge (fee)
    if (charge) {
      const [minCharge, maxCharge] = charge
        .split(" - ")
        .map((c) => parseFloat(c.replace("%", "")));
      filtered = filtered.filter(
        (item) => item.fee >= minCharge && item.fee <= maxCharge
      );
    }

    // Filter by processing time
    if (processingTime) {
      // Extract min and max minutes from filter string (e.g., "1 - 10 minutes")
      const [minTime, maxTime] = processingTime
        .split(" - ")
        .map((t) => parseInt(t));

      filtered = filtered.filter((item) => {
        // Convert item.averageTime to minutes for comparison
        const timeValue = parseInt(item.averageTime.split(" ")[0]);
        return timeValue >= minTime && timeValue <= maxTime;
      });
    }

    setIntermediaries(filtered);
  };

  //------------------------------------------------------------------USE EFFECTS

  useEffect(() => {
    (async () => {
      const res = await getIntermediaries();
      if (res?.ok) {
        // Fix type conversion by first casting to unknown then to Intermediary[]
        const intermediaryData = res?.data as unknown as Intermediary[];
        setAllIntermediaries(intermediaryData);
        setIntermediaries(intermediaryData);
      }
    })();
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    filterIntermediaries();
  }, [paymentChannel, charge, processingTime]);

  return (
    <section className="px-[5vw] sm:px-[15vw] flex flex-col min-h-[89.76svh] py-[45px]">
      <div className="mb-8">
        <h5 className="font-semibold text-2xl mb-3">Send Money</h5>
        <p className="text-light_ash sm:w-[57%]">
          Explore verified intermediaries ready to facilitate cross-border
          payments. Select the best match based on their ratings, capacity, and
          preferred rates to ensure a secure transaction.
        </p>
      </div>
      <div className="mb-6">
        <WhiteBackground styles="rounded-[12px] gap-4 sm:gap-10 relative flex flex-col sm:flex-row items-center px-6 py-8 sm:p-5  w-full">
          <SelectComponent
            labelStyles="block text-sm font-medium text-header_black mb-[10px]"
            zIndex={50}
            style="w-full lg:w-[204px]"
            onChange={(val) => setPaymentChannel(val.value)}
            items={[
              { value: "", name: "All Channels" },
              { value: "Bank Transfer", name: "Bank Transfer" },
              { value: "Paypal", name: "Paypal" },
              { value: "Google Pay", name: "Google Pay" },
              { value: "Apple Pay", name: "Apple Pay" },
            ]}
            placeholder="Select Payment Channel"
            countries={false}
            label="Filter by Payment Channel"
          />
          <SelectComponent
            labelStyles="block text-sm font-medium text-header_black mb-[10px]"
            zIndex={40}
            style="w-full lg:w-[204px]"
            onChange={(val) => setCharge(val.value)}
            items={[
              { value: "", name: "All Charges" },
              { value: "1 - 2", name: "1% - 2%" },
              { value: "3 - 5", name: "3% - 5%" },
              { value: "6 - 7", name: "6% - 7%" },
            ]}
            placeholder="Select Charge"
            countries={false}
            label="Filter by Charge"
          />
          <SelectComponent
            labelStyles="block text-sm font-medium text-header_black mb-[10px]"
            zIndex={30}
            style="w-full lg:w-[204px]"
            onChange={(val) => setProcessingTime(val.value)}
            items={[
              { value: "", name: "All Processing Times" },
              { value: "1 - 10", name: "1 - 10 minutes" },
              { value: "11 - 20", name: "11 - 20 minutes" },
              { value: "21 - 30", name: "21 - 30 minutes" },
            ]}
            placeholder="Select Processing Time"
            countries={false}
            label="Filter by Processing Time"
          />
        </WhiteBackground>
      </div>
      <WhiteBackground styles="h-[60vh] overflow-y-scroll p-6 rounded-[16px]">
        <div className="hidden lg:grid border-b w-full mb-2 border-[#c4c4c4] pb-3 grid-cols-[1.5fr,1.5fr,0.8fr]">
          <h6 className="font-medium text-xl">Intermediaries</h6>
          <h6 className="font-medium text-xl flex items-center justify-center ">
            Payment Channel
          </h6>
          <h6 className="font-medium text-xl"></h6>
        </div>

        {intermediaries.length > 0 ? (
          intermediaries.map((item, index) => (
            <IntermediaryRow item={item} key={index.toString()} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-[40vh]">
            <Image
              src="/assets/icons/search.svg"
              alt="No results"
              width={48}
              height={48}
              className="mb-4 opacity-50"
            />
            <h3 className="font-medium text-xl text-center mb-2">
              No intermediaries found
            </h3>
            <p className="text-light_ash text-center">
              No intermediaries match your selected filters. Try adjusting your
              filters or check back later.
            </p>
          </div>
        )}
      </WhiteBackground>
    </section>
  );
};

export default Active;
