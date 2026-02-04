// Mock data for demo mode - bypasses authentication
export const MOCK_USER = {
  id: 'demo-user-001',
  email: 'demo@classroom.com',
  full_name: 'Demo User',
  avatar_url: null,
  role: 'teacher' as const,
};

export const MOCK_CLASSES = [
  {
    id: 'class-001',
    title: 'Mathematics 101',
    section: 'Section A - Morning',
    subject: 'Mathematics',
    room: 'Room 204',
    banner_color: '#1967d2',
    class_code: 'abc123',
    owner_id: MOCK_USER.id,
    description: 'Introduction to Algebra and Calculus',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_USER,
  },
  {
    id: 'class-002',
    title: 'English Literature',
    section: 'Section B - Advanced',
    subject: 'English',
    room: 'Room 105',
    banner_color: '#129eaf',
    class_code: 'def456',
    owner_id: MOCK_USER.id,
    description: 'Study of classical and modern literature',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_USER,
  },
  {
    id: 'class-003',
    title: 'Physics',
    section: 'Section C',
    subject: 'Science',
    room: 'Lab 301',
    banner_color: '#e8710a',
    class_code: 'ghi789',
    owner_id: MOCK_USER.id,
    description: 'Fundamentals of Physics',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_USER,
  },
  {
    id: 'class-004',
    title: 'Computer Science',
    section: 'AP Section',
    subject: 'Technology',
    room: 'Computer Lab',
    banner_color: '#137333',
    class_code: 'jkl012',
    owner_id: MOCK_USER.id,
    description: 'Programming and Algorithms',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: MOCK_USER,
  },
];

export const MOCK_STUDENTS = [
  { id: 's1', full_name: 'Alice Johnson', email: 'alice@school.edu', avatar_url: null },
  { id: 's2', full_name: 'Bob Smith', email: 'bob@school.edu', avatar_url: null },
  { id: 's3', full_name: 'Carol Williams', email: 'carol@school.edu', avatar_url: null },
  { id: 's4', full_name: 'David Brown', email: 'david@school.edu', avatar_url: null },
  { id: 's5', full_name: 'Eva Martinez', email: 'eva@school.edu', avatar_url: null },
];

export const MOCK_ASSIGNMENTS = [
  {
    id: 'assign-001',
    class_id: 'class-001',
    title: 'Quadratic Equations Practice',
    description: 'Complete exercises 1-20 from Chapter 5',
    instructions: 'Show all work. Due by end of week.',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    points: 100,
    topic: 'Algebra',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'assign-002',
    class_id: 'class-001',
    title: 'Calculus Chapter 3 Test',
    description: 'Derivatives and integrals assessment',
    instructions: 'Closed book test. Calculator allowed.',
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    points: 150,
    topic: 'Calculus',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'assign-003',
    class_id: 'class-002',
    title: 'Essay: Shakespeare Analysis',
    description: 'Write a 1000-word analysis of Hamlet',
    instructions: 'Focus on themes of revenge and mortality.',
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    points: 200,
    topic: 'Shakespeare',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_MATERIALS = [
  {
    id: 'mat-001',
    class_id: 'class-001',
    title: 'Chapter 5 Study Guide',
    description: 'Complete guide for quadratic equations',
    topic: 'Algebra',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    attachments: [
      { id: 'att-001', name: 'Study_Guide_Ch5.pdf', file_type: 'pdf', url: '#', file_size: 2500000 },
    ],
  },
  {
    id: 'mat-002',
    class_id: 'class-001',
    title: 'Video: Introduction to Derivatives',
    description: 'Watch this before the test',
    topic: 'Calculus',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    attachments: [
      { id: 'att-002', name: 'Derivatives_Intro.mp4', file_type: 'video', url: '#', file_size: 125000000 },
    ],
  },
  {
    id: 'mat-003',
    class_id: 'class-002',
    title: 'Hamlet Full Text',
    description: 'Complete annotated text',
    topic: 'Shakespeare',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    attachments: [
      { id: 'att-003', name: 'Hamlet_Annotated.pdf', file_type: 'pdf', url: '#', file_size: 4500000 },
      { id: 'att-004', name: 'Character_Analysis.docx', file_type: 'docx', url: '#', file_size: 350000 },
    ],
  },
  {
    id: 'mat-004',
    class_id: 'class-003',
    title: 'Physics Lab Safety Guidelines',
    description: 'Required reading before labs',
    topic: 'Lab Work',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    attachments: [
      { id: 'att-005', name: 'Lab_Safety.pptx', file_type: 'pptx', url: '#', file_size: 8500000 },
    ],
  },
  {
    id: 'mat-005',
    class_id: 'class-004',
    title: 'Introduction to Python',
    description: 'Beginner programming slides',
    topic: 'Programming Basics',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    attachments: [
      { id: 'att-006', name: 'Python_Intro.pptx', file_type: 'pptx', url: '#', file_size: 5200000 },
      { id: 'att-007', name: 'Code_Examples.zip', file_type: 'zip', url: '#', file_size: 150000 },
    ],
  },
];

export const MOCK_POSTS = [
  {
    id: 'post-001',
    class_id: 'class-001',
    author_id: MOCK_USER.id,
    content: 'Welcome to Mathematics 101! Please review the syllabus and come prepared for our first class.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    author: MOCK_USER,
  },
  {
    id: 'post-002',
    class_id: 'class-001',
    author_id: MOCK_USER.id,
    content: 'Reminder: Quiz on Chapter 4 tomorrow. Make sure to review your notes!',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    author: MOCK_USER,
  },
  {
    id: 'post-003',
    class_id: 'class-002',
    author_id: MOCK_USER.id,
    content: 'Class discussion: What themes do you find most compelling in Hamlet?',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    author: MOCK_USER,
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
  pdf: { color: '#ea4335', label: 'PDF' },
  docx: { color: '#4285f4', label: 'DOCX' },
  doc: { color: '#4285f4', label: 'DOC' },
  pptx: { color: '#ff7043', label: 'PPTX' },
  ppt: { color: '#ff7043', label: 'PPT' },
  xlsx: { color: '#0f9d58', label: 'XLSX' },
  xls: { color: '#0f9d58', label: 'XLS' },
  jpg: { color: '#f4b400', label: 'Image' },
  jpeg: { color: '#f4b400', label: 'Image' },
  png: { color: '#f4b400', label: 'Image' },
  gif: { color: '#f4b400', label: 'Image' },
  mp4: { color: '#9c27b0', label: 'Video' },
  mov: { color: '#9c27b0', label: 'Video' },
  avi: { color: '#9c27b0', label: 'Video' },
  video: { color: '#9c27b0', label: 'Video' },
  zip: { color: '#607d8b', label: 'Archive' },
  default: { color: '#5f6368', label: 'File' },
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
