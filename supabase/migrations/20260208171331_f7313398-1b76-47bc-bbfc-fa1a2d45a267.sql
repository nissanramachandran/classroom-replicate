-- Add department column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);