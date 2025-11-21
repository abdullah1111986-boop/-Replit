import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto print:hidden">
      <div className="container mx-auto px-4 text-center">
        <p className="font-bold text-lg mb-2">الكلية التقنية بالطائف</p>
        <p className="text-gray-400 text-sm mb-4">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        <div className="border-t border-gray-700 pt-4">
          <p className="text-tvtc-gold font-medium">
            تم التطوير بواسطة: المهندس عبدالله الزهراني
          </p>
          <p className="text-xs text-gray-500 mt-1">قسم التقنية الميكانيكية</p>
        </div>
      </div>
    </footer>
  );
};