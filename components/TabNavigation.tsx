
import React from 'react';
import { AppMode } from '../types';

interface TabNavigationProps {
  activeTab: AppMode;
  onTabChange: (mode: AppMode) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { mode: AppMode; label: string }[] = [
    { mode: 'CURATOR', label: 'Curator (Idea)' },
    { mode: 'NARRATOR', label: 'The Narrator' },
    { mode: 'VISUALIZER', label: 'Visualizer (Image)' },
    { mode: 'SEO', label: 'SEO Strategist' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 bg-slate-800/50 p-1 rounded-xl backdrop-blur-sm border border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.mode}
          onClick={() => onTabChange(tab.mode)}
          className={`px-4 md:px-6 py-2 rounded-lg font-bold transition-all duration-300 text-sm md:text-base ${
            activeTab === tab.mode
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;
