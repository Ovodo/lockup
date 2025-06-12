"use server";

import clientPromise from "@/lib/mongo";
import { PaymentDetails } from "@/types/Intermediary";

export const updatePersonalDetails = async (
  address: string,
  name: string,
  country: string
) => {
  try {
    const client = await clientPromise;
    const db = client.db("Lockup");

    const existingUser = await db
      .collection("intermediaries")
      .findOne({ address: address });
    if (existingUser) {
      await db
        .collection("intermediaries")
        .updateOne(
          { address: address },
          { $set: { name: name, country: country } }
        );
      return { ok: true, exist: true };
    }

    await db
      .collection("intermediaries")
      .insertOne({ address: address, name: name, country: country });
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
};

export const getIntermediary = async (address: string) => {
  try {
    const client = await clientPromise;
    const db = client.db("Lockup");

    const existingUser = await db
      .collection("intermediaries")
      .findOne({ address: address }, { projection: { _id: 0 } });
    if (existingUser) {
      return { ok: true, data: existingUser };
    }
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
};
export const removePayment = async (
  address: string,
  payment: PaymentDetails
): Promise<{ ok: boolean; message?: string }> => {
  try {
    const client = await clientPromise;
    const db = client.db("Lockup");

    const result = await db.collection("intermediaries").updateOne(
      { address: address },
      {
        //@ts-ignore
        $pull: {
          payments: {
            accountName: payment.accountName,
            accountNumber: payment.accountNumber,
            bank: payment.bank,
            modeOfPayment: payment.modeOfPayment,
            amount: payment.amount,
            currency: payment.currency,
          },
        },
      }
    );

    if (result.modifiedCount > 0) {
      return { ok: true, message: "Payment removed successfully" };
    } else {
      return { ok: false, message: "Payment not found or already removed" };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to remove payment" };
  }
};
export const addPayment = async (
  address: string,
  payment: PaymentDetails
): Promise<{ ok: boolean; message?: string; exist?: boolean }> => {
  try {
    const client = await clientPromise;
    const db = client.db("Lockup");

    const existingUser = await db
      .collection("intermediaries")
      .findOne({ address: address }, { projection: { _id: 0 } });

    if (existingUser) {
      // Check if the payment already exists (by unique fields, e.g., id or txHash)
      const paymentExists = existingUser.payments?.some(
        (p: PaymentDetails) =>
          p.accountName === payment.accountName &&
          p.accountNumber === payment.accountNumber &&
          p.bank === payment.bank &&
          p.modeOfPayment === payment.modeOfPayment &&
          p.amount === payment.amount &&
          p.currency === payment.currency
      );

      if (paymentExists) {
        return { ok: false, exist: true, message: "Payment exists" };
      }

      await db.collection("intermediaries").updateOne(
        { address: address },
        {
          //@ts-ignore
          $push: { payments: payment },
        }
      );
      return { ok: true, message: "Payment added successfully" };
    }
    // If existingUser is not found, return appropriate response
    return { ok: false, message: "User not found", exist: false };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Failed to add payment" };
  }
};

export const getIntermediaries = async () => {
  try {
    const client = await clientPromise;
    const db = client.db("Lockup");

    const existingUser = await db
      .collection("intermediaries")
      .find({}, { projection: { _id: 0 } })
      .toArray();
    if (existingUser) {
      return { ok: true, data: existingUser };
    }
  } catch (error) {
    console.error(error);
    return { ok: false };
  }
};
