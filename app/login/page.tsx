"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const handleResendConfirmation = async () => {
    console.log("[v0] Resending confirmation email to:", email)
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address first.",
        variant: "destructive",
      })
      return
    }

    setResendingEmail(true)
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })

      if (error) {
        console.error("[v0] Resend error:", error)
        throw error
      }

      console.log("[v0] Confirmation email resent successfully")
      toast({
        title: "Confirmation email sent!",
        description: "Please check your inbox and spam folder.",
      })
    } catch (error: any) {
      console.error("[v0] Resend failed:", error.message)
      toast({
        title: "Failed to resend email",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setResendingEmail(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNeedsConfirmation(false)

    console.log("[v0] Login attempt for:", email)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setNeedsConfirmation(true)
          throw new Error(
            "Please confirm your email address before signing in. Check your inbox for the confirmation link.",
          )
        }
        throw error
      }

      console.log("[v0] Login successful, user:", data.user?.email)

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      })

      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log("[v0] Redirecting to:", redirectTo)
      window.location.href = redirectTo
    } catch (error: any) {
      console.error("[v0] Login error:", error.message)
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">Sign in to access your ShadowSignals dashboard</p>
        </div>

        {needsConfirmation && (
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-3">
              <p>Please confirm your email address before signing in. Check your inbox for the confirmation link.</p>
              <Button
                onClick={handleResendConfirmation}
                disabled={resendingEmail}
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
              >
                {resendingEmail ? "Sending..." : "Resend Confirmation Email"}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
