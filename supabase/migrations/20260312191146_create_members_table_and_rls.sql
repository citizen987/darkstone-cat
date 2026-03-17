-- Migration: Create members table with RLS, functions, triggers, and composite type
-- Consolidates production schema into a single migration for local development

-- 1. Sequence for member numbers (start from 1 locally, not 168 like production)
CREATE SEQUENCE public.member_number_seq START 1 INCREMENT 1;

-- 2. Function: generate_member_number()
CREATE OR REPLACE FUNCTION public.generate_member_number()
  RETURNS text
  LANGUAGE plpgsql
AS $$
BEGIN
  RETURN '000-' || LPAD(nextval('public.member_number_seq')::text, 3, '0');
END;
$$;

-- 3. Function: update_updated_at() — trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
  RETURNS trigger
  LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 4. Function: handle_new_user() — SECURITY DEFINER, trigger on auth.users
-- plpgsql resolves references at execution time, so table need not exist yet
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.members (id, member_number, first_name, last_name)
  VALUES (
    NEW.id,
    public.generate_member_number(),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  );
  RETURN NEW;
END;
$$;

-- 5. Table: public.members
CREATE TABLE public.members (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  member_number text UNIQUE NOT NULL DEFAULT generate_member_number(),
  first_name text NOT NULL DEFAULT ''::text,
  last_name text NOT NULL DEFAULT ''::text,
  dni_nie_encrypted text,
  phone_encrypted text,
  postal_code text,
  ludoya_username text,
  bgg_username text,
  role text NOT NULL DEFAULT 'member'::text CHECK (role IN ('member', 'admin')),
  is_active boolean NOT NULL DEFAULT true,
  conduct_accepted boolean NOT NULL DEFAULT false,
  privacy_accepted boolean NOT NULL DEFAULT false,
  newsletter_accepted boolean NOT NULL DEFAULT false,
  conduct_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  newsletter_accepted_at timestamptz,
  membership_start_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Function: is_admin() — SECURITY DEFINER (SQL function, needs table to exist)
CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 7. RLS: Enable and create policies
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY members_select_own ON public.members
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY admins_select_all ON public.members
  FOR SELECT USING (is_admin());

CREATE POLICY members_update_own ON public.members
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT m.role FROM members m WHERE m.id = auth.uid())
    AND member_number = (SELECT m.member_number FROM members m WHERE m.id = auth.uid())
  );

CREATE POLICY admins_update_all ON public.members
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- 8. Trigger: members_updated_at
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 9. Trigger: on_auth_user_created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 10. Composite type: admin_member_view
CREATE TYPE public.admin_member_view AS (
  id uuid,
  member_number text,
  first_name text,
  last_name text,
  email text,
  dni_nie_encrypted text,
  phone_encrypted text,
  postal_code text,
  ludoya_username text,
  bgg_username text,
  role text,
  is_active boolean,
  conduct_accepted boolean,
  privacy_accepted boolean,
  newsletter_accepted boolean,
  conduct_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  newsletter_accepted_at timestamptz,
  membership_start_date date,
  created_at timestamptz,
  updated_at timestamptz
);

-- 11. Function: get_all_members_for_admin() — SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_all_members_for_admin()
  RETURNS SETOF admin_member_view
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: admin role required';
  END IF;

  RETURN QUERY
    SELECT m.id, m.member_number, m.first_name, m.last_name,
           u.email::text, m.dni_nie_encrypted, m.phone_encrypted,
           m.postal_code, m.ludoya_username, m.bgg_username, m.role,
           m.is_active, m.conduct_accepted, m.privacy_accepted,
           m.newsletter_accepted, m.conduct_accepted_at, m.privacy_accepted_at,
           m.newsletter_accepted_at, m.membership_start_date,
           m.created_at, m.updated_at
    FROM public.members m
    JOIN auth.users u ON u.id = m.id;
END;
$$;
