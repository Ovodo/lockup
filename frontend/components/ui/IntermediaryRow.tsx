"use client";
import { Intermediary } from "@/types/Intermediary";
import AppButton from "./AppButton";
import { useState } from "react";
import ModalComponent from "../shared/modals/ModalComponent";
import ConfirmIntermediaryModal from "../shared/modals/ConfirmIntermediaryModal";
import TransactionSuccessful from "../shared/modals/TransactionSuccessful";
import TransactionSubmitted from "../shared/modals/TransactionSubmitted";
import TransactionRecived from "../shared/modals/TransactionRecieved";
import ConfirmPaymentSent from "../shared/modals/ConfirmPaymentSent";

const IntermediaryRow = ({ item }: { item: Intermediary }) => {
  // --------------------------------------------VARIABLES
  const [confirm, setConfirm] = useState(false);
  const [proceed, setProceed] = useState(false);

  //-----------------------------------------------------------FUNCTIONS

  const select = async () => {};

  //------------------------------------------------------------------USE EFFECTS

  return (
    <div className="grid border-b px-2 py-4 place-content-center mb-2 w-full border-[#c4c4c4]  h-[113px] lg:h-[79px] grid-cols-[2fr,1fr] lg:grid-cols-[1.5fr,1.5fr,0.8fr]">
      {confirm && (
        <ModalComponent
          isModalOpen={confirm}
          setIsModalOpen={setConfirm}
          Content={
            <ConfirmIntermediaryModal
              proceed={setProceed}
              item={item}
              close={setConfirm}
            />
          }
          // Content={<TransactionRecived />}
        />
      )}
      {proceed && (
        <ModalComponent
          isModalOpen={confirm}
          setIsModalOpen={setConfirm}
          Content={<ConfirmPaymentSent />}
          // Content={<TransactionRecived />}
        />
      )}
      <div className="flex gap-1 sm:gap-2   flex-col">
        <h6 className="font-bold text-lg">{item.name}</h6>
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 text-[#666666] items-start lg:items-center">
          <span className="text-[10px] sm:text-sm">{`#${item?.maxAmount?.toLocaleString()} Max`}</span>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#9890A6]" />
            <span className="text-[10px] sm:text-sm">{`${item?.averageTime} `}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-[#9890A6]" />
            <span className="text-[10px] sm:text-sm">{`Charge ${item?.fee}% `}</span>
          </div>
        </div>
      </div>
      <p className="text-[#1b1b1b] hidden  lg:flex items-center justify-center">
        {item?.payments[0].modeOfPayment}
      </p>
      <div className=" flex flex-col  justify-center items-end gap-3">
        <p className="text-[#1b1b1b]  flex lg:hidden items-center justify-center">
          {item?.payments[0].modeOfPayment}
        </p>
        <AppButton
          style="text-white text-xs h-[42px] w-max"
          title="Select Intermediary"
          action={() => setConfirm(true)}
        />
      </div>
    </div>
  );
};

export default IntermediaryRow;
