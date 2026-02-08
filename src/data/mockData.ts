// Mock data for demo mode - bypasses authentication
import { AppRole, Department } from '@/types/classroom';

// Demo user with configurable role - stored in localStorage for persistence
const getStoredDemoRole = (): AppRole => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('demoUserRole') as AppRole) || 'teacher';
  }
  return 'teacher';
};

const getStoredDemoDepartment = (): Department => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('demoUserDepartment') as Department) || 'IT';
  }
  return 'IT';
};

export const getDemoUser = () => ({
  id: 'demo-user-001',
  email: 'demo@classroom.com',
  full_name: 'Demo User',
  avatar_url: null,
  role: getStoredDemoRole(),
  department: getStoredDemoDepartment(),
});

export const setDemoUserRole = (role: AppRole, department?: Department) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('demoUserRole', role);
    if (department) {
      localStorage.setItem('demoUserDepartment', department);
    }
  }
};

// For backward compatibility
export const MOCK_USER = getDemoUser();

export const MOCK_TEACHERS = [
  { id: 't1', full_name: 'Dr. Sarah Johnson', email: 'sarah.j@university.edu', avatar_url: null, role: 'teacher' as const },
  { id: 't2', full_name: 'Prof. Michael Chen', email: 'michael.c@university.edu', avatar_url: null, role: 'teacher' as const },
  { id: 't3', full_name: 'Dr. Emily Davis', email: 'emily.d@university.edu', avatar_url: null, role: 'teacher' as const },
  { id: 't4', full_name: 'Prof. Robert Wilson', email: 'robert.w@university.edu', avatar_url: null, role: 'teacher' as const },
  { id: 't5', full_name: 'Dr. Amanda Lopez', email: 'amanda.l@university.edu', avatar_url: null, role: 'teacher' as const },
];

export const MOCK_CLASSES = [
  {
    id: 'class-001',
    title: 'OOSE-3 YR (IT)',
    section: '2025–2026',
    subject: 'Object Oriented Software Engineering',
    room: 'Room 301',
    banner_color: '#1967d2',
    class_code: 'OOSE3Y',
    owner_id: MOCK_USER.id,
    description: 'Object Oriented Software Engineering for 3rd Year IT students',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_TEACHERS[0],
  },
  {
    id: 'class-002',
    title: 'III Year',
    section: '2025–2026',
    subject: 'Computer Science',
    room: 'Room 205',
    banner_color: '#129eaf',
    class_code: 'IIY26',
    owner_id: MOCK_USER.id,
    description: 'Third Year Computer Science Core Subjects',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_TEACHERS[1],
  },
  {
    id: 'class-003',
    title: 'OEE351 – Renewable Energy',
    section: 'Open Elective',
    subject: 'Environmental Science',
    room: 'Lab 102',
    banner_color: '#0f9d58',
    class_code: 'OEE351',
    owner_id: MOCK_USER.id,
    description: 'Introduction to Renewable Energy Sources and Sustainability',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_TEACHERS[2],
  },
  {
    id: 'class-004',
    title: 'Virtualization CCS372',
    section: 'Cloud Computing',
    subject: 'Technology',
    room: 'Computer Lab A',
    banner_color: '#e8710a',
    class_code: 'VRT372',
    owner_id: MOCK_USER.id,
    description: 'Virtualization Technologies and Cloud Infrastructure',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_TEACHERS[3],
  },
  {
    id: 'class-005',
    title: 'III IT',
    section: '2023–2027',
    subject: 'Information Technology',
    room: 'Room 401',
    banner_color: '#a142f4',
    class_code: 'IIIT27',
    owner_id: MOCK_USER.id,
    description: 'Information Technology Batch 2023-2027',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_TEACHERS[4],
  },
  {
    id: 'class-006',
    title: 'Mathematics 101',
    section: 'Section A – Morning',
    subject: 'Mathematics',
    room: 'Room 204',
    banner_color: '#1967d2',
    class_code: 'MTH101',
    owner_id: MOCK_USER.id,
    description: 'Introduction to Algebra and Calculus',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_TEACHERS[0],
  },
  {
    id: 'class-007',
    title: 'English Literature',
    section: 'Section B – Advanced',
    subject: 'English',
    room: 'Room 105',
    banner_color: '#c5221f',
    class_code: 'ENG201',
    owner_id: MOCK_USER.id,
    description: 'Study of classical and modern literature',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_TEACHERS[1],
  },
  {
    id: 'class-008',
    title: 'Physics',
    section: 'Section C',
    subject: 'Science',
    room: 'Lab 301',
    banner_color: '#f4b400',
    class_code: 'PHY101',
    owner_id: MOCK_USER.id,
    description: 'Fundamentals of Physics - Mechanics and Thermodynamics',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_TEACHERS[2],
  },
  {
    id: 'class-009',
    title: 'Computer Science',
    section: 'AP Section',
    subject: 'Technology',
    room: 'Computer Lab B',
    banner_color: '#137333',
    class_code: 'CSAP01',
    owner_id: MOCK_USER.id,
    description: 'Advanced Placement Computer Science - Programming and Algorithms',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_TEACHERS[3],
  },
];

