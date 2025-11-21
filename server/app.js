import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Setup directories
const DATA_DIR = path.join(__dirname, '../data');
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    schedules: [],
    stats: {
      enginesCount: 0, 
      manufCount: 0,
      enginesFreshmanCount: 0,
      manufFreshmanCount: 0
    }
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

app.use(cors());
app.use(express.json());

// Serve static files from dist (Vite build) - Essential for production
app.use(express.static(path.join(__dirname, '../dist')));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    // Keep original name but add timestamp to avoid collision
    // Using Buffer.from to fix latin1 encoding issue common in file uploads
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, Date.now() + '-' + originalName);
  }
});

const upload = multer({ storage: storage });

// Helper to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { schedules: [], stats: { enginesCount: 0, manufCount: 0, enginesFreshmanCount: 0, manufFreshmanCount: 0 } };
  }
};

// Helper to write DB
const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- API Routes ---

// Get Data
app.get('/api/data', (req, res) => {
  const db = readDB();
  res.json(db);
});

// Reset Data
app.delete('/api/data', (req, res) => {
  const initialData = {
    schedules: [],
    stats: {
      enginesCount: 0, 
      manufCount: 0,
      enginesFreshmanCount: 0,
      manufFreshmanCount: 0
    }
  };
  
  // Clean uploads directory
  fs.readdir(UPLOADS_DIR, (err, files) => {
    if (err) return;
    for (const file of files) {
      if (file !== '.gitkeep') {
        fs.unlink(path.join(UPLOADS_DIR, file), err => {});
      }
    }
  });

  writeDB(initialData);
  res.json(initialData);
});

// Upload and Process File
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const deptType = req.body.deptType; // ENGINES, MANUFACTURING, etc.
  const filePath = req.file.path;

  try {
    // 1. Determine Default Department Name
    let defaultDeptName = '';
    switch (deptType) {
      case 'ENGINES': defaultDeptName = 'التقنية الميكانيكية - محركات ومركبات'; break;
      case 'MANUFACTURING': defaultDeptName = 'التقنية الميكانيكية - تصنيع وإنتاج'; break;
      case 'ENGINES_FRESHMAN': defaultDeptName = 'التقنية الميكانيكية - محركات ومركبات (مستجدين)'; break;
      case 'MANUFACTURING_FRESHMAN': defaultDeptName = 'التقنية الميكانيكية - تصنيع وإنتاج (مستجدين)'; break;
    }

    // 2. Parse Excel File (Server Side Logic)
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const scheduleMap = new Map(); // Temp map for current file

    jsonData.forEach((row) => {
      const getVal = (keys) => {
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
        const dept = getVal(['التخصص', 'department', 'dept', 'Major']) || defaultDeptName;

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

      const trainee = scheduleMap.get(idStr);
      
      const dayRaw = getVal(['اليوم', 'day', 'Day']);
      const courseName = getVal(['المقرر', 'course', 'Course', 'Subject', 'المادة']);
      
      if (dayRaw && courseName) {
        let dayName = String(dayRaw).trim();
        const dayMap = {
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

    const parsedSchedules = Array.from(scheduleMap.values());

    // 3. Update Database
    const db = readDB();
    
    // Merge logic
    const dbMap = new Map(db.schedules.map(p => [p.traineeId, p]));
    parsedSchedules.forEach(s => dbMap.set(s.traineeId, s));
    db.schedules = Array.from(dbMap.values());

    // Update Stats
    if (deptType === 'ENGINES') db.stats.enginesCount += parsedSchedules.length;
    if (deptType === 'MANUFACTURING') db.stats.manufCount += parsedSchedules.length;
    if (deptType === 'ENGINES_FRESHMAN') db.stats.enginesFreshmanCount += parsedSchedules.length;
    if (deptType === 'MANUFACTURING_FRESHMAN') db.stats.manufFreshmanCount += parsedSchedules.length;

    writeDB(db);

    res.json({ 
      success: true, 
      count: parsedSchedules.length,
      data: db
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Handle React Routing (return index.html for any unknown route)
app.get('*', (req, res) => {
  // Check if dist/index.html exists before sending, otherwise send a simple error
  const indexPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App is building... please refresh in a moment or run "npm run build"');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});