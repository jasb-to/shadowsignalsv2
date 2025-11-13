# ShadowSignals Deployment Checklist

## Pre-Deployment Configuration

### 1. Environment Variables (Vercel Dashboard)
Verify all environment variables are set in your Vercel project:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)
- ✅ `NEXT_PUBLIC_SITE_URL` - https://www.shadowsignals.live
- ✅ `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - http://localhost:3000/auth/callback (for local dev only)
- ✅ `STRIPE_SECRET_KEY` - Your Stripe secret key
- ✅ `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (public)
- ✅ `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook signing secret
- ✅ `STRIPE_BASIC_PRICE_ID` - Your Stripe Basic plan price ID
- ✅ `STRIPE_PRO_PRICE_ID` - Your Stripe Pro plan price ID
- ✅ `STRIPE_INSTITUTIONAL_PRICE_ID` - Your Stripe Institutional plan price ID
- ⚠️ `NEWSDATA_API_KEY` - Get free API key from https://newsdata.io (for news feed)
- ✅ `TWELVE_DATA_API_KEY` - Your TwelveData API key (for stocks/forex data)

### 2. Supabase Configuration

**Email Settings:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add Site URL: `https://www.shadowsignals.live`
3. Add Redirect URLs:
   - `https://www.shadowsignals.live/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

**Email Templates:**
1. Go to Authentication → Email Templates
2. Verify "Confirm signup" template is enabled
3. Test by signing up with your email

**Database Tables:**
All tables are already created via scripts:
- ✅ users
- ✅ watchlists
- ✅ price_alerts
- ✅ user_preferences

**Make Yourself Admin:**
\`\`\`sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
\`\`\`

### 3. Stripe Configuration

**Webhook Endpoint:**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://www.shadowsignals.live/api/stripe/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

**Test Mode:**
- Verify all price IDs are from test mode
- Use test card: 4242 4242 4242 4242

**Production Mode (when ready):**
- Replace all Stripe keys with live keys
- Update price IDs to live price IDs
- Test with real payment methods

### 4. NewsData.io Setup (Optional but Recommended)

1. Sign up at https://newsdata.io
2. Get free API key (200 requests/day free tier)
3. Add `NEWSDATA_API_KEY` to Vercel environment variables
4. News feed will show real-time crypto and market news

Without this key, news feed will show "Configure API key" message.

## Testing Checklist

### Authentication Flow
- [ ] Sign up with new email
- [ ] Receive confirmation email
- [ ] Click confirmation link
- [ ] Successfully redirected to dashboard
- [ ] Can log out
- [ ] Can log back in
- [ ] Watchlist persists after logout/login
- [ ] Price alerts persist after logout/login

### Subscription Flow
- [ ] Free tier works (limited features)
- [ ] Can view pricing page
- [ ] Can click "Upgrade" on pricing tiers
- [ ] Stripe checkout opens correctly
- [ ] Test payment completes successfully
- [ ] User tier updates in database
- [ ] Account page shows correct subscription
- [ ] Protected features unlock for paid users

### Core Features
- [ ] Market data loads correctly (crypto, stocks, forex, commodities)
- [ ] Comprehensive analysis works
- [ ] Charts display properly
- [ ] Watchlist add/remove works
- [ ] Price alerts create/delete works
- [ ] News feed displays articles (if API key configured)
- [ ] Export analysis (JSON/CSV) works
- [ ] Share analysis copies to clipboard

### Admin Panel (for admin users only)
- [ ] Can access /admin after setting is_admin=true
- [ ] Dashboard shows system stats
- [ ] Can view all users
- [ ] Can manage subscriptions

### Mobile Responsiveness
- [ ] Navigation works on mobile
- [ ] Forms are usable on mobile
- [ ] Charts render on mobile
- [ ] All pages are responsive

## Deployment Steps

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Production ready: Complete auth, subscriptions, and features"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**
   - Vercel will auto-deploy from GitHub
   - Monitor build logs for errors
   - Verify all environment variables are set

3. **Post-Deployment Verification**
   - Visit https://www.shadowsignals.live
   - Test signup → confirmation → login flow
   - Test at least one subscription purchase
   - Verify all API integrations work

4. **Make Yourself Admin**
   - Sign up with your personal email
   - Run SQL in Supabase to set is_admin=true
   - Verify you can access /admin panel

## Launch Checklist

- [ ] All environment variables configured
- [ ] Supabase email confirmation working
- [ ] Stripe webhook configured and tested
- [ ] At least one test subscription completed
- [ ] Admin access working
- [ ] Analytics tracking added (Google Analytics, Posthog, etc.)
- [ ] Error monitoring added (Sentry, etc.)
- [ ] All API keys are production-ready
- [ ] Legal pages reviewed (Privacy, Terms)
- [ ] AdSense code verified (if using ads)

## Monitoring & Maintenance

**Daily:**
- Check error logs in Vercel
- Monitor Stripe dashboard for subscriptions
- Check Supabase auth metrics

**Weekly:**
- Review user growth
- Check subscription conversion rates
- Monitor API usage and costs
- Review database performance

**Monthly:**
- Update dependencies
- Review security vulnerabilities
- Optimize database queries
- A/B test pricing/features

## Support & Documentation

**For Users:**
- Contact form: /contact
- Email: support@shadowsignals.live

**For Developers:**
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com

## Troubleshooting

**Email confirmations not sending:**
- Check Supabase email settings
- Verify SMTP configuration
- Check spam folder

**Stripe webhooks failing:**
- Verify webhook URL is correct
- Check webhook signing secret
- Review webhook logs in Stripe

**Database errors:**
- Verify RLS policies allow operations
- Check user is authenticated
- Review Supabase logs

**API rate limits:**
- Monitor TwelveData usage
- Consider caching strategies
- Upgrade API plans if needed

---

## Ready to Deploy? ✅

If you've completed all the above, you're ready for production!

Deploy command:
\`\`\`bash
vercel --prod
\`\`\`

Or push to main branch for auto-deployment via GitHub integration.
