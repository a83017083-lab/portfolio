import {kvReadResult,kvAppendUniqueLedger} from "./kv";
export type Currency="INR"|"USD"|"GBP"|"EUR";
export type LedgerEntry={id:string;clientId:string;kind:"earned"|"redeemed";amountMinor:number;currency:Currency;invoiceRef:string;note:string;at:number;buyerId?:string;plan?:"Starter"|"Growth"|"Custom";planPriceMinor?:number;buyerDiscountMinor?:number};
export const LEDGER_KEY="admin:referral-ledger:v1";
export const currencyOk=(value:unknown):value is Currency=>["INR","USD","GBP","EUR"].includes(value as string);
export const minorOk=(v:unknown)=>Number.isSafeInteger(v)&&Number(v)>0&&Number(v)<=100000000000;
export const award=(minor:number)=>({buyerDiscountMinor:Math.round(minor*5/100),referrerCreditMinor:Math.round(minor*10/100)});
export async function readLedger(){const result=await kvReadResult<LedgerEntry[]>(LEDGER_KEY);return {ok:result.ok&&(result.value===null||Array.isArray(result.value)),entries:Array.isArray(result.value)?result.value:[]}}
export {kvAppendUniqueLedger};
