import { createHmac, randomBytes } from "node:crypto"

function requiredEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error("Missing environment variable: " + name)
  return value
}

async function main() {
  const email = process.argv[2]
  const tier = process.argv[3] ?? "free"

  if (!email || !email.includes("@")) {
    throw new Error(
      "Usage: node --experimental-strip-types scripts/create-api-key.ts email@example.com [free|pro]"
    )
  }

  if (tier !== "free" && tier !== "pro") {
    throw new Error("Tier must be free or pro")
  }

  const apiKey =
    "a3_live_" + randomBytes(32).toString("base64url")

  const keyHash = createHmac(
    "sha256",
    requiredEnv("A3_API_KEY_PEPPER")
  )
    .update(apiKey)
    .digest("hex")

  const baseUrl = (
    process.env.SUPABASE_URL?.trim() ||
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL")
  ).replace(/\/$/, "")

  const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY")

  const response = await fetch(baseUrl + "/rest/v1/api_keys", {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: "Bearer " + serviceKey,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      customer_email: email,
      key_hash: keyHash,
      tier,
    }),
  })

  if (!response.ok) {
    throw new Error("Supabase API-key insert failed: " + response.status)
  }

  console.log("API key created. Copy it now; it will not be stored in plaintext:")
  console.log(apiKey)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
