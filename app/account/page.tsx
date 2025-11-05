"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  email: string
  subscription_tier: string
  subscription_status: string
  subscription_end_date: string | null
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login?redirect=/account")
        return
      }

      const { data, error } = await supabase
        .from("users")
        .select("email, subscription_tier, subscription_status, subscription_end_date")
        .eq("id", user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleUpgrade = () => {
    router.push("/pricing")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your subscription and preferences</p>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Email:</span>
                <span className="ml-2 text-foreground">{profile?.email}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Current Plan:</span>
                <span className="ml-2 text-foreground capitalize">{profile?.subscription_tier}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-2 text-foreground capitalize">{profile?.subscription_status}</span>
              </div>
              {profile?.subscription_end_date && (
                <div>
                  <span className="text-muted-foreground">Renews:</span>
                  <span className="ml-2 text-foreground">
                    {new Date(profile.subscription_end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            {profile?.subscription_tier === "free" && (
              <Button onClick={handleUpgrade} className="mt-4">
                Upgrade Plan
              </Button>
            )}
          </div>

          <div className="border-t pt-6">
            <Button onClick={handleLogout} variant="destructive">
              Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