export const MOCK_STUDENTS = [
  { id: 's1', full_name: 'Alice Johnson', email: 'alice@school.edu', avatar_url: null },
  { id: 's2', full_name: 'Bob Smith', email: 'bob@school.edu', avatar_url: null },
  { id: 's3', full_name: 'Carol Williams', email: 'carol@school.edu', avatar_url: null },
  { id: 's4', full_name: 'David Brown', email: 'david@school.edu', avatar_url: null },
  { id: 's5', full_name: 'Eva Martinez', email: 'eva@school.edu', avatar_url: null },
  { id: 's6', full_name: 'Frank Lee', email: 'frank@school.edu', avatar_url: null },
  { id: 's7', full_name: 'Grace Kim', email: 'grace@school.edu', avatar_url: null },
  { id: 's8', full_name: 'Henry Taylor', email: 'henry@school.edu', avatar_url: null },
];

// Generate dates relative to today
const today = new Date();
const addDays = (days: number) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
const subtractDays = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_ASSIGNMENTS = [
  {
    id: 'assign-001',
    class_id: 'class-001',
    title: 'UML Diagram for Library System',
    description: 'Create complete UML class diagrams for the library management system',
    instructions: 'Include all classes, relationships, and cardinality. Use proper UML notation.',
    due_date: addDays(3),
    points: 100,
    topic: 'UML Design',
    created_at: subtractDays(5),
    updated_at: subtractDays(5),
    status: 'assigned',
  },
  {
    id: 'assign-002',
    class_id: 'class-001',
    title: 'Design Patterns Implementation',
    description: 'Implement Singleton and Factory patterns in Java',
    instructions: 'Create working code examples with proper documentation.',
    due_date: addDays(7),
    points: 150,
    topic: 'Design Patterns',
    created_at: subtractDays(3),
    updated_at: subtractDays(3),
    status: 'assigned',
  },
  {
    id: 'assign-003',
    class_id: 'class-003',
    title: 'Solar Panel Efficiency Report',
    description: 'Research and write a report on solar panel efficiency improvements',
    instructions: 'Include recent technological advances and future prospects. Minimum 2000 words.',
    due_date: addDays(5),
    points: 200,
    topic: 'Solar Energy',
    created_at: subtractDays(7),
    updated_at: subtractDays(7),
    status: 'assigned',
  },
  {
    id: 'assign-004',
    class_id: 'class-004',
    title: 'Docker Container Lab',
    description: 'Complete the Docker containerization lab exercise',
    instructions: 'Create Dockerfile, build image, and deploy container. Submit screenshots.',
    due_date: addDays(2),
    points: 80,
    topic: 'Containerization',
    created_at: subtractDays(4),
    updated_at: subtractDays(4),
    status: 'assigned',
  },
  {
    id: 'assign-005',
    class_id: 'class-006',
    title: 'Quadratic Equations Practice',
    description: 'Complete exercises 1-20 from Chapter 5',
    instructions: 'Show all work. Due by end of week.',
    due_date: addDays(4),
    points: 100,
    topic: 'Algebra',
    created_at: subtractDays(2),
    updated_at: subtractDays(2),
    status: 'assigned',
  },
  {
    id: 'assign-006',
    class_id: 'class-006',
    title: 'Calculus Chapter 3 Test',
    description: 'Derivatives and integrals assessment',
    instructions: 'Closed book test. Calculator allowed.',
    due_date: addDays(10),
    points: 150,
    topic: 'Calculus',
    created_at: subtractDays(1),
    updated_at: subtractDays(1),
    status: 'assigned',
  },
  {
    id: 'assign-007',
    class_id: 'class-007',
    title: 'Essay: Shakespeare Analysis',
    description: 'Write a 1000-word analysis of Hamlet',
    instructions: 'Focus on themes of revenge and mortality.',
    due_date: addDays(6),
    points: 200,
    topic: 'Shakespeare',
    created_at: subtractDays(8),
    updated_at: subtractDays(8),
    status: 'assigned',
  },
  {
    id: 'assign-008',
    class_id: 'class-008',
    title: 'Newton\'s Laws Lab Report',
    description: 'Complete the mechanics lab and submit report',
    instructions: 'Include methodology, observations, and conclusions.',
    due_date: addDays(1),
    points: 120,
    topic: 'Mechanics',
    created_at: subtractDays(6),
    updated_at: subtractDays(6),
    status: 'assigned',
  },
  {
    id: 'assign-009',
    class_id: 'class-009',
    title: 'Algorithm Analysis Project',
    description: 'Analyze time complexity of sorting algorithms',
    instructions: 'Compare bubble, merge, and quick sort with Big O analysis.',
    due_date: addDays(8),
    points: 180,
    topic: 'Algorithms',
    created_at: subtractDays(4),
    updated_at: subtractDays(4),
    status: 'assigned',
  },
  {
    id: 'assign-010',
    class_id: 'class-002',
    title: 'Database Design Project',
    description: 'Design a normalized database for an e-commerce system',
    instructions: 'Create ER diagram and SQL schema. Include at least 10 tables.',
    due_date: addDays(12),
    points: 250,
    topic: 'Database Systems',
    created_at: subtractDays(2),
    updated_at: subtractDays(2),
    status: 'assigned',
  },
];

