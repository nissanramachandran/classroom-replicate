-- Create app role enum for user-wide roles
CREATE TYPE public.app_role AS ENUM ('teacher', 'student');

-- Create class role enum for membership roles  
CREATE TYPE public.class_role AS ENUM ('teacher', 'student');

-- Create parent type enum for polymorphic relationships
CREATE TYPE public.parent_type AS ENUM ('post', 'assignment', 'submission', 'class');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role app_role,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for role management (security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  section TEXT,
  subject TEXT,
  room TEXT,
  description TEXT,
  banner_color TEXT DEFAULT '#1967d2',
  class_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 7),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create class_memberships table
CREATE TABLE public.class_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  role class_role NOT NULL DEFAULT 'student',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, class_id)
);

-- Create posts table for stream
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMPTZ,
  points INTEGER DEFAULT 100,
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create materials table for classwork materials
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'turned_in', 'returned', 'graded')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Create grades table
CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  grade INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  graded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type parent_type NOT NULL,
  parent_id UUID NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create attachments table
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type parent_type NOT NULL,
  parent_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('classroom-files', 'classroom-files', true);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
$$;

-- Helper function: Check if user is class member
CREATE OR REPLACE FUNCTION public.is_class_member(p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_memberships
    WHERE class_id = p_class_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = p_class_id AND owner_id = auth.uid()
  );
$$;

-- Helper function: Check if user is class teacher
CREATE OR REPLACE FUNCTION public.is_class_teacher(p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classes
    WHERE id = p_class_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.class_memberships
    WHERE class_id = p_class_id AND user_id = auth.uid() AND role = 'teacher'
  );
$$;

-- Helper function: Get class ID from assignment
CREATE OR REPLACE FUNCTION public.get_assignment_class_id(p_assignment_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT class_id FROM public.assignments WHERE id = p_assignment_id;
$$;

-- Helper function: Get class ID from submission
CREATE OR REPLACE FUNCTION public.get_submission_class_id(p_submission_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.class_id FROM public.submissions s
  JOIN public.assignments a ON s.assignment_id = a.id
  WHERE s.id = p_submission_id;
$$;

-- Trigger function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS Policies for classes
CREATE POLICY "Users can view classes they own or are members of" ON public.classes FOR SELECT TO authenticated USING (owner_id = auth.uid() OR is_class_member(id));
CREATE POLICY "Users can create classes" ON public.classes FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their classes" ON public.classes FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete their classes" ON public.classes FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- RLS Policies for class_memberships
CREATE POLICY "Users can view memberships of their classes" ON public.class_memberships FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_class_member(class_id));
CREATE POLICY "Users can join classes" ON public.class_memberships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Teachers can add members" ON public.class_memberships FOR INSERT TO authenticated WITH CHECK (is_class_teacher(class_id));
CREATE POLICY "Users can leave or teachers can remove" ON public.class_memberships FOR DELETE TO authenticated USING (user_id = auth.uid() OR is_class_teacher(class_id));

-- RLS Policies for posts
CREATE POLICY "Members can view posts" ON public.posts FOR SELECT TO authenticated USING (is_class_member(class_id));
CREATE POLICY "Members can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (is_class_member(class_id) AND author_id = auth.uid());
CREATE POLICY "Authors or teachers can update posts" ON public.posts FOR UPDATE TO authenticated USING (author_id = auth.uid() OR is_class_teacher(class_id));
CREATE POLICY "Authors or teachers can delete posts" ON public.posts FOR DELETE TO authenticated USING (author_id = auth.uid() OR is_class_teacher(class_id));

-- RLS Policies for assignments
CREATE POLICY "Members can view assignments" ON public.assignments FOR SELECT TO authenticated USING (is_class_member(class_id));
CREATE POLICY "Teachers can create assignments" ON public.assignments FOR INSERT TO authenticated WITH CHECK (is_class_teacher(class_id));
CREATE POLICY "Teachers can update assignments" ON public.assignments FOR UPDATE TO authenticated USING (is_class_teacher(class_id));
CREATE POLICY "Teachers can delete assignments" ON public.assignments FOR DELETE TO authenticated USING (is_class_teacher(class_id));

-- RLS Policies for materials
CREATE POLICY "Members can view materials" ON public.materials FOR SELECT TO authenticated USING (is_class_member(class_id));
CREATE POLICY "Teachers can create materials" ON public.materials FOR INSERT TO authenticated WITH CHECK (is_class_teacher(class_id));
CREATE POLICY "Teachers can update materials" ON public.materials FOR UPDATE TO authenticated USING (is_class_teacher(class_id));
CREATE POLICY "Teachers can delete materials" ON public.materials FOR DELETE TO authenticated USING (is_class_teacher(class_id));

-- RLS Policies for submissions
CREATE POLICY "Students can view own submissions, teachers can view all" ON public.submissions FOR SELECT TO authenticated USING (student_id = auth.uid() OR is_class_teacher(get_assignment_class_id(assignment_id)));
CREATE POLICY "Students can create submissions" ON public.submissions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND is_class_member(get_assignment_class_id(assignment_id)));
CREATE POLICY "Students can update own submissions" ON public.submissions FOR UPDATE TO authenticated USING (student_id = auth.uid());

-- RLS Policies for grades
CREATE POLICY "Students view own grades, teachers view all" ON public.grades FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND s.student_id = auth.uid())
  OR is_class_teacher(get_submission_class_id(submission_id))
);
CREATE POLICY "Teachers can create grades" ON public.grades FOR INSERT TO authenticated WITH CHECK (is_class_teacher(get_submission_class_id(submission_id)));
CREATE POLICY "Teachers can update grades" ON public.grades FOR UPDATE TO authenticated USING (is_class_teacher(get_submission_class_id(submission_id)));

-- RLS Policies for comments (simplified - parent validation would need more complex functions)
CREATE POLICY "Authenticated users can view comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors can update comments" ON public.comments FOR UPDATE TO authenticated USING (author_id = auth.uid());
CREATE POLICY "Authors can delete comments" ON public.comments FOR DELETE TO authenticated USING (author_id = auth.uid());

-- RLS Policies for attachments
CREATE POLICY "Authenticated users can view attachments" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upload attachments" ON public.attachments FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Uploaders can delete attachments" ON public.attachments FOR DELETE TO authenticated USING (uploaded_by = auth.uid());

-- Storage policies
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'classroom-files');
CREATE POLICY "Authenticated users can view files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'classroom-files');
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'classroom-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;