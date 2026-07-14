// Config-driven form + streaming output for any AI tool
import React, { useState, useCallback } from 'react';
import { Loader2, Sparkles, Copy, Check, Download, RotateCcw } from 'lucide-react';
import { streamAIChat } from '@/lib/aiChat';
import { toast } from 'sonner';
import type { AiTool } from '@/lib/aiTools';
import { cn } from '@/lib/utils';
import Flashcards from './Flashcards';

interface Props {
  tool: AiTool;
}

const AiToolRunner: React.FC<Props> = ({ tool }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const setField = (name: string, val: string) => setValues((v) => ({ ...v, [name]: val }));

  const handleFile = useCallback(async (name: string, file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // Dynamic import so bundle stays lean
        const pdfjs: any = await import('pdfjs-dist/build/pdf');
        // @ts-ignore
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
        const buf = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        let text = '';
        for (let i = 1; i <= Math.min(doc.numPages, 30); i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((it: any) => it.str).join(' ') + '\n\n';
        }
        setField(name, text.slice(0, 60_000));
        toast.success(`Extracted ${doc.numPages} pages`);
      } else {
        const text = await file.text();
        setField(name, text.slice(0, 60_000));
        toast.success('File loaded');
      }
    } catch (e) {
      toast.error('Could not read file');
    }
  }, []);

  const run = async () => {
    for (const f of tool.fields) {
      if (f.required && !values[f.name]?.toString().trim()) {
        toast.error(`${f.label} is required`);
        return;
      }
    }
    setOutput('');
    setLoading(true);
    const prompt = tool.buildPrompt(values);
    try {
      await streamAIChat({
        messages: [{ role: 'user', content: prompt }],
        mode: tool.mode,
        subject: values.subject || values.topic || tool.title,
        classTitle: tool.title,
        onDelta: (t) => setOutput((o) => o + t),
        onDone: () => setLoading(false),
        onError: (err) => {
          toast.error(err);
          setLoading(false);
        },
      });
    } catch {
      toast.error('Failed to reach AI');
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setValues({});
    setOutput('');
    setFileName(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Form */}
      <div className="bg-card border border-border rounded-2xl p-5 h-fit shadow-sm">
        <h3 className="font-google-sans text-foreground mb-4">Inputs</h3>
        <div className="space-y-4">
          {tool.fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                {f.label} {f.required && <span className="text-destructive">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  value={values[f.name] || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  rows={f.rows || 3}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              ) : f.type === 'select' ? (
                <select
                  value={values[f.name] || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="">Select…</option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === 'file' ? (
                <div>
                  <input
                    type="file"
                    accept={f.accept}
                    onChange={(e) => handleFile(f.name, e.target.files?.[0] || null)}
                    className="block w-full text-sm text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-primary file:text-white file:cursor-pointer hover:file:bg-primary-hover"
                  />
                  {fileName && <p className="mt-1 text-xs text-on-surface-variant">📎 {fileName}</p>}
                  {f.help && <p className="mt-1 text-[11px] text-on-surface-variant">{f.help}</p>}
                </div>
              ) : (
                <input
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={values[f.name] || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-5">
          <button
            onClick={run}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating…' : 'Generate'}
          </button>
          <button
            onClick={reset}
            className="h-10 px-3 rounded-full border border-border text-on-surface-variant hover:bg-surface-variant text-sm flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="bg-card border border-border rounded-2xl p-5 min-h-[400px] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-google-sans text-foreground">Output</h3>
          {output && (
            <div className="flex items-center gap-1">
              <button onClick={copy} className="gc-btn-icon" title="Copy">
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-on-surface-variant" />}
              </button>
              <button onClick={download} className="gc-btn-icon" title="Download .md">
                <Download className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          )}
        </div>

        {!output && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="w-12 h-12 text-primary/30 mb-3" />
            <p className="text-on-surface-variant">Fill the inputs and click Generate</p>
            <p className="text-xs text-on-surface-variant/70 mt-1">Real responses stream from Google Gemini</p>
          </div>
        )}

        {loading && !output && (
          <div className="flex items-center gap-2 text-on-surface-variant text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Contacting Gemini…
          </div>
        )}

        {output && tool.outputKind === 'flashcards' ? (
          <Flashcards raw={output} />
        ) : output ? (
          <div className={cn('prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words text-foreground')}>
            {output}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AiToolRunner;
