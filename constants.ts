import { TraineeSchedule } from './types';

// Mock data to simulate the "Database" of uploaded Excel/PDF files
export const MOCK_SCHEDULES: TraineeSchedule[] = [
  {
    traineeId: "441100123",
    traineeName: "أحمد محمد الغامدي",
    department: "التقنية الميكانيكية - محركات ومركبات",
    schedule: [
      {
        dayName: "الأحد",
        courses: [
          { id: "1", courseName: "رياضيات تقنية", courseCode: "MATH101", startTime: "08:00", endTime: "10:00", room: "A-101", refNumber: "50101" },
          { id: "2", courseName: "مقدمة في المحركات", courseCode: "MECH102", startTime: "10:00", endTime: "12:00", room: "Work-1", refNumber: "50102" }
        ]
      },
      {
        dayName: "الاثنين",
        courses: [
          { id: "3", courseName: "فيزياء تطبيقية", courseCode: "PHYS101", startTime: "08:00", endTime: "11:00", room: "Lab-2", refNumber: "50103" }
        ]
      },
      {
        dayName: "الثلاثاء",
        courses: [
          { id: "4", courseName: "لغة إنجليزية 1", courseCode: "ENG101", startTime: "09:00", endTime: "12:00", room: "C-202", refNumber: "50104" },
          { id: "5", courseName: "سلامة مهنية", courseCode: "SAFE101", startTime: "13:00", endTime: "15:00", room: "B-105", refNumber: "50105" }
        ]
      },
      {
        dayName: "الأربعاء",
        courses: []
      },
      {
        dayName: "الخميس",
        courses: [
          { id: "6", courseName: "ورشة تأسيسية", courseCode: "WORK100", startTime: "08:00", endTime: "14:00", room: "Main Workshop", refNumber: "50106" }
        ]
      }
    ]
  },
  {
    traineeId: "442200456",
    traineeName: "خالد بن سعيد العمري",
    department: "التقنية الميكانيكية - انتاج",
    schedule: [
      {
        dayName: "الأحد",
        courses: [
           { id: "7", courseName: "رسم هندسي", courseCode: "DRAW101", startTime: "08:00", endTime: "12:00", room: "Draw Lab", refNumber: "60201" }
        ]
      },
      {
        dayName: "الاثنين",
        courses: [
           { id: "8", courseName: "تشغيل آلات", courseCode: "MACH201", startTime: "08:00", endTime: "14:00", room: "Prod Workshop", refNumber: "60202" }
        ]
      },
      {
        dayName: "الثلاثاء",
        courses: []
      },
      {
        dayName: "الأربعاء",
        courses: [
           { id: "9", courseName: "ثقافة إسلامية", courseCode: "ISL101", startTime: "10:00", endTime: "12:00", room: "Mosque Hall", refNumber: "60203" }
        ]
      },
       {
        dayName: "الخميس",
        courses: [
          { id: "10", courseName: "خواص مواد", courseCode: "MAT202", startTime: "09:00", endTime: "11:00", room: "Lab-Metal", refNumber: "60204" }
        ]
      }
    ]
  }
];