
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-4xl mt-12 pt-8 pb-4 border-t border-slate-800 text-center text-slate-500 text-sm animate-fade-in-up">
       <p className="mb-2">© {new Date().getFullYear()} Bản quyền thuộc về <span className="text-amber-500 font-bold">Công ty cổ phần dịch vụ NextMind (NextMedia)</span></p>
       <p className="flex items-center justify-center gap-2">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
         </svg>
         Hotline: <a href="tel:0979933288" className="hover:text-amber-400 transition-colors font-semibold">0979 933 288</a>
       </p>
    </footer>
  );
};

export default Footer;
