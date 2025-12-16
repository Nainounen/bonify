# Quick Setup Checklist ✅

Follow these steps to get Bonify running:

## 1. Supabase Project Setup

- [ ] Go to [supabase.com](https://supabase.com) and create a new project
- [ ] Wait for the project to finish provisioning (2-3 minutes)
- [ ] Go to Project Settings → API
- [ ] Copy the **Project URL** and **anon/public key**

## 2. Run Database Schema

- [ ] In your Supabase project, go to the **SQL Editor**
- [ ] Create a new query
- [ ] Copy and paste the entire contents of `supabase-schema.sql`
- [ ] Click **Run** to execute the SQL
- [ ] Verify tables were created in the **Table Editor**

## 3. Configure Environment Variables

- [ ] Open `.env.local` in this project
- [ ] Replace `your-supabase-url` with your Project URL
- [ ] Replace `your-supabase-anon-key` with your anon key
- [ ] Save the file

## 4. Install and Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 5. Test the Application

- [ ] Open http://localhost:3000
- [ ] You should be redirected to `/login`
- [ ] Click "Don't have an account? Sign up"
- [ ] Create a test account with:
  - Name: Test User
  - Email: test@example.com
  - Password: test123456
- [ ] You should be redirected to the dashboard
- [ ] Click the green + button to log your first sale
- [ ] Verify the counter increases and you see a success toast

## Troubleshooting

### "Could not connect to database"
- Check that your Supabase project is running
- Verify environment variables are correct
- Make sure there are no trailing spaces in `.env.local`

### "User already registered"
- Use a different email address
- Or reset the user in Supabase Authentication panel

### "Table does not exist"
- Make sure you ran the entire `supabase-schema.sql` script
- Check for any SQL errors in the Supabase SQL Editor

### "RLS policy violation"
- Verify you're logged in
- Check that RLS policies were created correctly
- Make sure the trigger for auto-creating employee records is active

## Next Steps

Once everything is working:

1. Create actual employee accounts for your team
2. Customize bonus tiers in the `bonus_tiers` table if needed
3. Update currency from CHF to your local currency
4. Consider adding more gamification features like leaderboards
5. Deploy to production (Vercel recommended)

## Need Help?

Check the main README.md for detailed documentation and customization options.
