# Farmer Profile Database Setup Guide

## Overview

This guide explains how to set up the database to store farmer profile details in the `profiles` table and farmer-specific predictions in the `predictions` table.

## Database Structure

### Profiles Table
Stores comprehensive farmer information including:
- Personal details (name, age, gender, Aadhaar, mobile)
- Location (village, district, state)
- Farm details (land area, irrigation, soil type, crops)
- Financial status (loan, insurance, subsidy)

### Predictions Table
Stores farmer-specific crop predictions linked via `user_id`:
- District, crop, season, scenario
- Yield predictions and confidence scores
- Risk assessments
- Irrigation schedules
- Weather data

## Step 1: Run the Migration

You need to run the new migration to add farmer profile fields to the `profiles` table.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New query**
5. Copy and paste the contents of:
   ```
   Frontend/supabase/migrations/20250220000000_add_farmer_profile_fields.sql
   ```
6. Click **Run** (or press Ctrl+Enter)
7. Wait for success message

### Option B: Using Supabase CLI

```bash
cd Frontend
supabase db push
```

## Step 2: Verify the Migration

After running the migration, verify the columns were added:

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `profiles` table
3. You should see all the new columns:
   - `age`, `gender`, `aadhaar_id`, `mobile_number`
   - `bank_account_linked`, `land_ownership_type`
   - `village`, `district`, `state`
   - `total_land_area`, `land_unit`
   - `irrigation_type`, `soil_type`
   - `crops_currently_grown` (JSONB)
   - `sowing_date`, `crop_season`
   - `loan_status`, `insurance_status`, `subsidy_status`
   - `profile_photo`

## Step 3: How It Works

### Saving Farmer Profile

When a farmer edits their profile:

1. **Edit Profile** button opens the edit dialog
2. Farmer fills in their details
3. On **Save**, data is saved to `profiles` table:
   - If profile exists: Updates existing record
   - If profile doesn't exist: Creates new record
   - All fields are mapped from camelCase (component) to snake_case (database)

### Saving Predictions

When a farmer generates and saves a prediction:

1. Prediction is saved to `predictions` table
2. Linked to farmer via `user_id`
3. Contains:
   - Crop prediction data
   - Weather information
   - Irrigation schedules
   - Risk assessments

### Data Flow

```
Farmer Profile Page
  ↓ (Edit & Save)
profiles table (user_id links to auth.users)
  ↓
All farmer details stored

Dashboard Page
  ↓ (Generate Forecast & Save)
predictions table (user_id links to auth.users)
  ↓
Farmer-specific predictions stored
```

## Step 4: Testing

1. **Test Profile Save:**
   - Go to `/profile` page
   - Click "Edit Profile"
   - Fill in farmer details
   - Click "Save Changes"
   - Verify data appears in Supabase `profiles` table

2. **Test Prediction Save:**
   - Go to Dashboard (`/`)
   - Generate a forecast
   - Click "Save Prediction"
   - Verify data appears in Supabase `predictions` table

3. **Verify Data Linking:**
   - Both tables use `user_id` to link to the same farmer
   - Check that `user_id` in both tables matches

## Field Mapping

### Component → Database

| Component Field | Database Column |
|----------------|-----------------|
| `fullName` | `full_name` |
| `age` | `age` |
| `gender` | `gender` |
| `aadhaarId` | `aadhaar_id` |
| `mobileNumber` | `mobile_number` |
| `bankAccountLinked` | `bank_account_linked` |
| `landOwnershipType` | `land_ownership_type` |
| `village` | `village` |
| `district` | `district` |
| `state` | `state` |
| `totalLandArea` | `total_land_area` |
| `landUnit` | `land_unit` |
| `irrigationType` | `irrigation_type` |
| `soilType` | `soil_type` |
| `cropsCurrentlyGrown` | `crops_currently_grown` (JSONB array) |
| `sowingDate` | `sowing_date` |
| `cropSeason` | `crop_season` |
| `loanStatus` | `loan_status` |
| `insuranceStatus` | `insurance_status` |
| `subsidyStatus` | `subsidy_status` |
| `profilePhoto` | `profile_photo` |

## Troubleshooting

### Error: Column does not exist
- **Solution:** Run the migration file in Supabase SQL Editor

### Error: Permission denied
- **Solution:** Check RLS policies are enabled and user is authenticated

### Error: Data not saving
- **Solution:** 
  1. Check browser console for errors
  2. Verify user is logged in
  3. Check Supabase logs in Dashboard

### Profile not loading
- **Solution:**
  1. Verify profile exists in `profiles` table
  2. Check `user_id` matches authenticated user
  3. Verify RLS policies allow SELECT

## Security

- **Row Level Security (RLS)** is enabled on both tables
- Users can only:
  - View their own profile
  - Update their own profile
  - View their own predictions
  - Create predictions for themselves
  - Delete their own predictions

## Next Steps

1. ✅ Run the migration
2. ✅ Test profile save functionality
3. ✅ Test prediction save functionality
4. ✅ Verify data in Supabase Dashboard
5. (Optional) Add profile photo upload functionality
6. (Optional) Add data validation on backend

## Support

If you encounter issues:
1. Check Supabase Dashboard logs
2. Check browser console for errors
3. Verify migration was successful
4. Ensure user is authenticated
