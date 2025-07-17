import React, { useState, useEffect } from 'react';
import './App.css';
import CandidateList from './components/CandidateList';
import ImportCandidates from './components/ImportCandidates';
import SelectedTeam from './components/SelectedTeam';
import ScoringSystem from './components/ScoringSystem';

function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [activeTab, setActiveTab] = useState('import');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCandidates();
    fetchSelectedCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setError(null);
      const response = await fetch('/api/candidates');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCandidates(data);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setError('Failed to fetch candidates. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedCandidates = async () => {
    try {
      const response = await fetch('/api/candidates/selected');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedCandidates(data);
    } catch (error) {
      console.error('Error fetching selected candidates:', error);
    }
  };

  const handleImportSuccess = () => {
    fetchCandidates();
    setActiveTab('scoring');
  };

  const handleScoreUpdate = () => {
    fetchCandidates();
    setActiveTab('candidates');
  };

  const handleSelectionChange = () => {
    fetchSelectedCandidates();
    fetchCandidates();
  };

  if (error) {
    return (
      <div className="App">
        <div className="error-container">
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Mercor Hiring Dashboard</h1>
        <p>Select your dream team of 5 from hundreds of applicants</p>
      </header>

      <nav className="tab-navigation">
        <button 
          className={activeTab === 'import' ? 'active' : ''}
          onClick={() => setActiveTab('import')}
        >
          Import Data
        </button>
        <button 
          className={activeTab === 'scoring' ? 'active' : ''}
          onClick={() => setActiveTab('scoring')}
          disabled={candidates.length === 0}
        >
          Scoring System
        </button>
        <button 
          className={activeTab === 'candidates' ? 'active' : ''}
          onClick={() => setActiveTab('candidates')}
          disabled={candidates.length === 0}
        >
          All Candidates ({candidates.length})
        </button>
        <button 
          className={activeTab === 'team' ? 'active' : ''}
          onClick={() => setActiveTab('team')}
        >
          Selected Team ({selectedCandidates.length}/5)
        </button>
      </nav>

      <main className="App-main">
        {loading ? (
          <div className="loading">Loading candidates...</div>
        ) : (
          <>
            {activeTab === 'import' && (
              <ImportCandidates onImportSuccess={handleImportSuccess} />
            )}
            
            {activeTab === 'scoring' && (
              <ScoringSystem 
                candidates={candidates} 
                onScoreUpdate={handleScoreUpdate} 
              />
            )}
            
            {activeTab === 'candidates' && (
              <CandidateList 
                candidates={candidates} 
                selectedCandidates={selectedCandidates}
                onSelectionChange={handleSelectionChange}
              />
            )}
            
            {activeTab === 'team' && (
              <SelectedTeam 
                selectedCandidates={selectedCandidates}
                onSelectionChange={handleSelectionChange}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
            
