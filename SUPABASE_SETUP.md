# 🗄️ Supabase Setup Guide

## Quick Setup Steps

### 1. Create Environment File
Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://emyuezwdgfhsmtgdjiem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVteXVlendkZ2Zoc210Z2RqaWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2OTY1NDQsImV4cCI6MjA3MDI3MjU0NH0.m5Zb9bHVp8R7q8wK_7heef72S6LVEjho90aGcEIUPsA
```

### 2. Run Database Script
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/emyuezwdgfhsmtgdjiem)
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content from `shoe-store-database.sql`
5. Paste and click **Run**

### 3. Test Connection
Visit: `http://localhost:3000/test-connection`

## What the Script Creates

### 📊 Tables
- **users** - User profiles and roles
- **products** - Shoe products with details
- **payments** - Payment transactions
- **product_reviews** - Product reviews and ratings
- **user_favorites** - User favorite products

### 🔐 Security
- Row Level Security (RLS) enabled on all tables
- Policies for user access control
- Admin privileges for management

### 🚀 Features
- Automatic user creation on signup
- Updated timestamps on all records
- Sample product data for testing
- Analytics functions for admin dashboard

## Troubleshooting

### If you get policy errors:
The updated script now handles existing policies gracefully by dropping them first.

### If tables already exist:
The script uses `CREATE TABLE IF NOT EXISTS` so it won't overwrite existing data.

### If you need to reset everything:
1. Go to Supabase Dashboard → Database → Tables
2. Delete all tables manually
3. Run the script again

## Next Steps

1. **Test the connection** at `/test-connection`
2. **Register a user** to create your first account
3. **Create products** using the admin panel
4. **Test payments** with Stripe (optional)

## Support

If you encounter any issues:
1. Check the connection test page
2. Verify your `.env.local` file exists
3. Ensure the database script ran successfully
4. Check Supabase logs for any errors



