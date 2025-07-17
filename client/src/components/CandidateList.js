import React, { useState } from 'react';

const CandidateList = ({ candidates, selectedCandidates, onSelectionChange }) => {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('total_score');

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(filter.toLowerCase()) ||
    candidate.skills.toLowerCase().includes(filter.toLowerCase()) ||
    candidate.location.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === 'total_score') return b.total_score - a.total_score;
    if (sortBy === 'experience_years') return b.experience_years - a.experience_years;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleSelect = async (candidate) => {
    if (selectedCandidates.length >= 5 && !candidate.selected) {
      alert('You can only select up to 5 candidates');
      return;
    }

    const reason = candidate.selected ? 
      '' : 
      prompt('Why are you selecting this candidate?');
    
    if (!candidate.selected && !reason) return;

    try {
      const response = await fetch(`/api/candidates/${candidate.id}/select`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          selected: !candidate.selected, 
          selection_reason: reason 
        })
      });

      if (response.ok) {
        onSelectionChange();
      }
    } catch (error) {
      console.error('Error updating selection:', error);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className="candidate-list">
      <div className="controls">
        <input
          type="text"
          placeholder="Search candidates..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="total_score">Total Score</option>
          <option value="experience_years">Experience</option>
          <option value="name">Name</option>
        </select>
      </div>

      <div className="candidates-grid">
        {sortedCandidates.map(candidate => (
          <div key={candidate.id} className={`candidate-card ${candidate.selected ? 'selected' : ''}`}>
            <div className="candidate-header">
              <h3>{candidate.name}</h3>
              <div 
                className="total-score"
                style={{ backgroundColor: getScoreColor(candidate.total_score) }}
              >
                {candidate.total_score}
              </div>
            </div>
            
            <div className="candidate-details">
              <p><strong>Location:</strong> {candidate.location}</p>
              <p><strong>Experience:</strong> {candidate.experience_years} years</p>
              <p><strong>Skills:</strong> {candidate.skills}</p>
              <p><strong>Education:</strong> {candidate.education}</p>
              
              <div className="score-breakdown">
                <span>Technical: {candidate.technical_score}</span>
                <span>Resume: {candidate.resume_score}</span>
                <span>Diversity: {candidate.diversity_score}</span>
              </div>
            </div>

            <div className="candidate-actions">
              <button 
                onClick={() => handleSelect(candidate)}
                className={candidate.selected ? 'deselect-btn' : 'select-btn'}
              >
                {candidate.selected ? 'Deselect' : 'Select'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateList;
