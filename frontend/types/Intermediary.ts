export interface PaymentDetails {
  currency: string;
  amount: string;
  bank: string;
  bankCode: number;
  accountName: string;
  accountNumber: string;
  modeOfPayment: string;
}

export interface Intermediary {
  name: string;
  address: string;
  maxAmount: number;
  averageTime: string;
  country: string;
  fee: number;
  payments: PaymentDetails[];
}
