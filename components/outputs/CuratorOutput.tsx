
import React, { useState } from 'react';
import { ScriptSegment, GenerationStatus } from '../../types';
import { exportToDoc } from '../../utils';

interface CuratorOutputProps {
  segments: ScriptSegment[];
  status: GenerationStatus;
}

const CuratorOutput: React.FC<CuratorOutputProps> = ({ segments, status }) => {
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
  const parts = fullText.split(/\n+(?=\d+\.)/);

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6 bg-slate-800/80 p-4 rounded-lg border border-slate-700 backdrop-blur-md sticky top-4 z-20 shadow-xl">
         <div className="text-slate-300 font-bold text-sm uppercase tracking-wider">
            Góc nhìn Giám Tuyển
         </div>
         <button
            onClick={() => exportToDoc(segments, "Idea_Curator")}
            className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2 transition-all transform hover:scale-105"
            title="Tải về file Word/Docs"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            TẢI DOCS
         </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {parts.map((part, idx) => {
          const trimmedPart = part.trim();
          if (!trimmedPart) return null;
          const isIdea = /^\d+\./.test(trimmedPart);
          const cardId = `curator-idea-${idx}`;

          if (!isIdea) return null;

          return (
            <div key={idx} className="relative group rounded-lg p-5 border transition-all duration-200 bg-slate-800/60 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800">
               <div className="prose prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-slate-300 font-body text-lg leading-relaxed">{trimmedPart}</p>
               </div>
               
               <button
                  onClick={() => handleCopy(trimmedPart, cardId)}
                  className="absolute top-3 right-3 p-2 bg-slate-700/80 hover:bg-amber-600 text-slate-300 hover:text-white rounded-md transition-all shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100 translate-x-2 group-hover:translate-x-0"
                  title="Sao chép ý tưởng này"
                >
                  {copiedId === cardId ? (
                    <span className="flex items-center gap-1 text-green-400 font-bold text-xs px-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        COPIED
                    </span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            Đang khai quật các cổ vật ý tưởng...
         </div>
      )}
    </div>
  );
};

export default CuratorOutput;
