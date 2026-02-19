# How to Run Supabase Migrations

This guide shows you how to apply the database migration to create the `predictions` table in your Supabase database.

## Method 1: Using Supabase Dashboard (Easiest) ⭐ Recommended

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account
   - Select your project: `epamgstrvmevylbewrxm`

2. **Open SQL Editor**
   - In the left sidebar, click on **"SQL Editor"**
   - Click **"New query"** button

3. **Copy and paste the migration SQL**
   - Open the file: `Frontend/supabase/migrations/20250924051630_01dd67fd-90e3-4332-acc9-db0540b7e811.sql`
   - Copy **ALL** the contents (Ctrl+A, Ctrl+C)
   - Paste into the SQL Editor in Supabase Dashboard

4. **Run the migration**
   - Click the **"Run"** button (or press Ctrl+Enter)
   - Wait for the success message: "Success. No rows returned"

5. **Verify the tables were created**
   - Go to **"Table Editor"** in the left sidebar
   - You should see two tables:
     - `profiles`
     - `predictions`

---

## Method 2: Using Supabase CLI (For Developers)

### Prerequisites
- Install Supabase CLI: https://supabase.com/docs/guides/cli

### Steps

1. **Install Supabase CLI** (if not already installed)
   ```bash
   # Windows (using Scoop)
   scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
   scoop install supabase

   # Or using npm
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   cd Frontend
   supabase link --project-ref epamgstrvmevylbewrxm
   ```
   You'll need your database password when prompted.

4. **Push migrations**
   ```bash
   supabase db push
   ```

   This will apply all migrations in the `supabase/migrations/` folder.

---

## Method 3: Using psql (Advanced)

### Prerequisites
- PostgreSQL client (`psql`) installed
- Database connection string from Supabase Dashboard

### Steps

1. **Get your database connection string**
   - Go to Supabase Dashboard → **Settings** → **Database**
   - Under "Connection string", copy the **"URI"** format
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.epamgstrvmevylbewrxm.supabase.co:5432/postgres`

2. **Run the migration**
   ```bash
   # Replace [YOUR-PASSWORD] with your actual database password
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.epamgstrvmevylbewrxm.supabase.co:5432/postgres" -f Frontend/supabase/migrations/20250924051630_01dd67fd-90e3-4332-acc9-db0540b7e811.sql
   ```

   Or on Windows PowerShell:
   ```powershell
   $env:PGPASSWORD="[YOUR-PASSWORD]"
   psql -h db.epamgstrvmevylbewrxm.supabase.co -U postgres -d postgres -f Frontend\supabase\migrations\20250924051630_01dd67fd-90e3-4332-acc9-db0540b7e811.sql
   ```

---

## Verification

After running the migration, verify it worked:

1. **Check in Supabase Dashboard**
   - Go to **Table Editor**
   - You should see:
     - ✅ `profiles` table
     - ✅ `predictions` table

2. **Test in your app**
   - Try saving a prediction
   - The 404 error should be gone
   - Check browser console for any errors

---

## Troubleshooting

### Error: "relation already exists"
- The tables might already exist
- Check Table Editor to see if `predictions` table exists
- If it exists but has wrong schema, you may need to drop and recreate:
  ```sql
  DROP TABLE IF EXISTS public.predictions CASCADE;
  DROP TABLE IF EXISTS public.profiles CASCADE;
  ```
  Then run the migration again.

### Error: "permission denied"
- Make sure you're using the correct database password
- Check that you have admin access to the Supabase project

### Error: "syntax error"
- Make sure you copied the ENTIRE migration file
- Check for any missing semicolons or incomplete SQL statements

---

## Quick Reference

**Migration File Location:**
```
Frontend/supabase/migrations/20250924051630_01dd67fd-90e3-4332-acc9-db0540b7e811.sql
```

**Supabase Project:**
- Project ID: `epamgstrvmevylbewrxm`
- URL: `https://epamgstrvmevylbewrxm.supabase.co`

**What the migration creates:**
- `profiles` table (user profile data)
- `predictions` table (crop prediction history)
- Row Level Security (RLS) policies
- Triggers and functions for automatic profile creation