export const MOCK_MATERIALS = [
  {
    id: 'mat-001',
    class_id: 'class-001',
    title: 'OOSE Course Syllabus',
    description: 'Complete course syllabus and evaluation criteria',
    topic: 'Course Info',
    created_at: subtractDays(30),
    updated_at: subtractDays(30),
    attachments: [
      { id: 'att-001', name: 'OOSE_Syllabus_2025.pdf', file_type: 'pdf', url: '#', file_size: 1200000 },
    ],
  },
  {
    id: 'mat-002',
    class_id: 'class-001',
    title: 'UML Diagram Reference Guide',
    description: 'Complete reference for UML notation and diagrams',
    topic: 'UML Design',
    created_at: subtractDays(20),
    updated_at: subtractDays(20),
    attachments: [
      { id: 'att-002', name: 'UML_Reference.pdf', file_type: 'pdf', url: '#', file_size: 3500000 },
      { id: 'att-003', name: 'UML_Examples.pptx', file_type: 'pptx', url: '#', file_size: 8500000 },
    ],
  },
  {
    id: 'mat-003',
    class_id: 'class-001',
    title: 'Design Patterns eBook',
    description: 'Gang of Four Design Patterns reference',
    topic: 'Design Patterns',
    created_at: subtractDays(15),
    updated_at: subtractDays(15),
    attachments: [
      { id: 'att-004', name: 'Design_Patterns.pdf', file_type: 'pdf', url: '#', file_size: 12000000 },
    ],
  },
  {
    id: 'mat-004',
    class_id: 'class-003',
    title: 'Renewable Energy Introduction',
    description: 'Overview of renewable energy sources',
    topic: 'Introduction',
    created_at: subtractDays(25),
    updated_at: subtractDays(25),
    attachments: [
      { id: 'att-005', name: 'Renewable_Energy_Intro.pptx', file_type: 'pptx', url: '#', file_size: 15000000 },
    ],
  },
  {
    id: 'mat-005',
    class_id: 'class-004',
    title: 'Docker Getting Started Guide',
    description: 'Step-by-step Docker installation and usage',
    topic: 'Containerization',
    created_at: subtractDays(10),
    updated_at: subtractDays(10),
    attachments: [
      { id: 'att-006', name: 'Docker_Guide.pdf', file_type: 'pdf', url: '#', file_size: 4500000 },
      { id: 'att-007', name: 'Docker_Cheatsheet.pdf', file_type: 'pdf', url: '#', file_size: 250000 },
    ],
  },
  {
    id: 'mat-006',
    class_id: 'class-006',
    title: 'Chapter 5 Study Guide',
    description: 'Complete guide for quadratic equations',
    topic: 'Algebra',
    created_at: subtractDays(5),
    updated_at: subtractDays(5),
    attachments: [
      { id: 'att-008', name: 'Study_Guide_Ch5.pdf', file_type: 'pdf', url: '#', file_size: 2500000 },
    ],
  },
  {
    id: 'mat-007',
    class_id: 'class-007',
    title: 'Hamlet Full Text',
    description: 'Complete annotated text',
    topic: 'Shakespeare',
    created_at: subtractDays(20),
    updated_at: subtractDays(20),
    attachments: [
      { id: 'att-009', name: 'Hamlet_Annotated.pdf', file_type: 'pdf', url: '#', file_size: 4500000 },
      { id: 'att-010', name: 'Character_Analysis.docx', file_type: 'docx', url: '#', file_size: 350000 },
    ],
  },
  {
    id: 'mat-008',
    class_id: 'class-008',
    title: 'Physics Lab Safety Guidelines',
    description: 'Required reading before labs',
    topic: 'Lab Work',
    created_at: subtractDays(30),
    updated_at: subtractDays(30),
    attachments: [
      { id: 'att-011', name: 'Lab_Safety.pptx', file_type: 'pptx', url: '#', file_size: 8500000 },
    ],
  },
  {
    id: 'mat-009',
    class_id: 'class-009',
    title: 'Introduction to Python',
    description: 'Beginner programming slides',
    topic: 'Programming Basics',
    created_at: subtractDays(15),
    updated_at: subtractDays(15),
    attachments: [
      { id: 'att-012', name: 'Python_Intro.pptx', file_type: 'pptx', url: '#', file_size: 5200000 },
      { id: 'att-013', name: 'Code_Examples.zip', file_type: 'zip', url: '#', file_size: 150000 },
    ],
  },
];

