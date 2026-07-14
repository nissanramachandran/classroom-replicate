// Central config for AI Center tools. Each tool renders through the shared AiToolPage.
import type { AppRole } from '@/types/classroom';
import type { AIMode } from './aiChat';

export type AiFieldType = 'text' | 'textarea' | 'select' | 'number' | 'file';

export interface AiField {
  name: string;
  label: string;
  type: AiFieldType;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  rows?: number;
  accept?: string; // file input
  help?: string;
}

export interface AiTool {
  id: string;               // route slug e.g. 'doubt'
  mode: AIMode;             // edge function mode
  title: string;
  description: string;
  icon: string;             // lucide icon name
  role: AppRole[] | 'all';  // who can access
  category: 'Student' | 'Staff' | 'HOD' | 'Admin';
  fields: AiField[];
  // Build the user prompt from field values.
  buildPrompt: (values: Record<string, string>) => string;
  outputKind?: 'markdown' | 'flashcards'; // flashcards renders as JSON cards
  // If true, page accepts a PDF/text file whose extracted text is appended
  acceptsFileText?: boolean;
}

const j = (v: Record<string, string>) =>
  Object.entries(v)
    .filter(([, val]) => val && String(val).trim())
    .map(([k, val]) => `- ${k}: ${val}`)
    .join('\n');

