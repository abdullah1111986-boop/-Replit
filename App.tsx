import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ScheduleView } from './components/ScheduleView';
import { TraineeSchedule, AppView } from './types';
import { MOCK_SCHEDULES } from './constants';
import { parseExcelFile } from './services/fileProcessor';
import { Search, FileSpreadsheet, AlertTriangle, UploadCloud, CheckCircle, Loader2, Lock, Unlock, Cog, Wrench, UserPlus, Users, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SEARCH);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<TraineeSchedule | null>(null);
  
  // Database State with LocalStorage Initialization
  const [database, setDatabase] = useState<TraineeSchedule[]>(() => {
    const savedDb = localStorage.getItem('tvtc_database');
    return savedDb ? JSON.parse(savedDb) : MOCK_SCHEDULES;
  });

  const [uploadStats, setUploadStats] = useState<{
    enginesCount: number, 
    manufCount: number,
    enginesFreshmanCount: number,
    manufFreshmanCount: number
  }>(() => {
    const savedStats = localStorage.getItem('tvtc_stats');
    return savedStats ? JSON.parse(savedStats) : { 
      enginesCount: 0, 
      manufCount: 0,
      enginesFreshmanCount: 0,
      manufFreshmanCount: 0
    };
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Admin Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Persist Data whenever it changes
  useEffect(() => {
    localStorage.setItem('tvtc_database', JSON.stringify(database));
    localStorage.setItem('tvtc_stats', JSON.stringify(uploadStats));
  }, [database, uploadStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('الرجاء إدخال الرقم التدريبي');
      return;
    }

    const found = database.find(s => s.traineeId === query);
    
    if (found) {
      setSelectedSchedule(found);
      setCurrentView(AppView.RESULT);
    } else {
      setSearchError('لم يتم العثور على جدول لهذا الرقم التدريبي. تأكد من تحميل ملفات الجداول أو صحة الرقم.');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '0558882711') {
      setIsAdmin(true);
      setPasswordInput('');
    } else {
      alert('الرقم السري غير صحيح');
      setPasswordInput('');
    }
  };

  const handleResetDatabase = () => {
    if (window.confirm('تحذير: هل أنت متأكد من حذف جميع البيانات المرفوعة والعودة للوضع الافتراضي؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setDatabase(MOCK_SCHEDULES);
      setUploadStats({ 
        enginesCount: 0, 
        manufCount: 0,
        enginesFreshmanCount: 0,
        manufFreshmanCount: 0
      });
      localStorage.removeItem('tvtc_database');
      localStorage.removeItem('tvtc_stats');
    }
  };

  // Generic handler for uploading excel files to specific departments
  const handleDepartmentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'ENGINES' | 'MANUFACTURING' | 'ENGINES_FRESHMAN' | 'MANUFACTURING_FRESHMAN') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // Define default department name based on button clicked
    let defaultDeptName = '';
    switch (type) {
      case 'ENGINES':
        defaultDeptName = 'التقنية الميكانيكية - محركات ومركبات';
        break;
      case 'MANUFACTURING':
        defaultDeptName = 'التقنية الميكانيكية - تصنيع وإنتاج';
        break;
      case 'ENGINES_FRESHMAN':
        defaultDeptName = 'التقنية الميكانيكية - محركات ومركبات (مستجدين)';
        break;
      case 'MANUFACTURING_FRESHMAN':
        defaultDeptName = 'التقنية الميكانيكية - تصنيع وإنتاج (مستجدين)';
        break;
    }

    try {
      const parsedSchedules = await parseExcelFile(file, defaultDeptName);
      
      // Merge with existing database
      setDatabase(prev => {
        const dbMap = new Map<string, TraineeSchedule>(prev.map(p => [p.traineeId, p]));
        parsedSchedules.forEach(s => dbMap.set(s.traineeId, s));
        return Array.from(dbMap.values());
      });

      setUploadStats(prev => ({
        ...prev,
        enginesCount: type === 'ENGINES' ? prev.enginesCount + parsedSchedules.length : prev.enginesCount,
        manufCount: type === 'MANUFACTURING' ? prev.manufCount + parsedSchedules.length : prev.manufCount,
        enginesFreshmanCount: type === 'ENGINES_FRESHMAN' ? prev.enginesFreshmanCount + parsedSchedules.length : prev.enginesFreshmanCount,
        manufFreshmanCount: type === 'MANUFACTURING_FRESHMAN' ? prev.manufFreshmanCount + parsedSchedules.length : prev.manufFreshmanCount,
      }));

      // Reset input
      e.target.value = '';
      alert(`تم رفع وتحديث ${parsedSchedules.length} جدول بنجاح. ملاحظة: هذه البيانات محفوظة مؤقتاً في متصفحك.`);

    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء قراءة ملف الإكسيل/CSV. تأكد من صيغة الملف.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 print:p-0 print:w-full print:max-w-full">
        
        {/* Search View */}
        {currentView === AppView.SEARCH && (
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Main Search Card */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden border border-gray-100">
              <div className="absolute top-0 left-0 w-full h-2 bg-tvtc-green"></div>
              
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-tvtc-green shadow-sm">
                  <Search size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">استعلام عن الجداول التدريبية</h2>
                <p className="text-gray-500">قسم التقنية الميكانيكية - الكلية التقنية بالطائف</p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4 max-w-lg mx-auto">
                <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="أدخل الرقم التدريبي (مثال: 441100123)"
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-tvtc-green focus:ring-4 focus:ring-green-50 outline-none transition-all text-center font-mono placeholder-gray-300 bg-gray-50 focus:bg-white"
                    dir="ltr"
                  />
                </div>

                {searchError && (
                  <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg animate-fadeIn text-sm font-medium border border-red-100">
                    <AlertTriangle size={18} />
                    <span>{searchError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-tvtc-green hover:bg-tvtc-light disabled:bg-gray-400 text-white text-xl font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2"
                >
                  {isProcessing ? <Loader2 className="animate-spin" /> : 'بحث عن الجدول'}
                </button>
              </form>
            </div>

            {/* Admin Upload Section */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 transition-all">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <UploadCloud className="text-tvtc-gold" />
                  <h3 className="font-bold text-gray-700">منطقة رفع البيانات (للمشرفين فقط)</h3>
                </div>
                {isAdmin && (
                  <button onClick={() => setIsAdmin(false)} className="text-xs text-red-500 hover:text-red-700 hover:underline">
                    تسجيل خروج
                  </button>
                )}
              </div>
              
              {!isAdmin ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-2">
                    <Lock size={32} />
                  </div>
                  <p className="text-gray-600 font-medium">هذه المنطقة محمية. الرجاء إدخال الرقم السري</p>
                  <form onSubmit={handleAdminLogin} className="flex items-center gap-2 w-full max-w-xs">
                    <input 
                      type="password" 
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="الرقم السري"
                      className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-tvtc-green outline-none text-center dir-ltr"
                      dir="ltr"
                    />
                    <button type="submit" className="bg-tvtc-green text-white px-4 py-2 rounded-lg hover:bg-tvtc-light transition-colors shadow-sm">
                      <Unlock size={18} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="animate-fadeIn space-y-6">
                  
                  {/* Row 1: Standard Uploads */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                      <Users size={16} />
                      المتدربين المستمرين (رفع مؤقت)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Engines Upload */}
                      <label className="cursor-pointer group relative overflow-hidden">
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-blue-500 transition-all text-center h-full flex flex-col items-center justify-center">
                            <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                              <Cog className="text-blue-600" size={24} />
                            </div>
                            <span className="font-bold text-gray-800 block">محركات ومركبات</span>
                            <span className="text-xs text-gray-500">Excel رفع ملف</span>
                            {uploadStats.enginesCount > 0 && (
                              <span className="mt-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> {uploadStats.enginesCount}
                              </span>
                            )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".xlsx, .xls, .csv" 
                          onChange={(e) => handleDepartmentUpload(e, 'ENGINES')} 
                        />
                      </label>

                      {/* Manufacturing Upload */}
                      <label className="cursor-pointer group relative overflow-hidden">
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-orange-500 transition-all text-center h-full flex flex-col items-center justify-center">
                            <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                              <Wrench className="text-orange-600" size={24} />
                            </div>
                            <span className="font-bold text-gray-800 block">تصنيع وإنتاج</span>
                            <span className="text-xs text-gray-500">Excel رفع ملف</span>
                            {uploadStats.manufCount > 0 && (
                              <span className="mt-2 text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> {uploadStats.manufCount}
                              </span>
                            )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".xlsx, .xls, .csv" 
                          onChange={(e) => handleDepartmentUpload(e, 'MANUFACTURING')} 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Row 2: Freshmen Uploads */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                      <UserPlus size={16} />
                      المتدربين المستجدين (رفع مؤقت)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Engines Freshmen Upload */}
                      <label className="cursor-pointer group relative overflow-hidden">
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-cyan-500 transition-all text-center h-full flex flex-col items-center justify-center">
                            <div className="bg-white p-2 rounded-full shadow-sm mb-2 flex gap-1">
                              <Cog className="text-cyan-600" size={20} />
                              <UserPlus className="text-cyan-600" size={20} />
                            </div>
                            <span className="font-bold text-gray-800 block">محركات (مستجدين)</span>
                            <span className="text-xs text-gray-500">Excel رفع ملف</span>
                            {uploadStats.enginesFreshmanCount > 0 && (
                              <span className="mt-2 text-xs bg-cyan-200 text-cyan-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> {uploadStats.enginesFreshmanCount}
                              </span>
                            )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".xlsx, .xls, .csv" 
                          onChange={(e) => handleDepartmentUpload(e, 'ENGINES_FRESHMAN')} 
                        />
                      </label>

                      {/* Manufacturing Freshmen Upload */}
                      <label className="cursor-pointer group relative overflow-hidden">
                        <div className="p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-amber-500 transition-all text-center h-full flex flex-col items-center justify-center">
                            <div className="bg-white p-2 rounded-full shadow-sm mb-2 flex gap-1">
                              <Wrench className="text-amber-600" size={20} />
                              <UserPlus className="text-amber-600" size={20} />
                            </div>
                            <span className="font-bold text-gray-800 block">تصنيع (مستجدين)</span>
                            <span className="text-xs text-gray-500">Excel رفع ملف</span>
                            {uploadStats.manufFreshmanCount > 0 && (
                              <span className="mt-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle size={10} /> {uploadStats.manufFreshmanCount}
                              </span>
                            )}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".xlsx, .xls, .csv" 
                          onChange={(e) => handleDepartmentUpload(e, 'MANUFACTURING_FRESHMAN')} 
                        />
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                       <FileSpreadsheet size={14} />
                       <span>يقبل النظام ملفات Excel (.xlsx, .csv)</span>
                    </div>
                    
                    <button 
                      onClick={handleResetDatabase}
                      className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-bold"
                    >
                      <Trash2 size={16} />
                      حذف البيانات المحلية
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results View */}
        {currentView === AppView.RESULT && selectedSchedule && (
          <ScheduleView 
            data={selectedSchedule} 
            onBack={() => {
              setCurrentView(AppView.SEARCH);
              setSearchQuery('');
              setSelectedSchedule(null);
            }} 
          />
        )}

      </main>

      <Footer />
    </div>
  );
};

export default App;