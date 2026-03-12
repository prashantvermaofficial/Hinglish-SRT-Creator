
import React, { useState, useRef } from 'react';
import { Button, Card } from './components/ui-components';
import { generateHinglishSrt } from './services/geminiService';
import { FileInfo, SrtGenerationState } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [state, setState] = useState<SrtGenerationState>({
    isProcessing: false,
    error: null,
    srtContent: null,
    progress: 'Idle'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('audio/')) {
      setState(prev => ({ ...prev, error: "Please upload a valid audio file." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setFile({
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        base64: base64
      });
      setState(prev => ({ ...prev, error: null, srtContent: null }));
    };
    reader.readAsDataURL(selectedFile);
  };

  const processAudio = async () => {
    if (!file) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null, progress: 'Analyzing audio...' }));
    
    try {
      const result = await generateHinglishSrt(file.base64, file.type);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        srtContent: result, 
        progress: 'Finished' 
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: err instanceof Error ? err.message : "Something went wrong.",
        progress: 'Failed'
      }));
    }
  };

  const downloadSrt = () => {
    if (!state.srtContent) return;
    const blob = new Blob([state.srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.split('.')[0] || 'subtitles'}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    if (!state.srtContent) return;
    try {
      await navigator.clipboard.writeText(state.srtContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const reset = () => {
    setFile(null);
    setIsCopied(false);
    setState({
      isProcessing: false,
      error: null,
      srtContent: null,
      progress: 'Idle'
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Hinglish <span className="text-indigo-600">SRT Creator</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto">
            Convert your audio into Romanized Hinglish subtitles effortlessly.
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center space-y-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all cursor-pointer group"
              >
                <div className="p-4 bg-slate-50 rounded-full group-hover:bg-white transition-colors">
                  <svg className="w-10 h-10 text-slate-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-slate-700">Select Audio File</p>
                  <p className="text-sm text-slate-500">MP3, WAV, M4A or AAC</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="audio/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-md">{file.name}</p>
                      <p className="text-sm text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={reset} disabled={state.isProcessing}>
                    Remove
                  </Button>
                </div>

                {state.error && (
                  <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{state.error}</span>
                  </div>
                )}

                {!state.srtContent && (
                  <Button 
                    className="w-full py-4 text-lg" 
                    onClick={processAudio} 
                    isLoading={state.isProcessing}
                  >
                    {state.isProcessing ? state.progress : "Generate Hinglish SRT"}
                  </Button>
                )}

                {state.srtContent && (
                  <div className="space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Button className="w-full py-4" onClick={downloadSrt}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Download SRT
                      </Button>
                      
                      <Button variant="secondary" className="w-full py-4" onClick={copyToClipboard}>
                        {isCopied ? (
                          <>
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3 4h3"></path>
                            </svg>
                            Copy Content
                          </>
                        )}
                      </Button>

                      <Button variant="ghost" className="w-full py-4 sm:col-span-2 lg:col-span-1" onClick={reset}>
                        Start Over
                      </Button>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Output Preview
                      </h3>
                      <div className="bg-slate-900 rounded-2xl p-6 overflow-auto max-h-[400px] shadow-2xl border border-slate-800 font-mono text-[13px] leading-relaxed text-indigo-200">
                        <pre className="whitespace-pre-wrap selection:bg-indigo-500/30">{state.srtContent}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Feature List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
          <div className="flex gap-4 p-4">
            <div className="flex-shrink-0 w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">1</div>
            <p className="text-sm text-slate-500 leading-snug">Upload any audio format from your device.</p>
          </div>
          <div className="flex gap-4 p-4">
            <div className="flex-shrink-0 w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">2</div>
            <p className="text-sm text-slate-500 leading-snug">Gemini AI transcribes and translates to Romanized Hinglish.</p>
          </div>
          <div className="flex gap-4 p-4">
            <div className="flex-shrink-0 w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">3</div>
            <p className="text-sm text-slate-500 leading-snug">Download the .SRT file or copy it to your editor.</p>
          </div>
        </div>
        
        <footer className="text-center text-slate-400 text-xs py-8 border-t border-slate-100">
          Built for creators who speak the language of modern India.
        </footer>
      </div>
    </div>
  );
};

export default App;
