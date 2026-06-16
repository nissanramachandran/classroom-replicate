CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text := NEW.raw_user_meta_data->>'role';
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, avatar_url, role, department)
  VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN requested_role IN ('student', 'staff', 'hod') THEN requested_role ELSE NULL END,
    NEW.raw_user_meta_data->>'department'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    role = COALESCE(public.profiles.role, EXCLUDED.role),
    department = COALESCE(public.profiles.department, EXCLUDED.department);
  RETURN NEW;
END;
$$;