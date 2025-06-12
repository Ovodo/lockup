"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import OutsideClickHandler from "react-outside-click-handler";
import { AnimatePresence } from "framer-motion";
import ReactCountryFlag from "react-country-flag";
import { hasFlag } from "country-flag-icons";
import Image from "next/image";
import { countries as counts } from "country-data";

const SelectComponent = ({
  label,
  labelStyles,
  items,
  placeholder,
  style,
  onChange,
  countries,
  error,
  def = "",
  zIndex,
  defCountry,
}: {
  items: any[];
  label: string;
  labelStyles: string;
  placeholder: string;
  style?: string;
  error?: boolean;
  countries?: boolean;
  onChange: (e: any) => void;
  zIndex?: number;
  def?: string;
  defCountry?: string;
}) => {
  // --------------------------------------------VARIABLES
  // console.log(items, "items");

  const [open, setOpen] = useState(false);
  const [value, setVal] = useState<any>(null);
  const [search, setSearch] = useState<string>("");
  const [focusedIndex, setFocusedIndex] = useState<number>(-1); // Track focused option
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter items based on search input and whether they have flags
  const filteredItems = countries
    ? items?.filter(
        (item) =>
          hasFlag(item.alpha2) &&
          item.name.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  //-----------------------------------------------------------FUNCTIONS

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : 0
        ); // Move focus down
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredItems.length - 1
        ); // Move focus up
        break;
      case "Enter":
        if (focusedIndex >= 0 && focusedIndex < filteredItems.length) {
          const selectedItem = filteredItems[focusedIndex];
          onChange(selectedItem);
          setVal(selectedItem);
          setOpen(false);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  //------------------------------------------------------------------USE EFFECTS

  // Focus the search input when the dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Reset focused index when dropdown opens or search changes
  useEffect(() => {
    if (open) {
      setFocusedIndex(-1); // Reset focus when dropdown opens or search changes
    }
  }, [open, search]);

  useEffect(() => {
    if (!def || !defCountry) {
      setVal(null);
    }
    if (defCountry) {
      const country = counts.all.find((item) => item.name == defCountry);
      if (country) {
        setVal(country);
      }
    }
  }, [defCountry]);
  // console.log(value, def);
  return (
    <OutsideClickHandler
      display="contents"
      onOutsideClick={() => {
        setOpen(false);
      }}
    >
      <div className="w-full">
        {label && <label className={labelStyles}>{label}</label>}
        <div
          onClick={() => {
            setOpen(!open);
            setSearch("");
          }}
          onKeyDown={handleKeyDown} // Add keyboard event handler
          tabIndex={0} // Make the div focusable
          className={`flex  cursor-pointer ${style}  h-[50px] text-sm bg-[#FAFAFA] border ${
            error ? "border-error" : "border-[#EBECE6]"
          } rounded-md text-header_black font-light ${
            open && "border  border-[#FFDD00]"
          } items-center  relative`}
        >
          <AnimatePresence mode="wait">
            {open && (
              <motion.div
                style={{ zIndex: zIndex }}
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 100, height: 0 }}
                animate={{
                  opacity: 100,
                  height: countries
                    ? 408
                    : items.length > 5
                    ? 300
                    : "max-content",
                }}
                exit={{ opacity: 100, height: 0 }}
                transition={{ duration: 0.1, type: "tween" }}
                className="w-full shadow-[_0px_0px_20px] bord  max-h-[408px] shadow-black/10 h-max flex flex-col absolute top-[105%]  border border-[#EBECE6] bg-white rounded-[4px]"
              >
                {/* Search Input */}
                {countries && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-[90%] rounded-[4px] relative ml-5 px-5 mt-5    flex items-center text-sm bg-[#FAFAFA] border border-[#EBECE6] min-h-[50px]"
                  >
                    <Image
                      src={"/assets/icons/search-normal.svg"}
                      width={14.45}
                      height={14.45}
                      alt="search"
                      className="absolute left-[10px]"
                    />
                    <input
                      ref={searchInputRef}
                      placeholder="Search country..."
                      onChange={(e) => setSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full focus:outline-none placeholder:font-normal placeholder:text-header_black/50 px-[10.55px] bg-transparent"
                    />
                  </div>
                )}

                {countries && (
                  <h6 className="px-5 text-header_black mt-5 mb-2 font-medium text-sm">
                    Frequently selected countries
                  </h6>
                )}
                <div className="flex h-max z-50 overflow-y-scroll flex-col">
                  {filteredItems.map((item, i) => (
                    <button
                      key={i.toString()}
                      style={{ fontSize: 14 }}
                      onClick={() => {
                        if (countries) {
                          onChange(item);
                          setVal(item);
                        } else {
                          onChange(item);
                          setVal(item);
                        }
                        setOpen(false);
                      }}
                      className={`regular cursor-pointer ${
                        value == item ? "bg-purple-300/30" : ""
                      } ${
                        focusedIndex === i ? "bg-app_yellow/10" : ""
                      } border-b border-border flex items-center hover:bg-app_yellow hover:bg-opacity-[0.08] py-[15px] gap-[10px] px-5`}
                    >
                      {countries && (
                        <ReactCountryFlag
                          className="rounded-[2px]"
                          svg
                          countryCode={item.alpha2}
                          style={{
                            width: "30px",
                            height: "22px",
                          }}
                        />
                        // <img
                        //   className='rounded-[2px]'
                        //   alt='United States'
                        //   style={{
                        //     width: "30px",
                        //     height: "22px",
                        //   }}
                        //   src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${item.value}.svg`}
                        // />
                      )}
                      <p>{item.name}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {def !== "" ? (
            <div className="flex items-center gap-[10px] pl-[14px] w-full">
              <Image
                src={"/assets/icons/tick-circle.svg"}
                width={14}
                height={14}
                alt="tick"
              />
              <p className="font-medium">{def}</p>
            </div>
          ) : value === null ? (
            <p className={`${value === null && "font-light"} px-5`}>
              {placeholder}
            </p>
          ) : (
            <div className="flex items-center gap-[10px] pl-[14px] w-full">
              {countries ? (
                <ReactCountryFlag
                  className="rounded-[2px]"
                  svg
                  countryCode={value.alpha2}
                  style={{
                    width: "30px",
                    height: "22px",
                  }}
                />
              ) : (
                // <img
                //   className='rounded-[2px]'
                //   alt='United States'
                //   style={{
                //     width: "30px",
                //     height: "22px",
                //   }}
                //   src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${value.value}.svg`}
                // />
                <Image
                  src={"/assets/icons/tick-circle.svg"}
                  width={14}
                  height={14}
                  alt="tick"
                />
              )}
              <p className="font-medium">{value.name}</p>
            </div>
          )}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            className={`absolute flex justify-end w-full right-[14px] p-1 cursor-pointer self-center`}
          >
            <Image
              className={`duration-200 ${
                open ? "rotate-180 z-20" : "rotate-0"
              }`}
              src={"/assets/icons/arrow-down.svg"}
              width={12}
              height={12}
              alt="down"
            />
          </div>
        </div>
      </div>
    </OutsideClickHandler>
  );
};

export default SelectComponent;
