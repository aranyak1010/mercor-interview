import React from 'react';

const SelectedTeam = ({ selectedCandidates, onSelectionChange }) => {
  const handleDeselect = async (candidateId) => {
    try {
      const response = await fetch(`/api/candidates/${candidateId}/select`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: false, selection_reason: '' })
      });

      if (response.ok) {
        onSelectionChange();
      }
    } catch (error) {
      console.error('Error deselecting candidate:', error);
    }
  };

  const getTeamDiversity = () => {
    if (selectedCandidates.length === 0) return null;

    const locations = [...new Set(selectedCandidates.map(c => c.location))];
    const experienceLevels = selectedCandidates.map(c => {
      if (c.experience_years <= 2) return 'Junior';
      if (c.experience_years <= 5) return 'Mid-level';
      return 'Senior';
    });
    const uniqueExperienceLevels = [...new Set(experienceLevels)];
    
    const allSkills = selectedCandidates.flatMap(c => 
      c.skills.split(',').map(s => s.trim())
    );
    const uniqueSkills = [...new Set(allSkills)];

    return {
      locations,
      experienceLevels: uniqueExperienceLevels,
      skillCount: uniqueSkills.length,
      avgScore: selectedCandidates.reduce((sum, c) => sum + c.total_score, 0) / selectedCandidates.length
    };
  };

  const diversity = getTeamDiversity();

  return (
    <div className="selected-team">
      <h2>Selected Team ({selectedCandidates.length}/5)</h2>
      
      {selectedCandidates.length === 0 ? (
        <div className="empty-team">
          <p>No candidates selected yet. Go to the "All Candidates" tab to start building your team.</p>
        </div>
      ) : (
        <>
          {diversity && (
            <div className="team-overview">
              <h3>Team Diversity Analysis</h3>
              <div className="diversity-stats">
                <div className="stat">
                  <strong>Geographic Diversity:</strong> {diversity.locations.length} locations
                  <div className="stat-details">{diversity.locations.join(', ')}</div>
                </div>
                <div className="stat">
                  <strong>Experience Levels:</strong> {diversity.experienceLevels.join(', ')}
                </div>
                <div className="stat">
                  <strong>Unique Skills:</strong> {diversity.skillCount} different skills
                </div>
                <div className="stat">
                  <strong>Average Score:</strong> {diversity.avgScore.toFixed(1)}
                </div>
              </div>
            </div>
          )}

          <div className="team-members">
            {selectedCandidates.map(candidate => (
              <div key={candidate.id} className="team-member-card">
                <div className="member-header">
                  <h3>{candidate.name}</h3>
                  <div className="member-score">{candidate.total_score}</div>
                </div>
                
                <div className="member-details">
                  <p><strong>Location:</strong> {candidate.location}</p>
                  <p><strong>Experience:</strong> {candidate.experience_years} years</p>
                  <p><strong>Skills:</strong> {candidate.skills}</p>
                  <p><strong>Previous Company:</strong> {candidate.previous_company}</p>
                  
                  <div className="score-breakdown">
                    <span>Technical: {candidate.technical_score}</span>
                    <span>Resume: {candidate.resume_score}</span>
                    <span>Diversity: {candidate.diversity_score}</span>
                  </div>
                </div>

                {candidate.selection_reason && (
                  <div className="selection-reason">
                    <strong>Selection Reason:</strong>
                    <p>{candidate.selection_reason}</p>
                  </div>
                )}

                <button 
                  onClick={() => handleDeselect(candidate.id)}
                  className="deselect-btn"
                >
                  Remove from Team
                </button>
              </div>
            ))}
          </div>

          {selectedCandidates.length === 5 && (
            <div className="team-complete">
              <h3>🎉 Team Complete!</h3>
              <p>You have selected your team of 5 candidates. Review the diversity analysis above and selection reasons.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SelectedTeam;
