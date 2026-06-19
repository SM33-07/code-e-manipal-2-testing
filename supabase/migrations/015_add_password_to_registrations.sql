-- Add encrypted_password column to hackathon_registrations table
ALTER TABLE public.hackathon_registrations
ADD COLUMN IF NOT EXISTS encrypted_password TEXT;
