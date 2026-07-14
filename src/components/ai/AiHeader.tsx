// Shared header shown on every AI page
import React from 'react';
import { Sparkles } from 'lucide-react';

const AiHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-sm shrink-0">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
    <div className="min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-2xl font-google-sans text-foreground truncate">🤖 {title}</h1>
      </div>
      <p className="text-sm text-on-surface-variant">
        {subtitle || 'AI Assistant'} · <span className="text-primary font-medium">Powered by Google Gemini</span>
      </p>
    </div>
  </div>
);

export default AiHeader;
