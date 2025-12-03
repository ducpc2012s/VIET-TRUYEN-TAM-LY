
import React from 'react';
import { AppMode } from '../types';
import { APP_NAME, CURATOR_MODE_NAME, SEO_MODE_NAME, VISUALIZER_MODE_NAME } from '../constants';

interface HeaderProps {
  activeTab: AppMode;
}

const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  return (
    <header className="mb-8 text-center animate-fade-in-down">
      <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 font-bold mb-4 tracking-tight drop-shadow-sm filter">
        {activeTab === 'NARRATOR' ? APP_NAME : (activeTab === 'CURATOR' ? CURATOR_MODE_NAME : (activeTab === 'SEO' ? SEO_MODE_NAME : VISUALIZER_MODE_NAME))}
      </h1>
      <p className="text-slate-400 text-lg md:text-xl font-light italic max-w-2xl mx-auto">
        {activeTab === 'NARRATOR' && "\"Biến những ý tưởng thô sơ thành những bản trường ca bất tận.\""}
        {activeTab === 'CURATOR' && "\"Khám phá 50 góc nhìn ẩn dụ từ một hạt giống ý tưởng.\""}
        {activeTab === 'SEO' && "\"Tối ưu hóa Thuật toán - Đánh chiếm Top Trending.\""}
        {activeTab === 'VISUALIZER' && "\"Chuyển hóa ngôn từ thành hình ảnh siêu thực Jungian.\""}
      </p>
    </header>
  );
};

export default Header;
