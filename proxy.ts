import { NextResponse, type NextRequest } from "next/server"

function unauthorized(){return new NextResponse("Authentication required",{status:401,headers:{"WWW-Authenticate":'Basic realm="A3 Markets Admin"'}})}
function isProtected(pathname:string){return pathname==="/admin"||pathname.startsWith("/admin/")||pathname.startsWith("/api/admin/")}

export async function proxy(request:NextRequest){
  if(!isProtected(request.nextUrl.pathname)) return NextResponse.next()
  const expectedUser=process.env.A3_ADMIN_USER
  const expectedPassword=process.env.A3_ADMIN_PASSWORD
  if(!expectedUser||!expectedPassword) return new NextResponse("Admin access is not configured",{status:503})
  const header=request.headers.get("authorization")
  if(!header?.startsWith("Basic ")) return unauthorized()
  try{
    const decoded=atob(header.slice(6))
    const separator=decoded.indexOf(":")
    if(separator<0) return unauthorized()
    const user=decoded.slice(0,separator)
    const password=decoded.slice(separator+1)
    if(user!==expectedUser||password!==expectedPassword) return unauthorized()
    return NextResponse.next()
  }catch{return unauthorized()}
}

export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]}
