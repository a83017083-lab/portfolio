import {getApps,initializeApp,cert} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {kvReadResult} from "./kv";
import {cookies} from "next/headers";
export const ACCOUNTS_KEY="client:auth:accounts:v1";
export type AuthAccount={uid:string;email:string;name:string;createdAt:number;clientId?:string;disabled?:boolean};
export function authConfigured(){return Boolean(process.env.FIREBASE_PROJECT_ID&&process.env.FIREBASE_CLIENT_EMAIL&&process.env.FIREBASE_PRIVATE_KEY&&process.env.NEXT_PUBLIC_FIREBASE_API_KEY&&process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN&&process.env.NEXT_PUBLIC_FIREBASE_APP_ID)}
export function firebaseAdmin(){if(!authConfigured())return null;const app=getApps().find(a=>a.name==="portfolio-client-auth")||initializeApp({credential:cert({projectId:process.env.FIREBASE_PROJECT_ID!,clientEmail:process.env.FIREBASE_CLIENT_EMAIL!,privateKey:process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g,"\n")})},"portfolio-client-auth");return getAuth(app)}
export async function verifyFirebaseToken(token:string){if(!authConfigured())return null;let auth;try{auth=firebaseAdmin()}catch{return null}if(!auth)return null;try{const d=await auth.verifyIdToken(token,true);return {uid:d.uid,email:typeof d.email==="string"?d.email:"",verified:d.email_verified===true,name:typeof d.name==="string"?d.name:""}}catch{return null}}
export async function readAuthAccounts(){const result=await kvReadResult<AuthAccount[]>(ACCOUNTS_KEY);return {ok:result.ok&&(result.value===null||Array.isArray(result.value)),accounts:Array.isArray(result.value)?result.value:[]}}
export async function currentAuthAccount(){const cookie=cookies().get("portfolio_account")?.value;if(!cookie||!authConfigured())return null;try{const d=await firebaseAdmin()!.verifySessionCookie(cookie,true);const data=await readAuthAccounts();if(!data.ok)return null;return data.accounts.find(a=>a.uid===d.uid&&!a.disabled)||null}catch{return null}}
export async function makeAccountSession(token:string){if(!authConfigured())return null;let auth;try{auth=firebaseAdmin()}catch{return null}if(!auth)return null;try{return await auth.createSessionCookie(token,{expiresIn:86400000})}catch{return null}}
export function authClientConfig(){if(!authConfigured())return null;return {apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,projectId:process.env.FIREBASE_PROJECT_ID!,appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID!}}