export const MOCK_POSTS = [
  {
    id: 'post-001',
    class_id: 'class-001',
    author_id: MOCK_USER.id,
    content: 'Welcome to OOSE-3! This semester we will cover advanced software engineering concepts including design patterns, UML, and agile methodologies.',
    created_at: subtractDays(2),
    updated_at: subtractDays(2),
    author: MOCK_TEACHERS[0],
  },
  {
    id: 'post-002',
    class_id: 'class-001',
    author_id: MOCK_USER.id,
    content: 'Reminder: UML assignment due this Friday. Make sure to include all required diagrams.',
    created_at: subtractDays(1),
    updated_at: subtractDays(1),
    author: MOCK_TEACHERS[0],
  },
  {
    id: 'post-003',
    class_id: 'class-003',
    author_id: MOCK_USER.id,
    content: 'Great class today on solar panel efficiency! Don\'t forget to start your research for the upcoming report.',
    created_at: subtractDays(3),
    updated_at: subtractDays(3),
    author: MOCK_TEACHERS[2],
  },
  {
    id: 'post-004',
    class_id: 'class-004',
    author_id: MOCK_USER.id,
    content: 'Lab session tomorrow at 2 PM. Please come prepared with Docker installed on your laptops.',
    created_at: subtractDays(1),
    updated_at: subtractDays(1),
    author: MOCK_TEACHERS[3],
  },
];

