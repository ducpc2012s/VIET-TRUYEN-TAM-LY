
import React, { useState } from 'react';
import { ScriptSegment, GenerationStatus } from '../../types';
import { exportToDoc, exportToTxt } from '../../utils';

interface VisualizerOutputProps {
  segments: ScriptSegment[];
  status: GenerationStatus;
}

const VisualizerOutput: React.FC<VisualizerOutputProps> = ({ segments, status }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const fullText = segments.map(s => s.content).join('');
  const promptBlocks = fullText.split(/(?=PROMPT\s+#\d+:)/i);

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 animate-fade-in-up">
       <div className="flex justify-between items-center mb-6 bg-slate-800/80 p-4 rounded-lg border border-slate-700 backdrop-blur-md sticky top-4 z-20 shadow-xl">
           <div className="text-slate-300 font-bold text-sm uppercase tracking-wider">
              Thư viện Prompt Ảnh
           </div>
           <button
              onClick={() => exportToTxt(segments, "Visualizer_Prompts")}
              className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition-all transform hover:scale-105"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              TẢI TXT
           </button>
       </div>

       <div className="grid grid-cols-1 gap-6">
          {promptBlocks.map((block, idx) => {
             const cleanBlock = block.trim();
             if (!cleanBlock || !cleanBlock.toUpperCase().startsWith("PROMPT")) return null;
             
             // Extract Prompt Number for display
             const titleMatch = cleanBlock.match(/PROMPT\s+#(\d+):/i);
             const promptNumber = titleMatch ? titleMatch[1] : (idx + 1).toString();
             const contentBody = cleanBlock.replace(/PROMPT\s+#\d+:/i, '').trim();

             return (
                <div key={idx} className="bg-slate-800/80 rounded-lg border border-slate-700 hover:border-amber-500/50 shadow-lg overflow-hidden relative group transition-all">
                   <div className="bg-slate-900/50 p-3 border-b border-slate-700 flex justify-between items-center">
                      <span className="text-amber-500 font-bold text-sm tracking-widest uppercase">PROMPT #{promptNumber}</span>
                   </div>
                   <div className="p-5">
                       <p className="whitespace-pre-wrap text-slate-300 font-mono text-sm leading-relaxed">{contentBody}</p>
                   </div>
                   <button
                      onClick={() => handleCopy(cleanBlock, `visualizer-${idx}`)}
                      className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-amber-600 text-slate-300 hover:text-white rounded transition-colors"
                      title="Sao chép Prompt"
                   >
                      {copiedId === `visualizer-${idx}` ? (
                          <span className="text-green-400 font-bold text-xs">COPIED</span>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                      )}
                   </button>
                </div>
             );
          })}
       </div>

       {status === GenerationStatus.GENERATING && (
           <div className="text-center text-amber-500/50 italic font-light animate-pulse mt-8">
              Đang chuyển hóa lời văn thành hình ảnh siêu thực...
           </div>
       )}
    </div>
  );
};

export default VisualizerOutput;