export const AI_TOOLS: AiTool[] = [
  // ---------- STUDENT ----------
  {
    id: 'doubt',
    mode: 'doubt',
    title: 'AI Doubt Solver',
    description: 'Ask any doubt in English, Tamil, or Tanglish',
    icon: 'MessageCircleQuestion',
    role: ['student', 'staff', 'hod'],
    category: 'Student',
    fields: [
      { name: 'language', label: 'Language', type: 'select', options: ['English', 'Tamil', 'Tanglish'], required: true },
      { name: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g. Data Structures' },
      { name: 'question', label: 'Your doubt', type: 'textarea', rows: 5, required: true, placeholder: 'Explain your doubt clearly...' },
    ],
    buildPrompt: (v) =>
      `Answer in ${v.language || 'English'}${v.subject ? ` (subject: ${v.subject})` : ''}.\n\nDoubt:\n${v.question}`,
  },
  {
    id: 'notes',
    mode: 'student_notes',
    title: 'AI Notes Generator',
    description: 'Structured notes on any topic',
    icon: 'NotebookPen',
    role: ['student'],
    category: 'Student',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true, placeholder: 'e.g. Binary Search Trees' },
      { name: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'style', label: 'Style', type: 'select', options: ['Concise', 'Detailed', 'Bullet points', 'Cheat sheet'] },
    ],
    buildPrompt: (v) => `Generate ${v.style || 'detailed'} notes at ${v.level || 'intermediate'} level on:\n${v.topic}`,
  },
  {
    id: 'practice',
    mode: 'practice_questions',
    title: 'AI Practice Questions',
    description: 'MCQs, short and long answer practice',
    icon: 'ListChecks',
    role: ['student'],
    category: 'Student',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard', 'Mixed'] },
      { name: 'count', label: 'How many questions', type: 'number', placeholder: '10' },
    ],
    buildPrompt: (v) => `Create ${v.count || 10} ${v.difficulty || 'mixed'} practice questions on: ${v.topic}. Include answers at the end.`,
  },
  {
    id: 'flashcards',
    mode: 'flashcards',
    title: 'AI Flashcards',
    description: 'Flip-card style Q/A for quick revision',
    icon: 'Layers',
    role: ['student'],
    category: 'Student',
    outputKind: 'flashcards',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'count', label: 'Number of cards', type: 'number', placeholder: '12' },
    ],
    buildPrompt: (v) => `Generate ${v.count || 12} flashcards on: ${v.topic}. Return ONLY a JSON array [{"q":"...","a":"..."}]. No markdown fences.`,
  },
  {
    id: 'explain',
    mode: 'topic_explanation',
    title: 'AI Topic Explanation',
    description: 'Deep dive with intuition, examples, mistakes',
    icon: 'Lightbulb',
    role: ['student'],
    category: 'Student',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'level', label: 'Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
    ],
    buildPrompt: (v) => `Explain deeply at ${v.level || 'intermediate'} level: ${v.topic}`,
  },
  {
    id: 'pdf-summarizer',
    mode: 'pdf_summarizer',
    title: 'AI PDF Summarizer',
    description: 'Upload a PDF and get a smart summary',
    icon: 'FileText',
    role: ['student', 'staff'],
    category: 'Student',
    acceptsFileText: true,
    fields: [
      { name: 'file', label: 'PDF / text file', type: 'file', accept: '.pdf,.txt,.md', help: 'Text is extracted client-side; nothing is uploaded to storage.' },
      { name: 'focus', label: 'Focus (optional)', type: 'text', placeholder: 'e.g. focus on chapter 3' },
    ],
    buildPrompt: (v) => `Summarize the document below.${v.focus ? ` Focus: ${v.focus}.` : ''}\n\n--- DOCUMENT ---\n${v.file || ''}`,
  },
  {
    id: 'translator',
    mode: 'translator',
    title: 'Tamil ↔ English Translator',
    description: 'Bidirectional academic translation',
    icon: 'Languages',
    role: ['student', 'staff', 'hod'],
    category: 'Student',
    fields: [
      { name: 'direction', label: 'Direction', type: 'select', options: ['Auto detect', 'English → Tamil', 'Tamil → English'] },
      { name: 'text', label: 'Text', type: 'textarea', rows: 6, required: true },
    ],
    buildPrompt: (v) => `Direction: ${v.direction || 'Auto detect'}\n\nText:\n${v.text}`,
  },
  {
    id: 'learning-suggestions',
    mode: 'learning_suggestions',
    title: 'AI Learning Suggestions',
    description: 'Personalized next steps and resources',
    icon: 'Compass',
    role: ['student'],
    category: 'Student',
    fields: [
      { name: 'subjects', label: 'Current subjects', type: 'text', placeholder: 'DS, DBMS, OS...' },
      { name: 'goals', label: 'Goals', type: 'textarea', rows: 3, placeholder: 'e.g. crack placement, build a project' },
      { name: 'weekHours', label: 'Available hours/week', type: 'number', placeholder: '10' },
    ],
    buildPrompt: (v) => `Give personalized learning suggestions.\n${j(v)}`,
  },
  {
    id: 'weak-topics',
    mode: 'weak_topic_analysis',
    title: 'Weak Topic Analysis',
    description: 'Identify weak areas and fix them',
    icon: 'AlertTriangle',
    role: ['student'],
    category: 'Student',
    fields: [
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'struggles', label: 'What are you struggling with?', type: 'textarea', rows: 5, required: true },
      { name: 'recentScores', label: 'Recent scores (optional)', type: 'text', placeholder: 'e.g. Test1 45%, Test2 52%' },
    ],
    buildPrompt: (v) => `Analyze weak topics.\n${j(v)}`,
  },
  {
    id: 'study-planner',
    mode: 'study_planner',
    title: 'AI Study Planner',
    description: 'Day-by-day plan tailored to you',
    icon: 'CalendarClock',
    role: ['student'],
    category: 'Student',
    fields: [
      { name: 'goal', label: 'Goal', type: 'text', required: true, placeholder: 'e.g. Prepare for DBMS semester exam' },
      { name: 'days', label: 'Days available', type: 'number', placeholder: '14' },
      { name: 'hoursPerDay', label: 'Hours per day', type: 'number', placeholder: '3' },
      { name: 'topics', label: 'Topics to cover', type: 'textarea', rows: 3 },
    ],
    buildPrompt: (v) => `Build a detailed study plan.\n${j(v)}`,
  },

  // ---------- STAFF ----------
  {
    id: 'question-paper',
    mode: 'generate_question_paper',
    title: 'AI Question Paper Generator',
    description: 'Full exam paper with answer key, Bloom, CO/PO',
    icon: 'ClipboardList',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text', placeholder: 'IT / CSE / ECE ...' },
      { name: 'year', label: 'Year', type: 'text' },
      { name: 'semester', label: 'Semester', type: 'text' },
      { name: 'regulation', label: 'Regulation', type: 'text', placeholder: 'e.g. R2021' },
      { name: 'unit', label: 'Unit(s)', type: 'text' },
      { name: 'topic', label: 'Topic focus', type: 'text' },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard', 'Mixed'] },
      { name: 'examType', label: 'Exam type', type: 'select', options: ['Internal', 'Semester', 'Model', 'Unit test'] },
      { name: 'totalMarks', label: 'Total marks', type: 'number', placeholder: '100' },
      { name: 'duration', label: 'Duration', type: 'text', placeholder: '3 hours' },
    ],
    buildPrompt: (v) => `Generate a full question paper with Part A (2-mark), Part B (5-mark), Part C (10-mark), Answer Key, Bloom Taxonomy tagging, CO mapping and PO mapping.\n${j(v)}`,
  },
  {
    id: 'quiz-generator',
    mode: 'generate_quiz',
    title: 'AI Quiz Generator',
    description: 'MCQ, True/False, Fill blanks, Short Qs',
    icon: 'HelpCircle',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'mcq', label: 'MCQ count', type: 'number', placeholder: '5' },
      { name: 'trueFalse', label: 'True/False count', type: 'number', placeholder: '5' },
      { name: 'fillBlanks', label: 'Fill in the blanks', type: 'number', placeholder: '5' },
      { name: 'shortQs', label: 'Short questions', type: 'number', placeholder: '3' },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard', 'Mixed'] },
    ],
    buildPrompt: (v) => `Create a quiz. Include correct answers and explanations.\n${j(v)}`,
  },
  {
    id: 'assignment-generator',
    mode: 'generate_assignment',
    title: 'AI Assignment Generator',
    description: 'Complete assignment with rubric',
    icon: 'FileText',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'level', label: 'Level', type: 'select', options: ['UG', 'PG'] },
      { name: 'points', label: 'Points', type: 'number', placeholder: '100' },
      { name: 'dueDays', label: 'Due in (days)', type: 'number' },
    ],
    buildPrompt: (v) => `Generate a complete assignment.\n${j(v)}`,
  },
  {
    id: 'study-material',
    mode: 'study_material',
    title: 'AI Study Material Generator',
    description: 'Structured chapter-style material',
    icon: 'BookOpen',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'unit', label: 'Unit', type: 'text' },
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'depth', label: 'Depth', type: 'select', options: ['Overview', 'Standard', 'In-depth'] },
    ],
    buildPrompt: (v) => `Generate structured study material.\n${j(v)}`,
  },
  {
    id: 'lesson-plan',
    mode: 'lesson_plan',
    title: 'AI Lesson Plan Generator',
    description: 'Minute-by-minute lesson plan',
    icon: 'CalendarDays',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', placeholder: '60' },
      { name: 'audience', label: 'Audience', type: 'text', placeholder: 'e.g. 3rd year IT' },
    ],
    buildPrompt: (v) => `Generate a detailed lesson plan.\n${j(v)}`,
  },
  {
    id: 'rubric',
    mode: 'rubric',
    title: 'AI Rubric Generator',
    description: 'Grading rubric table',
    icon: 'Table2',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'assessmentTitle', label: 'Assessment title', type: 'text', required: true },
      { name: 'criteria', label: 'Criteria (comma separated)', type: 'text', placeholder: 'Clarity, Accuracy, Depth, Presentation' },
      { name: 'totalPoints', label: 'Total points', type: 'number', placeholder: '100' },
    ],
    buildPrompt: (v) => `Generate a rubric as a markdown table.\n${j(v)}`,
  },
  {
    id: 'feedback',
    mode: 'feedback',
    title: 'AI Feedback Generator',
    description: 'Constructive student feedback',
    icon: 'MessageSquareHeart',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'studentName', label: 'Student name (optional)', type: 'text' },
      { name: 'context', label: 'Context / performance summary', type: 'textarea', rows: 4, required: true },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Encouraging', 'Neutral', 'Direct'] },
    ],
    buildPrompt: (v) => `Write feedback.\n${j(v)}`,
  },
  {
    id: 'coding-question',
    mode: 'coding_question',
    title: 'AI Coding Question Generator',
    description: 'Problem + I/O + sample + solution',
    icon: 'Code2',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', required: true, placeholder: 'e.g. Dynamic Programming' },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'] },
      { name: 'language', label: 'Language', type: 'select', options: ['Python', 'C++', 'Java', 'JavaScript', 'C'] },
    ],
    buildPrompt: (v) => `Generate a coding question with reference solution.\n${j(v)}`,
  },
  {
    id: 'viva-question',
    mode: 'viva',
    title: 'AI Viva Question Generator',
    description: 'Viva questions with model answers',
    icon: 'Mic',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'topic', label: 'Topic', type: 'text', required: true },
      { name: 'count', label: 'How many', type: 'number', placeholder: '12' },
    ],
    buildPrompt: (v) => `Generate viva questions with model answers.\n${j(v)}`,
  },
  {
    id: 'lab-question',
    mode: 'lab_question',
    title: 'AI Lab Question Generator',
    description: 'Full lab experiment write-up',
    icon: 'FlaskConical',
    role: ['staff', 'hod'],
    category: 'Staff',
    fields: [
      { name: 'subject', label: 'Lab subject', type: 'text', required: true },
      { name: 'experiment', label: 'Experiment title / topic', type: 'text', required: true },
      { name: 'tools', label: 'Tools / software', type: 'text' },
    ],
    buildPrompt: (v) => `Generate a lab experiment write-up.\n${j(v)}`,
  },

  // ---------- HOD ----------
  {
    id: 'dept-performance',
    mode: 'hod_department_performance',
    title: 'Department Performance',
    description: 'Analyze department KPIs',
    icon: 'BarChart3',
    role: ['hod'],
    category: 'HOD',
    fields: [
      { name: 'department', label: 'Department', type: 'text', required: true },
      { name: 'data', label: 'Context / raw stats', type: 'textarea', rows: 6, required: true, placeholder: 'Paste results, pass %, attendance, feedback...' },
    ],
    buildPrompt: (v) => `Analyze department performance.\n${j(v)}`,
  },
  {
    id: 'faculty-performance',
    mode: 'hod_faculty_performance',
    title: 'Faculty Performance',
    description: 'Faculty analytics & recommendations',
    icon: 'Users',
    role: ['hod'],
    category: 'HOD',
    fields: [
      { name: 'faculty', label: 'Faculty name(s)', type: 'text', required: true },
      { name: 'data', label: 'Context', type: 'textarea', rows: 6, required: true },
    ],
    buildPrompt: (v) => `Analyze faculty performance.\n${j(v)}`,
  },
  {
    id: 'student-prediction',
    mode: 'hod_student_prediction',
    title: 'Student Prediction',
    description: 'Predict outcomes & risk',
    icon: 'TrendingUp',
    role: ['hod'],
    category: 'HOD',
    fields: [
      { name: 'cohort', label: 'Cohort / batch', type: 'text', required: true },
      { name: 'data', label: 'Student data', type: 'textarea', rows: 6, required: true },
    ],
    buildPrompt: (v) => `Predict student outcomes.\n${j(v)}`,
  },
  {
    id: 'dept-reports',
    mode: 'hod_reports',
    title: 'Department Reports',
    description: 'Generate formal reports',
    icon: 'FileBarChart',
    role: ['hod'],
    category: 'HOD',
    fields: [
      { name: 'reportType', label: 'Report type', type: 'select', options: ['Monthly', 'Quarterly', 'Annual', 'NAAC', 'NBA'] },
      { name: 'department', label: 'Department', type: 'text', required: true },
      { name: 'data', label: 'Inputs', type: 'textarea', rows: 6, required: true },
    ],
    buildPrompt: (v) => `Generate a department report.\n${j(v)}`,
  },
];

export const getToolById = (id: string) => AI_TOOLS.find((t) => t.id === id);
export const getToolsForRole = (role: AppRole | null | undefined) =>
  AI_TOOLS.filter((t) => t.role === 'all' || (role && t.role.includes(role)));
