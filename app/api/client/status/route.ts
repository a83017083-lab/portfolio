import {NextResponse} from "next/server";
import {clientId,listClients} from "../../../../lib/client-portal";
export async function GET(){const id=clientId();if(!id)return NextResponse.json({error:"Unauthorized"},{status:401});const c=(await listClients()).find(x=>x.id===id);if(!c)return NextResponse.json({error:"Access revoked"},{status:401});return NextResponse.json({client:{name:c.name,project:c.project,status:c.status,update:c.update}},{headers:{"Cache-Control":"no-store"}})}
