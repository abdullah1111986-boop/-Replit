import React from 'react';
import { TraineeSchedule } from '../types';
import { Calendar, Clock, MapPin, ArrowLeft, Hash, Table, Printer } from 'lucide-react';
import { GeminiAnalysis } from './GeminiAnalysis';

interface ScheduleViewProps {
  data: TraineeSchedule;
  onBack: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ data, onBack }) => {
  const hasData = data.schedule && data.schedule.some(d => d.courses.length > 0);

  return (
    <div className="animate-fadeIn max-w-6xl mx-auto print:max-w-full print:mx-0 print:w-full">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-tvtc-green transition-colors group"
        >
          <ArrowLeft className="ml-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          العودة للبحث
        </button>

        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-tvtc-green text-white px-4 py-2 rounded-lg hover:bg-tvtc-light transition-colors shadow-sm hover:shadow-md"
          >
            <Printer size={20} />
            <span>طباعة / حفظ PDF</span>
          </button>
          <span className="text-[10px] text-gray-400">متوافق مع جميع الطابعات (A4/Letter)</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xl overflow-hidden border-t-4 border-tvtc-green print:shadow-none print:border-2 print:border-gray-800 mb-6">
        {/* Student Header */}
        <div className="p-6 bg-gray-50 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:bg-white print:border-b-2 print:border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 print:text-black">{data.traineeName}</h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2 text-gray-600 print:text-black">
              <span className="flex items-center gap-1">
                <span className="font-bold text-tvtc-green print:text-black">الرقم التدريبي:</span> {data.traineeId}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-tvtc-green print:text-black">التخصص:</span> {data.department}
              </span>
            </div>
          </div>
          <div className="hidden print:block text-sm text-gray-500">
            تم استخراج هذا الجدول من النظام الآلي
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white min-h-[400px]">
          {hasData ? (
            <div className="p-6 overflow-x-auto">
              <div className="min-w-full space-y-4">
                {data.schedule.map((day, idx) => (
                  <div key={idx} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow print:shadow-none print:border-2 print:border-gray-400 break-inside-avoid print:mb-4">
                    <div className="bg-gray-100 px-4 py-2 font-bold text-gray-700 border-b flex items-center gap-2 print:bg-gray-100 print:border-gray-400 print:text-black">
                      <Calendar size={18} className="text-tvtc-green print:text-black" />
                      {day.dayName}
                    </div>
                    <div className="p-4">
                      {day.courses.length === 0 ? (
                        <p className="text-gray-400 text-center py-2 italic print:text-gray-500">لا توجد محاضرات في هذا اليوم</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
                          {day.courses.map((course) => (
                            <div key={course.id} className="bg-green-50 border border-green-100 rounded-lg p-3 relative group hover:border-green-300 transition-colors print:border-gray-400 print:bg-white print:border">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-tvtc-green print:text-black">{course.courseName}</h4>
                                <span className="text-xs bg-white px-2 py-1 rounded border text-gray-500 font-mono print:border-gray-400 print:text-black">{course.courseCode}</span>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-700 print:text-black">
                                <div className="flex items-center gap-2">
                                  <Clock size={14} className="text-tvtc-gold print:text-black" />
                                  <span className="font-medium">{course.startTime} - {course.endTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin size={14} className="text-gray-400 print:text-black" />
                                  <span>{course.room}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Hash size={14} className="text-gray-400 print:text-black" />
                                  <span title="الرقم المرجعي / رقم الشعبة">{course.refNumber}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400">
              <Table size={48} className="mx-auto mb-4 opacity-20" />
              <p>لا توجد بيانات مجدولة للعرض.</p>
            </div>
          )}
        </div>
      </div>

      {/* Gemini Analysis Section */}
      {hasData && (
        <div className="print:hidden">
          <GeminiAnalysis schedule={data} />
        </div>
      )}
    </div>
  );
};