export const MOCK_SUBMISSIONS = [
  {
    id: 'sub-001',
    assignment_id: 'assign-001',
    student_id: 's1',
    content: 'Completed assignment',
    status: 'submitted',
    submitted_at: new Date().toISOString(),
    student: MOCK_STUDENTS[0],
    grade: { grade: 95, feedback: 'Excellent work!' },
  },
  {
    id: 'sub-002',
    assignment_id: 'assign-001',
    student_id: 's2',
    content: null,
    status: 'assigned',
    submitted_at: null,
    student: MOCK_STUDENTS[1],
    grade: null,
  },
  {
    id: 'sub-003',
    assignment_id: 'assign-001',
    student_id: 's3',
    content: 'Here is my work',
    status: 'submitted',
    submitted_at: new Date().toISOString(),
    student: MOCK_STUDENTS[2],
    grade: { grade: 88, feedback: 'Good effort, review problem 15' },
  },
];

// File type icons mapping
export const FILE_TYPE_CONFIG = {
  pdf: { color: '#ea4335', label: 'PDF', icon: 'file-text' },
  docx: { color: '#4285f4', label: 'DOCX', icon: 'file-text' },
  doc: { color: '#4285f4', label: 'DOC', icon: 'file-text' },
  pptx: { color: '#ff7043', label: 'PPTX', icon: 'presentation' },
  ppt: { color: '#ff7043', label: 'PPT', icon: 'presentation' },
  xlsx: { color: '#0f9d58', label: 'XLSX', icon: 'table' },
  xls: { color: '#0f9d58', label: 'XLS', icon: 'table' },
  jpg: { color: '#f4b400', label: 'Image', icon: 'image' },
  jpeg: { color: '#f4b400', label: 'Image', icon: 'image' },
  png: { color: '#f4b400', label: 'Image', icon: 'image' },
  gif: { color: '#f4b400', label: 'Image', icon: 'image' },
  mp4: { color: '#9c27b0', label: 'Video', icon: 'video' },
  mov: { color: '#9c27b0', label: 'Video', icon: 'video' },
  avi: { color: '#9c27b0', label: 'Video', icon: 'video' },
  video: { color: '#9c27b0', label: 'Video', icon: 'video' },
  zip: { color: '#607d8b', label: 'Archive', icon: 'archive' },
  default: { color: '#5f6368', label: 'File', icon: 'file' },
};

export const getFileTypeConfig = (fileType: string | null) => {
  if (!fileType) return FILE_TYPE_CONFIG.default;
  const type = fileType.toLowerCase().replace('.', '');
  return FILE_TYPE_CONFIG[type as keyof typeof FILE_TYPE_CONFIG] || FILE_TYPE_CONFIG.default;
};

export const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Helper to get class by ID
export const getClassById = (id: string) => MOCK_CLASSES.find(c => c.id === id);

// Helper to get assignments for a class
export const getAssignmentsByClassId = (classId: string) => 
  MOCK_ASSIGNMENTS.filter(a => a.class_id === classId);

// Helper to get materials for a class
export const getMaterialsByClassId = (classId: string) => 
  MOCK_MATERIALS.filter(m => m.class_id === classId);

// Helper to get posts for a class
export const getPostsByClassId = (classId: string) => 
  MOCK_POSTS.filter(p => p.class_id === classId);
