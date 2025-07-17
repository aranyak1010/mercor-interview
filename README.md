# Mercor Interview - Candidate Management System

A full-stack web application for managing candidate data with import/export functionality, built with React frontend and Node.js backend.

## Features

- **Candidate Management**: View, add, edit, and delete candidate profiles
- **Data Import**: Support for CSV and JSON file imports
- **Sample Data Generation**: Generate sample candidate data for testing
- **File Preview**: Preview JSON files before importing
- **Export Functionality**: Download sample JSON templates

## Tech Stack

### Frontend
- React.js
- CSS3
- JavaScript ES6+

### Backend
- Node.js
- Express.js
- File upload handling (Multer)
- JSON/CSV parsing

## Project Structure

```
mercor-interview/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   └── ImportCandidates.js
│   │   └── ...
│   └── package.json
├── server/                 # Backend Node.js application
│   ├── routes/
│   │   └── api/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mercor-interview
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm start
```

2. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Import Functionality

### Supported File Formats

#### JSON Format
The application accepts JSON files with the following structure:

```json
[
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
]
```

#### CSV Format
CSV files should include headers matching the candidate data structure.

### Import Options

1. **File Upload**: Upload CSV or JSON files containing candidate data
2. **Sample Data Generation**: Generate sample candidates for testing
3. **Sample JSON Download**: Download a template JSON file

### File Preview
- JSON files are previewed before import
- Shows candidate count and sample data
- Validates JSON format

## API Endpoints

- `POST /api/import` - Import candidate data from uploaded files
- `POST /api/candidates` - Create new candidate
- `GET /api/candidates` - Retrieve all candidates

## Development

### Code Structure
- **Components**: Reusable React components in `client/src/components/`
- **API Routes**: Backend routes in `server/routes/api/`
- **File Processing**: Handles CSV and JSON file parsing

### File Upload Flow
1. User selects file (CSV or JSON)
2. File is validated and previewed (JSON only)
3. File is uploaded to server via FormData
4. Server processes and stores candidate data
5. Frontend receives confirmation and updates UI

## Sample Data

The application includes sample candidate data featuring:
- Software developers with various skill sets
- Different experience levels (3-7 years)
- Various locations (San Francisco, Austin, Seattle)
- Complete profiles with education, skills, and work history

## Error Handling

- File format validation
- JSON parsing error handling
- Server-side error responses
- User-friendly error messages

## Future Enhancements

- Advanced search and filtering
- Bulk candidate operations
- Data validation and sanitization
- User authentication and authorization
- Database integration
- Email notifications
<<<<<<< HEAD
- Candidate
=======
- Candidate
>>>>>>> 8185f6e0bd267d0a0acbd46ecf4cf2c768d432a4
