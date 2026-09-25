/** Advisory checks for incoming inquiry text. Never block delivery or label a person as spam. */
export function reviewSignals(value:{name:string;email:string;message:string}){
 const signals:string[]=[];
 const message=value.message.trim();
 if(message.length<25)signals.push("Very short message");
 if((message.match(/https?:\/\/|www\./gi)||[]).length>=3)signals.push("Several links");
 if(/(.)\1{9,}/u.test(message))signals.push("Repeated characters");
 if(/\b(?:crypto|forex|guaranteed profit|guest post|backlinks)\b/i.test(message))signals.push("Unrelated promotional terms");
 if(/(?:[a-z0-9-]+\.)+[a-z]{2,}/i.test(value.name))signals.push("Website in name field");
 return signals;
}
