import React from 'react';
import { GraduationCap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-tvtc-green text-white shadow-lg print:hidden">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-full text-tvtc-green">
            <GraduationCap size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">الكلية التقنية بالطائف</h1>
            <p className="text-tvtc-gold text-sm font-medium">نظام استعراض الجداول التدريبية</p>
          </div>
        </div>
        <div className="text-center md:text-left text-sm opacity-90">
          <p>قسم التقنية الميكانيكية</p>
          <p className="text-xs text-gray-300">تطوير: م. عبدالله الزهراني</p>
        </div>
      </div>
    </header>
  );
};