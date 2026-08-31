import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import "./globals.css"

const _geist=Geist({subsets:["latin"]})
const _geistMono=Geist_Mono({subsets:["latin"]})

export const metadata:Metadata={metadataBase:new URL("https://a3markets.vercel.app"),title:{default:"A³ — Artificial Intelligence × Analysis × Action",template:"%s | A³"},description:"A³ turns live market data into coherent market intelligence through Artificial Intelligence, Analysis and Action.",authors:[{name:"A³"}],creator:"A³",publisher:"A³",openGraph:{type:"website",locale:"en_GB",url:"https://a3markets.vercel.app",siteName:"A³",title:"A³ — Artificial Intelligence × Analysis × Action",description:"Market intelligence combining live analysis, cycle context, confluence, risk and action."},robots:{index:true,follow:true},alternates:{canonical:"https://a3markets.vercel.app"},category:"Finance",icons:{icon:"/favicon.svg"},manifest:"/manifest.json"}
export const viewport:Viewport={themeColor:"#e85d04",width:"device-width",initialScale:1,maximumScale:5}
const jsonLd={"@context":"https://schema.org","@type":"WebApplication",name:"A³",description:"Market intelligence platform combining Artificial Intelligence, Analysis and Action.",url:"https://a3markets.vercel.app",applicationCategory:"FinanceApplication",operatingSystem:"Any"}

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-GB"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><link rel="preconnect" href="https://api.coingecko.com"/><link rel="preconnect" href="https://api.coinpaprika.com"/></head><body className="font-sans antialiased"><Navigation/>{children}<Footer/><Analytics/></body></html>}
