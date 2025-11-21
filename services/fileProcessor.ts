import * as XLSX from 'xlsx';
import { TraineeSchedule } from '../types';

// Function to process raw array buffer (shared logic)
// Changed data type to 'any' to accept ArrayBuffer or Uint8Array without TypeScript conflicts during build
const processWorkbook = (data: any, defaultDepartment: string): TraineeSchedule[] => {
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  const scheduleMap = new Map<string, TraineeSchedule>();

  jsonData.forEach((row: any) => {
    const getVal = (keys: string[]) => {
      for (const k of keys) {
        if (row[k] !== undefined) return row[k];
      }
      return undefined;
    };

    const id = getVal(['الرقم التدريبي', 'traineeId', 'id', 'ID', 'رقم المتدرب']);
    if (!id) return;

    const idStr = String(id).trim();
    
    if (!scheduleMap.has(idStr)) {
      const name = getVal(['اسم المتدرب', 'traineeName', 'name', 'Name', 'الاسم']) || 'غير معروف';
      const dept = getVal(['التخصص', 'department', 'dept', 'Major']) || defaultDepartment;

      scheduleMap.set(idStr, {
        traineeId: idStr,
        traineeName: name,
        department: dept,
        schedule: [
          { dayName: 'الأحد', courses: [] },
          { dayName: 'الاثنين', courses: [] },
          { dayName: 'الثلاثاء', courses: [] },
          { dayName: 'الأربعاء', courses: [] },
          { dayName: 'الخميس', courses: [] },
        ]
      });
    }

    const trainee = scheduleMap.get(idStr)!;
    
    const dayRaw = getVal(['اليوم', 'day', 'Day']);
    const courseName = getVal(['المقرر', 'course', 'Course', 'Subject', 'المادة']);
    
    if (dayRaw && courseName) {
      let dayName = String(dayRaw).trim();
      const dayMap: {[key: string]: string} = {
        'Sunday': 'الأحد', 'Sun': 'الأحد', 'sunday': 'الأحد',
        'Monday': 'الاثنين', 'Mon': 'الاثنين', 'monday': 'الاثنين',
        'Tuesday': 'الثلاثاء', 'Tue': 'الثلاثاء', 'tuesday': 'الثلاثاء',
        'Wednesday': 'الأربعاء', 'Wed': 'الأربعاء', 'wednesday': 'الأربعاء',
        'Thursday': 'الخميس', 'Thu': 'الخميس', 'thursday': 'الخميس'
      };
      if (dayMap[dayName]) dayName = dayMap[dayName];

      const daySchedule = trainee.schedule.find(d => d.dayName === dayName || d.dayName.includes(dayName));

      if (daySchedule) {
        daySchedule.courses.push({
          id: Math.random().toString(36).substring(7),
          courseName: String(courseName),
          courseCode: String(getVal(['الرمز', 'code', 'Code']) || ''),
          startTime: String(getVal(['بداية', 'start', 'Start', 'من']) || ''),
          endTime: String(getVal(['نهاية', 'end', 'End', 'إلى']) || ''),
          room: String(getVal(['القاعة', 'room', 'Room', 'المعمل']) || ''),
          refNumber: String(getVal(['الرقم المرجعي', 'رقم الشعبة', 'CRN', 'Section', 'Reference']) || '')
        });
      }
    }
  });

  return Array.from(scheduleMap.values());
};

export const parseExcelFile = async (file: File, defaultDepartment: string): Promise<TraineeSchedule[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const result = processWorkbook(data, defaultDepartment);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
};