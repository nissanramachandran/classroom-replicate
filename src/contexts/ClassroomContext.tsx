import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Class, Post, Assignment, Material, Submission, ClassMembership, Comment, Attachment, ParentType } from '@/types/classroom';

interface ClassroomContextType {
  classes: Class[];
  currentClass: Class | null;
  posts: Post[];
  assignments: Assignment[];
  materials: Material[];
  members: ClassMembership[];
  loading: boolean;
  
  // Class actions
  fetchClasses: () => Promise<void>;
  createClass: (data: Partial<Class>) => Promise<{ data: Class | null; error: Error | null }>;
  updateClass: (id: string, data: Partial<Class>) => Promise<{ error: Error | null }>;
  deleteClass: (id: string) => Promise<{ error: Error | null }>;
  joinClass: (code: string) => Promise<{ error: Error | null }>;
  setCurrentClass: (classData: Class | null) => void;
  
  // Stream actions
  fetchPosts: (classId: string) => Promise<void>;
  createPost: (classId: string, content: string) => Promise<{ error: Error | null }>;
  deletePost: (postId: string) => Promise<{ error: Error | null }>;
  
  // Assignment actions
  fetchAssignments: (classId: string) => Promise<void>;
  createAssignment: (data: Partial<Assignment>) => Promise<{ error: Error | null }>;
  updateAssignment: (id: string, data: Partial<Assignment>) => Promise<{ error: Error | null }>;
  deleteAssignment: (id: string) => Promise<{ error: Error | null }>;
  
  // Material actions
  fetchMaterials: (classId: string) => Promise<void>;
  createMaterial: (data: Partial<Material>) => Promise<{ error: Error | null }>;
  
  // Submission actions
  submitAssignment: (assignmentId: string, content?: string) => Promise<{ error: Error | null }>;
  getSubmissions: (assignmentId: string) => Promise<Submission[]>;
  gradeSubmission: (submissionId: string, grade: number, feedback?: string) => Promise<{ error: Error | null }>;
  
  // Member actions
  fetchMembers: (classId: string) => Promise<void>;
  removeMember: (membershipId: string) => Promise<{ error: Error | null }>;
  
  // Comment actions
  addComment: (parentType: ParentType, parentId: string, content: string, isPrivate?: boolean) => Promise<{ error: Error | null }>;
  getComments: (parentType: ParentType, parentId: string) => Promise<Comment[]>;
  
  // File actions
  uploadFile: (file: File, parentType: ParentType, parentId: string) => Promise<{ url: string | null; error: Error | null }>;
  getAttachments: (parentType: ParentType, parentId: string) => Promise<Attachment[]>;
  
  // Utility
  isTeacher: (classId: string) => boolean;
}

const ClassroomContext = createContext<ClassroomContextType | undefined>(undefined);

