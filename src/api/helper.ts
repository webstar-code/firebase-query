import { db, dbCollections } from "@/firebase";
import { createRandTransaction } from "@/lib/helper";
import { doc, setDoc } from "firebase/firestore";

async function seedDB() {
  for (let i = 0; i < 100; i++) {
    const transaction = createRandTransaction();
    await setDoc(doc(db, dbCollections.transactions, transaction.id), { ...transaction })
  }
}

import { Timestamp } from 'firebase/firestore';

export const convertToDate = (firebaseTimestamp: any) => {
  if (typeof firebaseTimestamp === 'string') {
    return firebaseTimestamp;
  } else {
    if (typeof firebaseTimestamp === 'object') {
      return firebaseTimestamp.toDate().toString();
    }
    return '';
  }
};

export const convertToFirebaseTimestamp = (date: string | Date) => {
  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date));
  }
  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }
  if (typeof date === 'object') {
    return new Date();
  }
  return date;
};

export const changeValues = (obj: any, key: any, cb: any) => {
  for (let i in obj) {
    if (i === key) {
      obj[key] = cb(obj[key]);
    }
    if (Array.isArray(obj[i])) {
      obj[i].forEach((o: any) => changeValues(o, key, cb));
    }
    if (typeof obj[i] === 'object' && !Array.isArray(obj[i])) {
      changeValues(obj[i], key, cb);
    }
  }
  return obj;
};

const toJson = (data: any) => {
  const d = JSON.parse(JSON.stringify(data));
  changeValues(d, 'date', (val: any) => convertToFirebaseTimestamp(val));
  return d;
};

// convert firebase timestamp to date string
const fromJson = (data: any) => {
  const d = data;
  changeValues(d, 'date', (val: any) => convertToDate(val));
  return d;
};

export const apiMiddleware = {
  toJson,
  fromJson
};

export const helpersApi = {
  seedDB
}



