// AI Answer Evaluator — staff uploads Question Paper + Answer Key + Student Answer
// Gemini returns structured suggestions. Staff reviews, edits marks, then saves.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles, ScanSearch, Save, Copy, Check, Download } from 'lucide-react';
import DemoSidebar from '@/components/layout/DemoSidebar';
import DemoHeader from '@/components/layout/DemoHeader';
import { getDemoUser, MOCK_CLASSES } from '@/data/mockData';
import AiHeader from '@/components/ai/AiHeader';
import { streamAIChat } from '@/lib/aiChat';
import { toast } from 'sonner';

async function extractText(file: File): Promise<string> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const pdfjs: any = await import('pdfjs-dist/build/pdf');
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    let text = '';
    for (let i = 1; i <= Math.min(doc.numPages, 40); i++) {
      const p = await doc.getPage(i);
      const c = await p.getTextContent();
      text += c.items.map((it: any) => it.str).join(' ') + '\n\n';
    }
    return text;
  }
  return file.text();
}

const AnswerEvaluator: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getDemoUser();
  const canUse = user.role === 'staff' || user.role === 'hod';

  const [qp, setQp] = useState('');
  const [key, setKey] = useState('');
  const [answer, setAnswer] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [subject, setSubject] = useState('');
  const [studentName, setStudentName] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [finalMarks, setFinalMarks] = useState('');
  const [copied, setCopied] = useState(false);

  const load = async (setter: (s: string) => void, file?: File | null) => {
    if (!file) return;
    try {
      const t = await extractText(file);
      setter(t);
      toast.success(`Loaded ${file.name}`);
    } catch { toast.error('Could not read file'); }
  };

  const run = async () => {
    if (!qp.trim() || !key.trim() || !answer.trim()) {
      toast.error('Question paper, answer key and student answer are required');
      return;
    }
    setOutput('');
    setLoading(true);
    const prompt =
`Total marks: ${totalMarks}
Subject: ${subject || 'General'}
Student: ${studentName || 'Unknown'}

--- QUESTION PAPER ---
${qp}

--- ANSWER KEY ---
${key}

--- STUDENT ANSWER ---
${answer}

Evaluate as instructed. Never state marks are final. Staff will review.`;
    try {
      await streamAIChat({
        messages: [{ role: 'user', content: prompt }],
        mode: 'answer_evaluator',
        subject,
        classTitle: 'Answer Evaluation',
        onDelta: (t) => setOutput((o) => o + t),
        onDone: () => setLoading(false),
        onError: (err) => { toast.error(err); setLoading(false); },
      });
    } catch { toast.error('Failed to reach AI'); setLoading(false); }
  };

  const save = () => {
    if (!finalMarks.trim()) {
      toast.error('Enter final marks before saving');
      return;
    }
    // Persist to localStorage as demo record (does not auto-publish)
    const rec = {
      id: crypto.randomUUID(),
      subject, studentName, totalMarks, finalMarks,
      aiSuggestion: output,
      savedAt: new Date().toISOString(),
    };
    const list = JSON.parse(localStorage.getItem('ai_evaluations') || '[]');
    list.unshift(rec);
    localStorage.setItem('ai_evaluations', JSON.stringify(list.slice(0, 100)));
    toast.success('Evaluation saved. Publish manually when ready.');
  };

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); toast.success('Copied'); setTimeout(() => setCopied(false), 1500); };
  const download = () => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'evaluation.md'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-surface-container">
      <DemoHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <DemoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} classes={MOCK_CLASSES} />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
          <button onClick={() => navigate('/ai')} className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4" /> AI Center
          </button>
          <AiHeader title="AI Answer Evaluator" subtitle="Upload paper, key, student answer — Gemini suggests marks, staff decides" />

          {!canUse ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-foreground">
              This tool is available to staff and HOD only.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
              <div className="bg-card border border-border rounded-2xl p-5 h-fit shadow-sm space-y-4">
                <h3 className="font-google-sans text-foreground flex items-center gap-2"><ScanSearch className="w-4 h-4 text-primary" /> Inputs</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Student name" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                </div>
                <input value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} type="number" placeholder="Total marks" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />

                <div>
                  <label className="text-xs font-medium text-on-surface-variant">Question Paper</label>
                  <input type="file" accept=".pdf,.txt,.md" onChange={(e) => load(setQp, e.target.files?.[0])} className="mt-1 block w-full text-xs" />
                  <textarea value={qp} onChange={(e) => setQp(e.target.value)} rows={3} placeholder="…or paste text" className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium text-on-surface-variant">Answer Key</label>
                  <input type="file" accept=".pdf,.txt,.md" onChange={(e) => load(setKey, e.target.files?.[0])} className="mt-1 block w-full text-xs" />
                  <textarea value={key} onChange={(e) => setKey(e.target.value)} rows={3} placeholder="…or paste text" className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium text-on-surface-variant">Student Answer</label>
                  <input type="file" accept=".pdf,.txt,.md" onChange={(e) => load(setAnswer, e.target.files?.[0])} className="mt-1 block w-full text-xs" />
                  <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} placeholder="…or type the answer" className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-xs" />
                </div>

                <button onClick={run} disabled={loading} className="w-full flex items-center justify-center gap-2 h-10 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {loading ? 'Evaluating…' : 'Evaluate with Gemini'}
                </button>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-google-sans text-foreground">AI Suggestion</h3>
                  {output && (
                    <div className="flex items-center gap-1">
                      <button onClick={copy} className="gc-btn-icon" title="Copy">{copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}</button>
                      <button onClick={download} className="gc-btn-icon" title="Download"><Download className="w-4 h-4 text-on-surface-variant" /></button>
                    </div>
                  )}
                </div>

                {!output && !loading && (
                  <div className="text-center py-16 text-on-surface-variant">
                    Upload or paste the three inputs, then evaluate. AI never publishes marks — you review and save.
                  </div>
                )}
                {loading && !output && <div className="flex items-center gap-2 text-sm text-on-surface-variant"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</div>}
                {output && (
                  <>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words text-foreground">{output}</div>
                    <div className="mt-6 border-t border-border pt-4">
                      <label className="block text-xs font-medium text-on-surface-variant mb-1.5">Final marks (staff-confirmed, out of {totalMarks || '?'})</label>
                      <div className="flex gap-2">
                        <input type="number" value={finalMarks} onChange={(e) => setFinalMarks(e.target.value)} placeholder="e.g. 78" className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                        <button onClick={save} className="flex items-center gap-1.5 px-4 h-10 rounded-full bg-success text-white text-sm font-medium hover:opacity-90">
                          <Save className="w-4 h-4" /> Save
                        </button>
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-2">Saved locally. Publish through the existing Grades tab in your class.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AnswerEvaluator;