export const ClassroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [members, setMembers] = useState<ClassMembership[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // First get classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (classesError) throw classesError;
      
      // Then get owner profiles separately
      if (classesData && classesData.length > 0) {
        const ownerIds = [...new Set(classesData.map(c => c.owner_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', ownerIds);
        
        const classesWithOwners = classesData.map(c => ({
          ...c,
          owner: profiles?.find(p => p.user_id === c.owner_id)
        }));
        
        setClasses(classesWithOwners as Class[]);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createClass = async (data: Partial<Class>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };
    
    const { data: newClass, error } = await supabase
      .from('classes')
      .insert({
        title: data.title!,
        section: data.section,
        subject: data.subject,
        room: data.room,
        description: data.description,
        banner_color: data.banner_color || '#1967d2',
        owner_id: user.id,
      })
      .select()
      .single();

    if (!error && newClass) {
      await fetchClasses();
    }
    
    return { data: newClass as Class | null, error: error as Error | null };
  };

  const updateClass = async (id: string, data: Partial<Class>) => {
    const { error } = await supabase
      .from('classes')
      .update({
        title: data.title,
        section: data.section,
        subject: data.subject,
        room: data.room,
        description: data.description,
        banner_color: data.banner_color,
      })
      .eq('id', id);
    
    if (!error) await fetchClasses();
    return { error: error as Error | null };
  };

  const deleteClass = async (id: string) => {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id);
    
    if (!error) {
      await fetchClasses();
      if (currentClass?.id === id) setCurrentClass(null);
    }
    return { error: error as Error | null };
  };

  const joinClass = async (code: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    // Find class by code
    const { data: classData, error: findError } = await supabase
      .from('classes')
      .select('id, owner_id')
      .eq('class_code', code.toLowerCase())
      .single();

    if (findError || !classData) {
      return { error: new Error('Class not found. Check the code and try again.') };
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('class_memberships')
      .select('id')
      .eq('class_id', classData.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      return { error: new Error('You are already enrolled in this class.') };
    }

    // Check if user is the owner
    if (classData.owner_id === user.id) {
      return { error: new Error('You are the teacher of this class.') };
    }

    // Join the class
    const { error } = await supabase
      .from('class_memberships')
      .insert({
        user_id: user.id,
        class_id: classData.id,
        role: 'student',
      });

    if (!error) await fetchClasses();
    return { error: error as Error | null };
  };

  const fetchPosts = useCallback(async (classId: string) => {
    const { data: postsData, error } = await supabase
      .from('posts')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      return;
    }
    
    if (postsData && postsData.length > 0) {
      const authorIds = [...new Set(postsData.map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', authorIds);
      
      const postsWithAuthors = postsData.map(p => ({
        ...p,
        author: profiles?.find(pr => pr.user_id === p.author_id)
      }));
      
      setPosts(postsWithAuthors as Post[]);
    } else {
      setPosts([]);
    }
  }, []);

  const createPost = async (classId: string, content: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('posts')
      .insert({
        class_id: classId,
        author_id: user.id,
        content,
      });

    if (!error) await fetchPosts(classId);
    return { error: error as Error | null };
  };

  const deletePost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (!error && post) await fetchPosts(post.class_id);
    return { error: error as Error | null };
  };

  const fetchAssignments = useCallback(async (classId: string) => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      return;
    }
    setAssignments((data || []) as Assignment[]);
  }, []);

  const createAssignment = async (data: Partial<Assignment>) => {
    if (!data.class_id || !data.title) {
      return { error: new Error('Class ID and title are required') };
    }
    
    const { error } = await supabase
      .from('assignments')
      .insert({
        class_id: data.class_id,
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        due_date: data.due_date,
        points: data.points,
        topic: data.topic,
      });

    if (!error) await fetchAssignments(data.class_id);
    return { error: error as Error | null };
  };

  const updateAssignment = async (id: string, data: Partial<Assignment>) => {
    const assignment = assignments.find(a => a.id === id);
    const { error } = await supabase
      .from('assignments')
      .update({
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        due_date: data.due_date,
        points: data.points,
        topic: data.topic,
      })
      .eq('id', id);

    if (!error && assignment) await fetchAssignments(assignment.class_id);
    return { error: error as Error | null };
  };

  const deleteAssignment = async (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);

    if (!error && assignment) await fetchAssignments(assignment.class_id);
    return { error: error as Error | null };
  };

  const fetchMaterials = useCallback(async (classId: string) => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching materials:', error);
      return;
    }
    setMaterials((data || []) as Material[]);
  }, []);

  const createMaterial = async (data: Partial<Material>) => {
    if (!data.class_id || !data.title) {
      return { error: new Error('Class ID and title are required') };
    }
    
    const { error } = await supabase
      .from('materials')
      .insert({
        class_id: data.class_id,
        title: data.title,
        description: data.description,
        topic: data.topic,
      });

    if (!error) await fetchMaterials(data.class_id);
    return { error: error as Error | null };
  };

  const submitAssignment = async (assignmentId: string, content?: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    // Check for existing submission
    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('student_id', user.id)
      .single();

    if (existing) {
      // Update existing submission
      const { error } = await supabase
        .from('submissions')
        .update({
          content,
          status: 'turned_in',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      return { error: error as Error | null };
    }

    // Create new submission
    const { error } = await supabase
      .from('submissions')
      .insert({
        assignment_id: assignmentId,
        student_id: user.id,
        content,
        status: 'turned_in',
        submitted_at: new Date().toISOString(),
      });

    return { error: error as Error | null };
  };

  const getSubmissions = async (assignmentId: string): Promise<Submission[]> => {
    const { data: submissionsData, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('assignment_id', assignmentId);

    if (error) {
      console.error('Error fetching submissions:', error);
      return [];
    }
    
    if (!submissionsData || submissionsData.length === 0) return [];
    
    // Get student profiles
    const studentIds = [...new Set(submissionsData.map(s => s.student_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', studentIds);
    
    // Get grades
    const submissionIds = submissionsData.map(s => s.id);
    const { data: grades } = await supabase
      .from('grades')
      .select('*')
      .in('submission_id', submissionIds);
    
    const submissionsWithData = submissionsData.map(s => ({
      ...s,
      student: profiles?.find(p => p.user_id === s.student_id),
      grade: grades?.find(g => g.submission_id === s.id),
    }));
    
    return submissionsWithData as Submission[];
  };

  const gradeSubmission = async (submissionId: string, grade: number, feedback?: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    // Check for existing grade
    const { data: existing } = await supabase
      .from('grades')
      .select('id')
      .eq('submission_id', submissionId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('grades')
        .update({
          grade,
          feedback,
          graded_by: user.id,
          graded_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
      
      // Update submission status
      await supabase
        .from('submissions')
        .update({ status: 'graded' })
        .eq('id', submissionId);
        
      return { error: error as Error | null };
    }

    const { error } = await supabase
      .from('grades')
      .insert({
        submission_id: submissionId,
        grade,
        feedback,
        graded_by: user.id,
        graded_at: new Date().toISOString(),
      });

    // Update submission status
    await supabase
      .from('submissions')
      .update({ status: 'graded' })
      .eq('id', submissionId);

    return { error: error as Error | null };
  };

  const fetchMembers = useCallback(async (classId: string) => {
    const { data: membershipsData, error } = await supabase
      .from('class_memberships')
      .select('*')
      .eq('class_id', classId);

    if (error) {
      console.error('Error fetching members:', error);
      return;
    }
    
    if (!membershipsData || membershipsData.length === 0) {
      setMembers([]);
      return;
    }
    
    const userIds = [...new Set(membershipsData.map(m => m.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', userIds);
    
    const membersWithProfiles = membershipsData.map(m => ({
      ...m,
      user: profiles?.find(p => p.user_id === m.user_id)
    }));
    
    setMembers(membersWithProfiles as ClassMembership[]);
  }, []);

  const removeMember = async (membershipId: string) => {
    const membership = members.find(m => m.id === membershipId);
    const { error } = await supabase
      .from('class_memberships')
      .delete()
      .eq('id', membershipId);

    if (!error && membership) await fetchMembers(membership.class_id);
    return { error: error as Error | null };
  };

  const addComment = async (parentType: ParentType, parentId: string, content: string, isPrivate = false) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('comments')
      .insert({
        parent_type: parentType,
        parent_id: parentId,
        author_id: user.id,
        content,
        is_private: isPrivate,
      });

    return { error: error as Error | null };
  };

  const getComments = async (parentType: ParentType, parentId: string): Promise<Comment[]> => {
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select('*')
      .eq('parent_type', parentType)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    
    if (!commentsData || commentsData.length === 0) return [];
    
    const authorIds = [...new Set(commentsData.map(c => c.author_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', authorIds);
    
    const commentsWithAuthors = commentsData.map(c => ({
      ...c,
      author: profiles?.find(p => p.user_id === c.author_id)
    }));
    
    return commentsWithAuthors as Comment[];
  };

  const uploadFile = async (file: File, parentType: ParentType, parentId: string) => {
    if (!user) return { url: null, error: new Error('Not authenticated') };
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${parentType}/${parentId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('classroom-files')
      .upload(fileName, file);

    if (uploadError) {
      return { url: null, error: uploadError as Error };
    }

    const { data: urlData } = supabase.storage
      .from('classroom-files')
      .getPublicUrl(fileName);

    // Save attachment record
    const { error: attachError } = await supabase
      .from('attachments')
      .insert({
        parent_type: parentType,
        parent_id: parentId,
        name: file.name,
        url: urlData.publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      });

    if (attachError) {
      return { url: null, error: attachError as Error };
    }

    return { url: urlData.publicUrl, error: null };
  };

  const getAttachments = async (parentType: ParentType, parentId: string): Promise<Attachment[]> => {
    const { data, error } = await supabase
      .from('attachments')
      .select('*')
      .eq('parent_type', parentType)
      .eq('parent_id', parentId);

    if (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
    return (data || []) as Attachment[];
  };

  const isTeacher = useCallback((classId: string): boolean => {
    if (!user) return false;
    
    const classData = classes.find(c => c.id === classId);
    if (classData?.owner_id === user.id) return true;
    
    const membership = members.find(m => m.class_id === classId && m.user_id === user.id);
    return membership?.role === 'teacher';
  }, [user, classes, members]);

  return (
    <ClassroomContext.Provider value={{
      classes,
      currentClass,
      posts,
      assignments,
      materials,
      members,
      loading,
      fetchClasses,
      createClass,
      updateClass,
      deleteClass,
      joinClass,
      setCurrentClass,
      fetchPosts,
      createPost,
      deletePost,
      fetchAssignments,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      fetchMaterials,
      createMaterial,
      submitAssignment,
      getSubmissions,
      gradeSubmission,
      fetchMembers,
      removeMember,
      addComment,
      getComments,
      uploadFile,
      getAttachments,
      isTeacher,
    }}>
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => {
  const context = useContext(ClassroomContext);
  if (context === undefined) {
    throw new Error('useClassroom must be used within a ClassroomProvider');
  }
  return context;
};
