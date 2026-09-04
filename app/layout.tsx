import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import "./globals.css"

const _geist=Geist({subsets:["latin"]})
const _geistMono=Geist_Mono({subsets:["latin"]})

export const metadata:Metadata={metadataBase:new URL("https://a3markets.vercel.app"),title:{default:"A³ Markets — Market Intelligence Engine",template:"%s | A³ Markets"},description:"A³ Markets is a market-intelligence engine that turns fragmented market data into structured, explainable intelligence for modern financial platforms.",authors:[{name:"A³ Markets"}],creator:"A³ Markets",publisher:"A³ Markets",openGraph:{type:"website",locale:"en_GB",url:"https://a3markets.vercel.app",siteName:"A³ Markets",title:"A³ Markets — Market Intelligence Engine",description:"The intelligence layer for modern financial platforms."},robots:{index:true,follow:true},alternates:{canonical:"https://a3markets.vercel.app"},category:"Finance",icons:{icon:"/favicon.svg"},manifest:"/manifest.json"}
export const viewport:Viewport={themeColor:"#e85d04",width:"device-width",initialScale:1,maximumScale:5}
const jsonLd={"@context":"https://schema.org","@type":"WebApplication",name:"A³ Markets",description:"Market intelligence engine for modern financial platforms.",url:"https://a3markets.vercel.app",applicationCategory:"FinanceApplication",operatingSystem:"Any"}

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-GB"><head><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}}/><link rel="preconnect" href="https://api.coingecko.com"/><link rel="preconnect" href="https://api.coinpaprika.com"/></head><body className="font-sans antialiased"><Navigation/>{children}<Footer/><Analytics/></body></html>}
