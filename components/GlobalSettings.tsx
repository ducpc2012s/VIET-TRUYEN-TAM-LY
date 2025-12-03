import React, { useState, useEffect } from 'react';

interface GlobalSettingsProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const GlobalSettings: React.FC<GlobalSettingsProps> = ({ apiKey, onApiKeyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(apiKey);

  useEffect(() => {
    setInputValue(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onApiKeyChange(inputValue);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800/80 hover:bg-slate-700 text-amber-500 p-2 rounded-full border border-slate-600 shadow-lg backdrop-blur-sm transition-all hover:scale-110 group"
        title="Cài đặt Global & API Key"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 animate-fade-in-down">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-amber-500 font-bold uppercase text-sm tracking-wider">Cài đặt Hệ thống</h3>
             <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-1">GOOGLE API KEY (Dùng chung)</label>
              <div className="relative">
                <input
                  type="password"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Dán API Key của bạn vào đây..."
                  className="w-full bg-slate-800 text-slate-200 border border-slate-600 rounded p-2 text-sm focus:border-amber-500 focus:outline-none pr-8"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-slate-500 text-[10px] mt-1 italic">
                Key của bạn được lưu an toàn trên trình duyệt (LocalStorage) và dùng cho tất cả tính năng.
              </p>
            </div>
            
            <button
              onClick={handleSave}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-2 rounded text-sm transition-colors"
            >
              Lưu & Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSettings;