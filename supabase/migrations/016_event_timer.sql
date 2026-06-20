-- Create event_config table for key-value global state
CREATE TABLE IF NOT EXISTS public.event_config (
  key         TEXT         PRIMARY KEY,
  value       TEXT         NOT NULL,
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_config ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY event_config_public_read ON public.event_config
  FOR SELECT USING (true);

-- Allow admins full access
CREATE POLICY event_config_admin_all ON public.event_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );

-- Seed initial values
INSERT INTO public.event_config (key, value) VALUES 
('hackathon_start_time', ''),
('hackathon_duration_hours', '48'),
('hackathon_is_started', 'false')
ON CONFLICT (key) DO NOTHING;
