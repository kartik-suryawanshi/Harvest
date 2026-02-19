-- Add farmer profile fields to profiles table
-- This migration extends the profiles table to store comprehensive farmer information

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
ADD COLUMN IF NOT EXISTS aadhaar_id TEXT,
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS bank_account_linked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS land_ownership_type TEXT CHECK (land_ownership_type IN ('Owner', 'Tenant', 'Shared')),
ADD COLUMN IF NOT EXISTS village TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS total_land_area DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS land_unit TEXT CHECK (land_unit IN ('acres', 'hectares')) DEFAULT 'acres',
ADD COLUMN IF NOT EXISTS irrigation_type TEXT CHECK (irrigation_type IN ('Rainfed', 'Borewell', 'Canal', 'Drip')),
ADD COLUMN IF NOT EXISTS soil_type TEXT CHECK (soil_type IN ('Loamy', 'Clay', 'Sandy')),
ADD COLUMN IF NOT EXISTS crops_currently_grown JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sowing_date DATE,
ADD COLUMN IF NOT EXISTS crop_season TEXT CHECK (crop_season IN ('Kharif', 'Rabi', 'Zaid')),
ADD COLUMN IF NOT EXISTS loan_status TEXT CHECK (loan_status IN ('Active', 'None')) DEFAULT 'None',
ADD COLUMN IF NOT EXISTS insurance_status TEXT CHECK (insurance_status IN ('PMFBY Enrolled', 'Not Enrolled')) DEFAULT 'Not Enrolled',
ADD COLUMN IF NOT EXISTS subsidy_status TEXT CHECK (subsidy_status IN ('Active', 'Pending', 'None')) DEFAULT 'None',
ADD COLUMN IF NOT EXISTS profile_photo TEXT;

-- Create index on mobile_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_mobile_number ON public.profiles(mobile_number);

-- Create index on district and state for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(district, state);

-- Add comment to table
COMMENT ON TABLE public.profiles IS 'Stores comprehensive farmer profile information including personal details, farm details, and financial status';
