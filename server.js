const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./hiring.db');

// Create tables with migration support
db.serialize(() => {
  // Create the main table
  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      location TEXT,
      experience_years INTEGER,
      skills TEXT,
      education TEXT,
      previous_company TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      portfolio_url TEXT,
      cover_letter TEXT,
      resume_score INTEGER DEFAULT 0,
      diversity_score INTEGER DEFAULT 0,
      technical_score INTEGER DEFAULT 0,
      total_score INTEGER DEFAULT 0,
      selected BOOLEAN DEFAULT FALSE,
      selection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add new columns if they don't exist (migration)
  db.run(`ALTER TABLE candidates ADD COLUMN work_availability TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding work_availability column:', err.message);
    }
  });

  db.run(`ALTER TABLE candidates ADD COLUMN salary_expectation TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding salary_expectation column:', err.message);
    }
  });

  db.run(`ALTER TABLE candidates ADD COLUMN submitted_at TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding submitted_at column:', err.message);
    }
  });
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// Helper function to calculate experience years from work experiences
const calculateExperienceYears = (workExperiences) => {
  if (!workExperiences || !Array.isArray(workExperiences)) return 0;
  
  // Simple heuristic: assume each role was 1-2 years on average
  // For more accurate calculation, we'd need start/end dates
  const roleCount = workExperiences.length;
  if (roleCount === 0) return 0;
  if (roleCount === 1) return 1;
  if (roleCount <= 3) return roleCount * 1.5;
  return roleCount * 1.2; // Diminishing returns for many roles
};

// Helper function to extract skills from skills array
const extractSkills = (skills) => {
  if (!skills || !Array.isArray(skills)) return '';
  return skills.join(', ');
};

// Helper function to extract education info
const extractEducation = (education) => {
  if (!education || !education.degrees || !Array.isArray(education.degrees)) {
    return education?.highest_level || '';
  }
  
  const degrees = education.degrees.map(degree => {
    const parts = [];
    if (degree.degree) parts.push(degree.degree);
    if (degree.subject) parts.push(`in ${degree.subject}`);
    if (degree.originalSchool || degree.school) parts.push(`from ${degree.originalSchool || degree.school}`);
    return parts.join(' ');
  });
  
  return degrees.join('; ');
};

// Helper function to extract most recent company
const extractPreviousCompany = (workExperiences) => {
  if (!workExperiences || !Array.isArray(workExperiences) || workExperiences.length === 0) {
    return '';
  }
  
  // Return the first company (assuming most recent)
  const mostRecent = workExperiences[0];
  return mostRecent.company || '';
};

// Helper function to extract salary expectation
const extractSalaryExpectation = (salaryData) => {
  if (!salaryData || typeof salaryData !== 'object') return '';
  
  const fullTimeSalary = salaryData['full-time'];
  if (fullTimeSalary) return fullTimeSalary;
  
  // If no full-time, get first available salary
  const firstSalary = Object.values(salaryData)[0];
  return firstSalary || '';
};

// Helper function to process candidate data for the new JSON format
const processCandidateData = (candidate) => {
  return {
    name: candidate.name || '',
    email: candidate.email || '',
    phone: candidate.phone || '',
    location: candidate.location || '',
    experience_years: Math.round(calculateExperienceYears(candidate.work_experiences)),
    skills: extractSkills(candidate.skills),
    education: extractEducation(candidate.education),
    previous_company: extractPreviousCompany(candidate.work_experiences),
    linkedin_url: candidate.linkedin_url || '',
    github_url: candidate.github_url || '',
    portfolio_url: candidate.portfolio_url || '',
    cover_letter: candidate.cover_letter || '',
    work_availability: candidate.work_availability ? candidate.work_availability.join(', ') : '',
    salary_expectation: extractSalaryExpectation(candidate.annual_salary_expectation),
    submitted_at: candidate.submitted_at || ''
  };
};

// Helper function to process legacy CSV/JSON format
const processLegacyCandidateData = (row) => {
  return {
    name: row.name || row.Name || '',
    email: row.email || row.Email || '',
    phone: row.phone || row.Phone || '',
    location: row.location || row.Location || '',
    experience_years: parseInt(row.experience_years || row.Experience || row.experienceYears || 0),
    skills: row.skills || row.Skills || '',
    education: row.education || row.Education || '',
    previous_company: row.previous_company || row.Company || row.previousCompany || '',
    linkedin_url: row.linkedin_url || row.LinkedIn || row.linkedinUrl || '',
    github_url: row.github_url || row.GitHub || row.githubUrl || '',
    portfolio_url: row.portfolio_url || row.Portfolio || row.portfolioUrl || '',
    cover_letter: row.cover_letter || row.CoverLetter || row.coverLetter || '',
    work_availability: row.work_availability || '',
    salary_expectation: row.salary_expectation || '',
    submitted_at: row.submitted_at || ''
  };
};

// Helper function to insert candidate
const insertCandidate = (candidateData) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT OR REPLACE INTO candidates 
      (name, email, phone, location, experience_years, skills, education, previous_company, 
       linkedin_url, github_url, portfolio_url, cover_letter, work_availability, salary_expectation, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [
      candidateData.name,
      candidateData.email,
      candidateData.phone,
      candidateData.location,
      candidateData.experience_years,
      candidateData.skills,
      candidateData.education,
      candidateData.previous_company,
      candidateData.linkedin_url,
      candidateData.github_url,
      candidateData.portfolio_url,
      candidateData.cover_letter,
      candidateData.work_availability || '',
      candidateData.salary_expectation || '',
      candidateData.submitted_at || ''
    ], function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

// API Routes

// Get all candidates
app.get('/api/candidates', (req, res) => {
  db.all('SELECT * FROM candidates ORDER BY total_score DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get selected candidates
app.get('/api/candidates/selected', (req, res) => {
  db.all('SELECT * FROM candidates WHERE selected = TRUE ORDER BY total_score DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add or update candidate
app.post('/api/candidates', (req, res) => {
  const candidate = req.body;
  const sql = `
    INSERT OR REPLACE INTO candidates 
    (name, email, phone, location, experience_years, skills, education, previous_company, 
     linkedin_url, github_url, portfolio_url, cover_letter, resume_score, diversity_score, 
     technical_score, total_score, work_availability, salary_expectation, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [
    candidate.name, candidate.email, candidate.phone, candidate.location,
    candidate.experience_years, candidate.skills, candidate.education, candidate.previous_company,
    candidate.linkedin_url, candidate.github_url, candidate.portfolio_url, candidate.cover_letter,
    candidate.resume_score, candidate.diversity_score, candidate.technical_score, candidate.total_score,
    candidate.work_availability || '', candidate.salary_expectation || '', candidate.submitted_at || ''
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID });
  });
});

