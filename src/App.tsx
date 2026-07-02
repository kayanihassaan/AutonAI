import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Terminal, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  History, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Info, 
  Code,
  BookOpen,
  X,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Framework, GenerationOptions, ScriptItem } from './types';
import { TEMPLATES } from './data/templates';
import { highlightCode } from './utils/highlighter';

export default function App() {
  const [criteria, setCriteria] = useState<string>(TEMPLATES[0].criteria);
  const [framework, setFramework] = useState<Framework>('playwright-ts');
  const [options, setOptions] = useState<GenerationOptions>({
    pom: false,
    robustSelectors: true,
    includeViewport: false,
  });
  const [filename, setFilename] = useState<string>('auth.spec.ts');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refactorInstruction, setRefactorInstruction] = useState<string>('');
  const [isRefactoring, setIsRefactoring] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'notes'>('code');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedScripts, setSavedScripts] = useState<ScriptItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [webLoading, setWebLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWebLoading(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  // Save to history helper (ongoing session only, no localStorage)
  const saveToHistory = (item: ScriptItem) => {
    setSavedScripts((prev) => [item, ...prev.slice(0, 19)]); // Keep last 20 in state
  };

  // Clear history helper
  const clearHistory = () => {
    setSavedScripts([]);
  };

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    const tmpl = TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setCriteria(tmpl.criteria);
      setFramework(tmpl.framework);
    }
  };

  // Trigger main generation
  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedCode('');
    setNotes('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework,
          criteria,
          options
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      setFilename(data.filename);
      setGeneratedCode(data.code);
      setNotes(data.notes);
      setActiveTab('code');

      // Save to history
      const newScript: ScriptItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: data.filename,
        criteria,
        code: data.code,
        notes: data.notes,
        framework,
        timestamp: Date.now()
      };
      saveToHistory(newScript);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Refactor
  const handleRefactor = async () => {
    if (!refactorInstruction.trim()) return;
    setIsRefactoring(true);
    setError(null);

    try {
      const response = await fetch('/api/refactor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          framework,
          criteria,
          currentCode: generatedCode,
          instruction: refactorInstruction
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${response.status}`);
      }

      const data = await response.json();
      setFilename(data.filename);
      setGeneratedCode(data.code);
      setNotes(data.notes);
      setRefactorInstruction('');
      setActiveTab('code');

      // Add to history
      const newScript: ScriptItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: `Refactored: ${data.filename}`,
        criteria: `${criteria}\n\nRefactor instruction: ${refactorInstruction}`,
        code: data.code,
        notes: data.notes,
        framework,
        timestamp: Date.now()
      };
      saveToHistory(newScript);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during refactoring.');
    } finally {
      setIsRefactoring(false);
    }
  };

  // Load from history
  const handleLoadFromHistory = (item: ScriptItem) => {
    setCriteria(item.criteria);
    setFramework(item.framework);
    setFilename(item.name);
    setGeneratedCode(item.code);
    setNotes(item.notes);
    setActiveTab('code');
    setShowHistory(false);
  };

  // Copy code to clipboard
  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download code as file
  const handleDownload = () => {
    if (!generatedCode) return;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-red-950/60 selection:text-red-200">
      
      {/* Web Loading Sliding Overlay */}
      <div className={`fixed inset-0 z-50 flex pointer-events-none transition-all duration-1000 ${!webLoading ? 'opacity-0' : ''}`}>
        <div 
          className="w-1/2 h-full bg-zinc-950 border-r border-red-900/30 flex flex-col items-end justify-center pr-10 pointer-events-auto"
          style={{
            transition: 'transform 1.2s cubic-bezier(0.85, 0, 0.15, 1)',
            transform: webLoading ? 'translateX(0)' : 'translateX(-100%)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl">
              <Terminal className="h-10 w-10 text-red-500 animate-pulse" />
            </div>
            <h1 className="text-6xl font-display font-black text-white tracking-tight uppercase">
              Auton
            </h1>
          </div>
        </div>
        <div 
          className="w-1/2 h-full bg-zinc-950 border-l border-red-900/30 flex flex-col items-start justify-center pl-10 pointer-events-auto"
          style={{
            transition: 'transform 1.2s cubic-bezier(0.85, 0, 0.15, 1)',
            transform: webLoading ? 'translateX(0)' : 'translateX(100%)'
          }}
        >
          <div className="flex items-center gap-3">
            <h1 className="text-6xl font-display font-black text-red-500 tracking-tight uppercase">
              AI
            </h1>
          </div>
        </div>
      </div>

      {/* Header Panel */}
      <header id="header-bar" className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-650 bg-gradient-to-tr from-red-600 to-rose-600 rounded-2xl shadow-lg shadow-red-500/10">
              <Terminal className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent">
                  Auton AI
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                QA Automation Script Generation &amp; Interactive Refinement
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              id="history-toggle-btn"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:text-red-500 hover:border-red-500/20 active:scale-95 cursor-pointer"
            >
              <History className="h-4 w-4" />
              <span>History ({savedScripts.length})</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-entrance">
        
        {/* Left Side: Generator Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Form Card */}
          <section id="generator-form-card" className="bg-zinc-950 rounded-3xl border border-zinc-900 shadow-2xl p-5 md:p-6 flex flex-col gap-5 custom-card-shadow">
            
            {/* Header section with instructions */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-red-500" />
                <h2 className="font-display font-bold text-base text-zinc-100">
                  Automation Requirements
                </h2>
              </div>
              <div className="text-xs text-zinc-400 flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-zinc-500" />
                Input user story or criteria
              </div>
            </div>

            {/* Framework Choice Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Target Framework
              </label>
              <div className="grid grid-cols-3 gap-2 bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-900">
                <button
                  type="button"
                  id="framework-playwright-ts"
                  onClick={() => setFramework('playwright-ts')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    framework === 'playwright-ts'
                      ? 'bg-gradient-to-r from-red-950/80 to-zinc-950/80 border border-red-500/30 text-red-400'
                      : 'hover:bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <span>Playwright</span>
                  <span className="text-[10px] font-sans font-medium text-zinc-500">TypeScript</span>
                </button>
                <button
                  type="button"
                  id="framework-playwright-js"
                  onClick={() => setFramework('playwright-js')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    framework === 'playwright-js'
                      ? 'bg-gradient-to-r from-red-950/80 to-zinc-950/80 border border-red-500/30 text-red-400'
                      : 'hover:bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <span>Playwright</span>
                  <span className="text-[10px] font-sans font-medium text-zinc-500">JavaScript</span>
                </button>
                <button
                  type="button"
                  id="framework-cypress"
                  onClick={() => setFramework('cypress')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all duration-300 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    framework === 'cypress'
                      ? 'bg-gradient-to-r from-red-950/80 to-zinc-950/80 border border-red-500/30 text-red-400'
                      : 'hover:bg-zinc-900 text-zinc-400'
                  }`}
                >
                  <span>Cypress</span>
                  <span className="text-[10px] font-sans font-medium text-zinc-500">JavaScript</span>
                </button>
              </div>
            </div>

            {/* Template Presets selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Select from Presets</span>
                <span className="text-[11px] font-medium text-red-500 font-sans">Click to load</span>
              </label>
              <div className="flex flex-col gap-2">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    type="button"
                    className="w-full text-left p-3 rounded-2xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900 hover:border-red-500/20 hover:scale-[1.01] transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-red-400 transition-colors">
                        {tmpl.title}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 uppercase border border-zinc-800">
                        {tmpl.framework.replace('-ts', ' (TS)').replace('-js', ' (JS)')}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">
                      {tmpl.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Test Criteria input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Natural Language Criteria</span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {criteria.length} chars
                </span>
              </label>
              <textarea
                id="criteria-textarea"
                rows={7}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                placeholder="Describe your test steps, click actions, assertions, and target URLs here. Be as explicit or conversational as you like..."
                className="w-full bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all duration-300 placeholder-zinc-700 font-sans leading-relaxed"
              />
            </div>

            {/* Settings Options Accordion / Block */}
            <div className="border-t border-zinc-900 pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                <Sliders className="h-3.5 w-3.5 text-zinc-500" />
                <span>Guidelines Options</span>
              </div>
              
              <div className="flex flex-col gap-2 bg-zinc-900/20 p-3 rounded-2xl border border-zinc-900/60">
                <label 
                  className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300 hover:text-zinc-200 py-1.5 select-none"
                >
                  <input
                    type="checkbox"
                    checked={options.pom}
                    onChange={(e) => setOptions({ ...options, pom: e.target.checked })}
                    className="rounded border-zinc-800 text-red-600 focus:ring-red-500/20 bg-zinc-950 h-4.5 w-4.5 cursor-pointer accent-red-650"
                  />
                  <div>
                    <span className="font-bold">Structure using Page Object Model (POM)</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Separate page actions &amp; element declarations cleanly.</p>
                  </div>
                </label>

                <label 
                  className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300 hover:text-zinc-200 py-1.5 select-none"
                >
                  <input
                    type="checkbox"
                    checked={options.robustSelectors}
                    onChange={(e) => setOptions({ ...options, robustSelectors: e.target.checked })}
                    className="rounded border-zinc-800 text-red-600 focus:ring-red-500/20 bg-zinc-950 h-4.5 w-4.5 cursor-pointer accent-red-650"
                  />
                  <div>
                    <span className="font-bold">Strict Semantic Locators</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Force getByRole, getByLabel over class names/XPaths.</p>
                  </div>
                </label>

                <label 
                  className="flex items-center gap-3 cursor-pointer text-xs text-zinc-300 hover:text-zinc-200 py-1.5 select-none"
                >
                  <input
                    type="checkbox"
                    checked={options.includeViewport}
                    onChange={(e) => setOptions({ ...options, includeViewport: e.target.checked })}
                    className="rounded border-zinc-800 text-red-600 focus:ring-red-500/20 bg-zinc-950 h-4.5 w-4.5 cursor-pointer accent-red-650"
                  />
                  <div>
                    <span className="font-bold">Explicit Viewport Config</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Pre-set responsive viewport dimensions inside tests.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              type="button"
              id="generate-script-btn"
              onClick={handleGenerate}
              disabled={isLoading || !criteria.trim()}
              className="w-full mt-2 py-4 px-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white hover:shadow-lg hover:shadow-red-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Auton AI Crafting...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  <span>Generate Automation Script</span>
                </>
              )}
            </button>

          </section>

          {/* Quick Info Box */}
          <div className="bg-zinc-900/10 border border-zinc-900 rounded-3xl p-4.5 text-xs text-zinc-400 flex gap-3">
            <Info className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-bold text-zinc-300">How to use generated tests</span>
              <p>Place Playwright specs in your <code className="text-red-400 font-mono">tests/</code> folder and run them with <code className="text-red-400 font-mono">npx playwright test</code>. For Cypress, place them in <code className="text-red-400 font-mono">cypress/e2e/</code>.</p>
            </div>
          </div>

        </div>

        {/* Right Side: Script Viewers & Interactive Refactoring (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Workspace Card */}
          <section id="workspace-output-card" className="bg-zinc-950 rounded-3xl border border-zinc-900 shadow-2xl overflow-hidden flex flex-col min-h-[580px] custom-card-shadow">
            
            {/* Tab Selector Header */}
            <div className="bg-zinc-950 border-b border-zinc-900 px-4 md:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="tab-code-btn"
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    activeTab === 'code'
                      ? 'bg-zinc-900 text-red-400 border border-red-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileCode className="h-4 w-4 text-red-500" />
                  <span>Output Script</span>
                </button>
                <button
                  type="button"
                  id="tab-notes-btn"
                  onClick={() => setActiveTab('notes')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    activeTab === 'notes'
                      ? 'bg-zinc-900 text-red-400 border border-red-500/20'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <BookOpen className="h-4 w-4 text-red-500" />
                  <span>Architect's Notes</span>
                </button>
              </div>

              {/* Download / Copy action triggers */}
              {generatedCode && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-900 px-3 py-1 rounded-xl max-w-[150px] truncate">
                    {filename}
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-900/60 text-zinc-350 hover:text-red-400 border border-zinc-900 hover:border-red-500/20 transition-all cursor-pointer"
                    title="Copy to Clipboard"
                  >
                    {copied ? <Check className="h-4 w-4 text-red-500" /> : <Copy className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-900/60 text-zinc-350 hover:text-red-400 border border-zinc-900 hover:border-red-500/20 transition-all cursor-pointer"
                    title="Download Script File"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              )}

            </div>

            {/* Inner Content Area */}
            <div className="flex-1 p-4 md:p-6 relative flex flex-col justify-between">
              
              {/* Error Alert bar */}
              {error && (
                <div className="mb-4 p-4 rounded-2xl bg-red-950/10 border border-red-900/20 text-red-400 text-xs flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold">Generation failed</span>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              {/* Loading overlay state */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20">
                  <RefreshCw className="h-8 w-8 text-red-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-zinc-200">Generating Script</p>
                    <p className="text-xs text-zinc-500 mt-1">Applying strict design rules &amp; locators...</p>
                  </div>
                </div>
              )}

              {/* Main Tab displays */}
              <div className="flex-1 min-h-[350px]">
                {!generatedCode && !isLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                    <div className="p-4.5 rounded-full bg-zinc-900/40 border border-zinc-900 text-red-500/50 mb-4 animate-pulse">
                      <Code className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-300">Auton AI Ready</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed">
                      Enter your natural language criteria, choose a preset, and tap "Generate Automation Script" to draft your highly structured file.
                    </p>
                  </div>
                )}

                {generatedCode && activeTab === 'code' && (
                  <div className="h-full flex flex-col">
                    <pre className="text-xs font-mono bg-zinc-950 border border-zinc-900 rounded-2xl p-5 overflow-auto max-h-[500px] flex-1 leading-relaxed text-zinc-300">
                      <code 
                        dangerouslySetInnerHTML={{ __html: highlightCode(generatedCode) }}
                        className="block"
                      />
                    </pre>
                  </div>
                )}

                {generatedCode && activeTab === 'notes' && (
                  <div className="h-full text-zinc-300 text-xs leading-relaxed overflow-auto max-h-[500px] bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 md:p-5">
                    <div className="prose prose-invert prose-xs max-w-none">
                      <div className="flex items-center gap-2 text-red-400 border-b border-zinc-900 pb-2.5 mb-4">
                        <BookOpen className="h-4 w-4 text-red-500" />
                        <span className="font-bold text-sm">Auton Strategy Report</span>
                      </div>
                      
                      {/* Robust styling of markdown sections */}
                      <div className="space-y-4">
                        {notes.split('\n').map((line, idx) => {
                          if (line.startsWith('##')) {
                            return <h3 key={idx} className="text-xs font-bold uppercase tracking-wider text-red-500 mt-4 mb-2">{line.replace('##', '').trim()}</h3>;
                          } else if (line.startsWith('#')) {
                            return <h2 key={idx} className="text-sm font-bold text-zinc-200 border-b border-zinc-900 pb-1 mt-5 mb-2">{line.replace('#', '').trim()}</h2>;
                          } else if (line.startsWith('-') || line.startsWith('*')) {
                            return (
                              <div key={idx} className="flex items-start gap-2 pl-2">
                                <span className="text-red-500 font-bold shrink-0">•</span>
                                <span>{line.substring(1).trim()}</span>
                              </div>
                            );
                          } else if (line.trim() === '') {
                            return <div key={idx} className="h-2" />;
                          } else {
                            return <p key={idx} className="text-zinc-400 leading-relaxed">{line}</p>;
                          }
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Refactoring Section (Placed at bottom of workspace output card) */}
              {generatedCode && (
                <div className="mt-5 pt-5 border-t border-zinc-900 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      <span>Refine &amp; Customize Automation Code</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-sans">
                      Request adjustments incrementally
                    </span>
                  </div>

                  <div className="flex gap-2 relative">
                    <input
                      type="text"
                      id="refactor-input"
                      value={refactorInstruction}
                      onChange={(e) => setRefactorInstruction(e.target.value)}
                      placeholder="e.g. 'Use a custom viewport', 'Mock api GET request for 403', 'Add helper assertion'..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && refactorInstruction.trim() && !isRefactoring) {
                          handleRefactor();
                        }
                      }}
                      className="flex-1 bg-zinc-900/40 border border-zinc-900 rounded-2xl px-4 py-3.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                    />
                    
                    <button
                      type="button"
                      id="refactor-btn"
                      onClick={handleRefactor}

                      disabled={isRefactoring || !refactorInstruction.trim()}
                      className="px-5 py-3 rounded-2xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                      {isRefactoring ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Refining...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" />
                          <span>Refactor</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </section>

        </div>
      </main>

      {/* History Drawer / Panel overlay */}
      {showHistory && (
        <div id="history-drawer" className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-full max-w-md bg-zinc-950 h-full border-l border-zinc-900 flex flex-col shadow-2xl p-6 overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-red-500" />
                <h3 className="font-display font-bold text-zinc-250">Session History</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto space-y-3 pr-1">
              {savedScripts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-650 py-12">
                  <FileText className="h-8 w-8 mb-2 opacity-30 text-red-500" />
                  <p className="text-xs text-zinc-500">No saved scripts in this session yet</p>
                  <p className="text-[11px] mt-1 text-zinc-600">Generated results are saved for this browser tab session.</p>
                </div>
              ) : (
                savedScripts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadFromHistory(item)}
                    className="p-4 rounded-2xl border border-zinc-900 bg-zinc-900/20 hover:bg-zinc-900 hover:border-red-500/20 transition-all duration-350 cursor-pointer text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-red-400 transition-colors truncate max-w-[200px]">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[9px] font-mono uppercase bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                        {item.framework}
                      </span>
                      <span className="text-[10px] text-zinc-500 italic">
                        Click to restore
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-2.5 line-clamp-2 bg-black p-2.5 rounded-xl border border-zinc-900/60 leading-relaxed font-mono">
                      {item.criteria.substring(0, 120)}...
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {savedScripts.length > 0 && (
              <div className="border-t border-zinc-900 pt-4 mt-4">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="w-full py-3 px-3 rounded-2xl text-xs font-bold border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors cursor-pointer"
                >
                  Clear History List
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
