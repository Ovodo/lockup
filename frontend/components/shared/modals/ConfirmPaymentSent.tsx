"use client";
import AppButton from "@/components/ui/AppButton";
import WhiteBackground from "@/components/WhiteBackground";
import Image from "next/image";
import { ChangeEvent, Suspense, useState } from "react";
import { upload } from "@vercel/blob/client";
import toast from "react-hot-toast";
import { baseUrl } from "@/lib/utils";
import clientPromise from "@/lib/mongo";
import { useAppSelector } from "@/redux/hooks";
import { ObjectId } from "mongodb";
import { Transaction } from "@mysten/sui/transactions";
import clientConfig from "@/config/clientConfig";
import { useSearchParams } from "next/navigation";
import ModalComponent from "./ModalComponent";
import TransactionSuccessful from "./TransactionSuccessful";

const ConfirmPaymentSent = () => {
  // --------------------------------------------VARIABLES
  const [disabled, setDisabled] = useState(true);
  const [file, setFile] = useState<File>();
  const [success, setSuccess] = useState(false);

  const { activeTransaction } = useAppSelector((state) => state.transactions);

  const searchParams = useSearchParams();
  const id = searchParams?.get("id") as string;

  //-----------------------------------------------------------FUNCTIONS

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files ? event.target.files[0] : null;
    if (!file) {
      toast.error("No file selected.");
      return;
    }
    setFile(file);
    console.log(file);
  };

  const confirmPayment = async () => {
    if (!file) {
      toast.error("Upload payment slip.");
      return;
    }
    const toastId = toast.loading("Confirming...");

    try {
      const newBlob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: `${baseUrl}api/upload?id=${activeTransaction}`,
      });

      if (newBlob) {
        const txb = new Transaction();
        console.log(newBlob, "blob");

        txb.moveCall({
          target: `${clientConfig.PACKAGE_ID}::lockup::confirm_sent_payment`,
          arguments: [
            txb.object(clientConfig.APP_ID),
            txb.pure.u64(parseInt(id) - 1),
            txb.object(clientConfig.CLOCK_ID),
          ],
        });

        // const res: any = await executeTransactionBlockWithoutSponsorship({
        //   tx: txb,
        //   options: {
        //     showEffects: true,
        //     showObjectChanges: true,
        //     showEvents: true,
        //   },
        // });
        // toast.success("Successful", { id: toastId });
        // setSuccess(true);
        // console.log(res);
        // const app: any = await client.getObject({
        //   id: clientConfig.APP_ID,
        //   options: { showContent: true },
        // });
        // // console.log(app);
        // console.log(
        //   app.data.content.fields.cross_border_payments.filter(
        //     (item: any) => item.fields.id == id
        //   )[0]
        // );
        // router.refresh();
      } else {
        toast.error("Error updating file.", { id: toastId });
      }
    } catch (error: any) {
      toast.error("Error uploading the file.", { id: toastId });
      console.error("There was an error uploading the file.", error);
    }
  };

  //------------------------------------------------------------------USE EFFECTS

  return (
    <WhiteBackground styles="w-full mt-6 rounded-[16px] p-6">
      {success && (
        <ModalComponent
          isModalOpen={success}
          setIsModalOpen={setSuccess}
          Content={<TransactionSuccessful id={id} />}
          // Content={<TransactionRecived />}
        />
      )}
      <div className="border-border border-b pb-6 ">
        <h6 className="font-medium text-xl text-black mb-3">
          Sender&apos;s Details
        </h6>
        <div className="grid gap-y-1 grid-cols-[2fr,4fr]">
          <p className="text-[#757575] center-all text-xl">
            Sender&apos;s Name:
          </p>
          <p className="text-[#1b1b1b] font-semibold text-2xl">
            John Doe (Nigeria)
          </p>
          <p className="text-[#757575] center-all text-xl">Amount:</p>
          <p className="text-[#1b1b1b] font-semibold text-2xl">#110,000</p>
          <p className="text-[#757575]  center-all text-xl">Transfer Type:</p>
          <p className="text-[#1b1b1b]  font-semibold text-2xl">
            Bank Transfer
          </p>
        </div>
      </div>
      <div className="border-border border-b py-6 ">
        <h6 className="font-medium text-xl text-black mb-3">
          Receiver&apos;s Details
        </h6>
        <div className="grid gap-y-1 grid-cols-[2fr,4fr]">
          <p className="text-[#757575] center-all text-xl">
            Sender&apos;s Name:
          </p>
          <p className="text-[#1b1b1b] font-semibold text-2xl">
            Nancy Tolu (Nigeria)
          </p>
          <p className="text-[#757575] center-all text-xl">
            Local Currency To Transfer:
          </p>
          <p className="text-[#1b1b1b] font-semibold text-2xl">#110,000</p>
          <p className="text-[#757575]  center-all text-xl">Bank Details:</p>
          <p className="text-[#1b1b1b]  font-semibold text-2xl">
            First Bank- 123456789
          </p>
          <p className="text-[#757575]  center-all text-xl">Country:</p>
          <p className="text-[#1b1b1b]  font-semibold text-2xl">Nigeria</p>
        </div>
      </div>
      <div className="w-full relative h-[200px] flex flex-col items-center justify-center">
        {file ? (
          <p className="text-xl text-[#666666] mt-3">{file.name}</p>
        ) : (
          <>
            <Image
              src={"assets/icons/upload.svg"}
              width={64}
              height={64}
              alt="upload"
            />
            <p className="text-xl text-[#666666] mt-3">
              Upload proof of payment
            </p>
          </>
        )}
        <input
          type="file"
          onChange={handleFileChange}
          className="opacity-0 cursor-pointer w-full absolute  h-full  bg-black "
        />
      </div>
      <div className="mt-16">
        <div className="flex items-center mb-4 gap-4">
          <input
            type="checkbox"
            onChange={() => setDisabled(!disabled)}
            className="text-appBlue"
          />
          <p className="text-[#666666] text-xl">
            Once confirmed, you will review the transaction summary in the next
            step
          </p>
        </div>
        <AppButton
          disabled={disabled}
          action={confirmPayment}
          title="Confirm Payment Sent"
          style="w-full disabled:bg-[#C4C4C4] bg-appBlue text-white font-bold  disabled:text-white"
        />
        <button
          // onClick={() => {}}
          className="w-full font-bold hover:scale-[.98] duration-300 h-[53px] border mt-2 rounded-[8px] border-[#c4c4c4] text-[#c4c4c4]"
        >
          Report Issue
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

const ConfirmPaymentSentWithSuspense = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmPaymentSent />
    </Suspense>
  );
};

export default ConfirmPaymentSentWithSuspense;
