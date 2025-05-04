"use client";
import All from "@/components/notification/All";
import Image from "next/image";
import React, { useState } from "react";

const NotificationPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Sender", "Intermediary"];

  const getContent = () => {
    switch (activeFilter) {
      case "Sender":
        return "Sender";
      case "Intermediary":
        return "Showing Intermediary Content";
      default:
        return <All />;
    }
  };
  return (
    <div className="pt-6  w-[90%] md:w-[70%] mx-auto">
      <div className="flex pb-[20px] justify-between items-center">
        <div className="flex gap-2 md:gap-6">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeFilter === filter
                  ? "bg-[#1B1B1B] text-white"
                  : "bg-none text-black"
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="border text-[10px] cursor-pointer flex items-center  gap-1 md:gap-2 font-bold border-[#999999] p-[8px] rounded-[8px]">
          <span className="text-[10px] text-nowrap"> Filter By:</span>{" "}
          <Image src="/icons/filter.svg" alt="filter" width={24} height={24} />
        </div>
      </div>

      <div className="mt-4 text-lg font-semibold">{getContent()}</div>
    </div>
  );
};

export default NotificationPage;
