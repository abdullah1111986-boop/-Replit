export interface Course {
  id: string;
  courseName: string;
  courseCode: string;
  startTime: string;
  endTime: string;
  room: string;
  refNumber: string; // الرقم المرجعي / رقم الشعبة
}

export interface DaySchedule {
  dayName: string; // e.g., الاحد
  courses: Course[];
}

export interface TraineeSchedule {
  traineeId: string;
  traineeName: string;
  department: string;
  schedule: DaySchedule[];
}

export enum AppView {
  SEARCH = 'SEARCH',
  RESULT = 'RESULT',
}

export interface GeminiAnalysisResult {
  summary: string;
  tips: string[];
  hardestDay: string;
}