// Update candidate selection
app.put('/api/candidates/:id/select', (req, res) => {
  const { selected, selection_reason } = req.body;
  const sql = 'UPDATE candidates SET selected = ?, selection_reason = ? WHERE id = ?';
  
  db.run(sql, [selected, selection_reason, req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ changes: this.changes });
  });
});

// Bulk score update
app.post('/api/candidates/score', (req, res) => {
  const candidates = req.body;
  
  const updatePromises = candidates.map(candidate => {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE candidates SET resume_score = ?, diversity_score = ?, technical_score = ?, total_score = ? WHERE id = ?';
      db.run(sql, [candidate.resume_score, candidate.diversity_score, candidate.technical_score, candidate.total_score, candidate.id], function(err) {
        if (err) reject(err);
        else resolve(this.changes);
      });
    });
  });
  
  Promise.all(updatePromises)
    .then(() => res.json({ success: true }))
    .catch(err => res.status(500).json({ error: err.message }));
});

// File import endpoint - supports both CSV and JSON
app.post('/api/import', upload.single('dataFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileExtension = path.extname(req.file.originalname).toLowerCase();
  
  if (fileExtension === '.csv') {
    // Handle CSV file
    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        if (results.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ error: 'CSV file is empty or invalid' });
        }

        const insertPromises = results.map(row => {
          const candidateData = processLegacyCandidateData(row);
          return insertCandidate(candidateData);
        });
        
        Promise.all(insertPromises)
          .then(() => {
            fs.unlinkSync(req.file.path);
            res.json({ message: `Imported ${results.length} candidates successfully from CSV` });
          })
          .catch(err => {
            fs.unlinkSync(req.file.path);
            console.error('Database error:', err);
            res.status(500).json({ error: `Database error: ${err.message}` });
          });
      })
      .on('error', (err) => {
        fs.unlinkSync(req.file.path);
        console.error('CSV parsing error:', err);
        res.status(500).json({ error: `CSV parsing error: ${err.message}` });
      });
  } 
  else if (fileExtension === '.json') {
    // Handle JSON file
    fs.readFile(req.file.path, 'utf8', (err, data) => {
      if (err) {
        fs.unlinkSync(req.file.path);
        console.error('File reading error:', err);
        return res.status(500).json({ error: `File reading error: ${err.message}` });
      }
      
      try {
        const jsonData = JSON.parse(data);
        let candidates = [];
        
        // Handle different JSON structures
        if (Array.isArray(jsonData)) {
          candidates = jsonData;
        } else if (jsonData.candidates && Array.isArray(jsonData.candidates)) {
          candidates = jsonData.candidates;
        } else if (jsonData.data && Array.isArray(jsonData.data)) {
          candidates = jsonData.data;
        } else {
          throw new Error('Invalid JSON structure. Expected an array of candidates or an object with candidates/data array.');
        }

        if (candidates.length === 0) {
          fs.unlinkSync(req.file.path);
          return res.status(400).json({ error: 'No candidates found in JSON file' });
        }
        
        const insertPromises = candidates.map(candidate => {
          try {
            // Detect if this is the new format (has work_experiences) or legacy format
            const candidateData = candidate.work_experiences ? 
              processCandidateData(candidate) : 
              processLegacyCandidateData(candidate);
            return insertCandidate(candidateData);
          } catch (processErr) {
            console.error('Error processing candidate:', candidate, processErr);
            throw processErr;
          }
        });
        
        Promise.all(insertPromises)
          .then(() => {
            fs.unlinkSync(req.file.path);
            res.json({ message: `Imported ${candidates.length} candidates successfully from JSON` });
          })
          .catch(err => {
            fs.unlinkSync(req.file.path);
            console.error('Database error:', err);
            res.status(500).json({ error: `Database error: ${err.message}` });
          });
          
      } catch (parseErr) {
        fs.unlinkSync(req.file.path);
        console.error('JSON parsing error:', parseErr);
        res.status(500).json({ error: `JSON parsing error: ${parseErr.message}` });
      }
    });
  } 
  else {
    fs.unlinkSync(req.file.path);
    res.status(400).json({ error: 'Unsupported file format. Please upload CSV or JSON files only.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
