import React, { useState } from 'react';

const ImportCandidates = ({ onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [filePreview, setFilePreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage('');
    
    // Preview file contents for JSON files
    if (selectedFile && selectedFile.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          let candidateCount = 0;
          
          if (Array.isArray(jsonData)) {
            candidateCount = jsonData.length;
          } else if (jsonData.candidates && Array.isArray(jsonData.candidates)) {
            candidateCount = jsonData.candidates.length;
          } else if (jsonData.data && Array.isArray(jsonData.data)) {
            candidateCount = jsonData.data.length;
          }
          
          setFilePreview({
            type: 'json',
            candidateCount,
            sample: candidateCount > 0 ? (Array.isArray(jsonData) ? jsonData[0] : jsonData.candidates?.[0] || jsonData.data?.[0]) : null
          });
        } catch (error) {
          setFilePreview({ type: 'json', error: 'Invalid JSON format' });
        }
      };
      reader.readAsText(selectedFile);
    } else if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFilePreview({ type: 'csv', name: selectedFile.name });
    } else {
      setFilePreview(null);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessage('Please select a file');
      return;
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'json'].includes(fileExtension)) {
      setMessage('Please select a CSV or JSON file');
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append('dataFile', file);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage(result.message);
        setFile(null);
        setFilePreview(null);
        document.querySelector('input[type="file"]').value = '';
        onImportSuccess();
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const generateSampleData = async () => {
    const sampleCandidates = [
      {
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        phone: "+1-555-0101",
        location: "San Francisco, CA",
        experience_years: 5,
        skills: "React, Node.js, Python, AWS",
        education: "MS Computer Science - Stanford",
        previous_company: "Meta",
        linkedin_url: "linkedin.com/in/sarahchen",
        github_url: "github.com/sarahchen",
        portfolio_url: "sarahchen.dev",
        cover_letter: "Passionate full-stack developer with experience in scalable web applications."
      },
      {
        name: "Marcus Johnson",
        email: "marcus.j@email.com",
        phone: "+1-555-0102",
        location: "Austin, TX",
        experience_years: 3,
        skills: "JavaScript, React, GraphQL, MongoDB",
        education: "BS Computer Science - UT Austin",
        previous_company: "Shopify",
        linkedin_url: "linkedin.com/in/marcusj",
        github_url: "github.com/marcusj",
        portfolio_url: "marcusj.com",
        cover_letter: "Creative developer focused on user experience and modern web technologies."
      },
      {
        name: "Priya Patel",
        email: "priya.patel@email.com",
        phone: "+1-555-0103",
        location: "Seattle, WA",
        experience_years: 7,
        skills: "Java, Spring, Microservices, Docker",
        education: "MS Software Engineering - University of Washington",
        previous_company: "Amazon",
        linkedin_url: "linkedin.com/in/priyapatel",
        github_url: "github.com/priyapatel",
        portfolio_url: "priyapatel.tech",
        cover_letter: "Backend specialist with expertise in distributed systems and cloud architecture."
      }
    ];

    try {
      for (const candidate of sampleCandidates) {
        await fetch('/api/candidates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(candidate)
        });
      }
      setMessage('Sample data generated successfully!');
      onImportSuccess();
    } catch (error) {
      setMessage(`Error generating sample data: ${error.message}`);
    }
  };

  const downloadSampleJSON = () => {
    const sampleData = [
      {
        "name": "Clever Monkey",
        "email": "clever-monkey@example.com",
        "phone": "5582981474204",
        "location": "Maceió",
        "submitted_at": "2025-01-28 09:02:16.000000",
        "work_availability": ["full-time", "part-time"],
        "annual_salary_expectation": {
          "full-time": "$117548"
        },
        "work_experiences": [
          {
            "company": "StarLab Digital Ventures",
            "roleName": "Full Stack Developer"
          },
          {
            "company": "OrbitalLife", 
            "roleName": "Project Manager"
          }
        ],
        "education": {
          "highest_level": "Bachelor's Degree",
          "degrees": [
            {
              "degree": "Bachelor's Degree",
              "subject": "Computer Science",
              "school": "International Institutions",
              "originalSchool": "Faculdade Descomplica"
            }
          ]
        },
        "skills": ["Data Analysis", "Docker", "Microservices"]
      },
      {
        "name": "Noble Flamingo",
        "email": "noble-flamingo@example.com", 
        "phone": "12156688210",
        "location": "Philadelphia",
        "submitted_at": "2025-01-26 07:40:39.000000",
        "work_availability": ["full-time"],
        "annual_salary_expectation": {
          "full-time": "$95000"
        },
        "work_experiences": [
          {
            "company": "Tech Corp",
            "roleName": "Software Engineer"
          }
        ],
        "education": {
          "highest_level": "Master's Degree",
          "degrees": [
            {
              "degree": "Master's Degree",
              "subject": "Software Engineering", 
              "school": "University of Pennsylvania"
            }
          ]
        },
        "skills": ["JavaScript", "React", "Node.js", "AWS"]
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-candidates.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="import-section">
      <h2>Import Candidate Data</h2>
      
      <div className="import-options">
        <div className="file-import">
          <h3>Upload CSV or JSON File</h3>
          <form onSubmit={handleImport}>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="file-input"
            />
            
            {filePreview && (
              <div className="file-preview">
                {filePreview.type === 'json' && !filePreview.error && (
                  <div className="preview-info">
                    <p>✅ JSON file detected: {filePreview.candidateCount} candidates found</p>
                    {filePreview.sample && (
                      <div className="sample-preview">
                        <strong>Sample candidate:</strong>
                        <pre>{JSON.stringify(filePreview.sample, null, 2).substring(0, 200)}...</pre>
                      </div>
                    )}
                  </div>
                )}
                {filePreview.type === 'json' && filePreview.error && (
                  <div className="preview-error">
                    <p>❌ {filePreview.error}</p>
                  </div>
                )}
                {filePreview.type === 'csv' && (
                  <div className="preview-info">
                    <p>✅ CSV file detected: {filePreview.name}</p>
                  </div>
                )}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={importing || !file}
              className="import-btn"
            >
              {importing ? 'Importing...' : 'Import File'}
            </button>
          </form>
        </div>

        <div className="sample-data">
          <h3>Generate Sample Data</h3>
          <button 
            onClick={generateSampleData}
            className="sample-btn"
          >
            Generate Sample Candidates
          </button>
          <button 
            onClick={downloadSampleJSON}
            className="download-btn"
          >
            Download Sample JSON
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="file-formats">
        <h3>Supported File Formats:</h3>
        <div className="format-details">
          <h4>JSON Format (Expected Structure):</h4>
          <pre>{`[
  {
    "name": "Candidate Name",
    "email": "email@example.com",
    "phone": "1234567890",
    "location": "City, State",
    "work_experiences": [
      {
        "company": "Company Name",
        "roleName": "Job Title"
      }
    ],
    "education": {
      "highest_level": "Degree Level",
      "degrees": [
        {
          "degree": "Degree Type",
          "subject": "Field of Study",
          "originalSchool": "School Name"
        }
      ]
    },
    "skills": ["Skill1", "Skill2", "Skill3"],
    "work_availability": ["full-time", "part-time"],
    "annual_salary_expectation": {
      "full-time": "$100000"
    }
  }
]`}</pre>
        </div>
      </div>
    </div>
  );
};

export default ImportCandidates;
