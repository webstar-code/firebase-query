import { Currency, faker } from "@faker-js/faker";

type ITransactionStatus = "succeeded" | "failed" | "attempted";
type ITransactionPaymentMethod = 'online' | 'cash'

export interface ITransaction {
  id: string,
  customer: string,
  amount: string,
  currency: Currency,
  paymentMethod: ITransactionPaymentMethod,
  status: ITransactionStatus,
  date: string | Date,
}

export function createRandTransaction(): ITransaction {
  const currency = {
    "name": "Indian Rupee",
    "code": "INR",
    "symbol": "₹"
  };
  return {
    id: faker.string.uuid(),
    customer: faker.person.fullName(),
    currency,
    amount: faker.finance.amount({ min: 200, max: 5000, symbol: currency.symbol }),
    date: faker.date.past(),
    paymentMethod: faker.helpers.arrayElement(["online", "cash"]),
    status: faker.helpers.arrayElement(["succeeded", "failed", "attempted"])
  }
}