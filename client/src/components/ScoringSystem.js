import React, { useState } from 'react';

const ScoringSystem = ({ candidates, onScoreUpdate }) => {
  const [scoring, setScoring] = useState(false);

  const calculateScores = (candidate) => {
    const techSkills = candidate.skills.toLowerCase();
    let technicalScore = 0;
    
    if (techSkills.includes('react')) technicalScore += 15;
    if (techSkills.includes('node.js') || techSkills.includes('nodejs')) technicalScore += 15;
    if (techSkills.includes('python')) technicalScore += 12;
    if (techSkills.includes('aws') || techSkills.includes('cloud')) technicalScore += 10;
    if (techSkills.includes('docker')) technicalScore += 8;
    if (techSkills.includes('javascript')) technicalScore += 10;
    if (techSkills.includes('java')) technicalScore += 10;
    
    technicalScore += Math.min(candidate.experience_years * 2, 20);
    
    let resumeScore = 0;
    const education = candidate.education.toLowerCase();
    if (education.includes('ms ') || education.includes('master')) resumeScore += 25;
    else if (education.includes('bs ') || education.includes('bachelor')) resumeScore += 20;
    if (education.includes('stanford') || education.includes('mit')) resumeScore += 15;
    
    const company = candidate.previous_company.toLowerCase();
    if (['google', 'apple', 'meta', 'amazon', 'microsoft'].some(c => company.includes(c))) resumeScore += 20;
    
    let diversityScore = 0;
    const location = candidate.location.toLowerCase();
    if (!location.includes('san francisco')) diversityScore += 15;
    if (candidate.experience_years >= 2 && candidate.experience_years <= 4) diversityScore += 15;
    
    technicalScore = Math.min(technicalScore, 100);
    resumeScore = Math.min(resumeScore, 100);
    diversityScore = Math.min(diversityScore, 100);
    
    const totalScore = Math.round(
      (technicalScore * 0.4) + 
      (resumeScore * 0.35) + 
      (diversityScore * 0.25)
    );
    
    return {
      technical_score: technicalScore,
      resume_score: resumeScore,
      diversity_score: diversityScore,
      total_score: totalScore
    };
  };

  const handleScoreAll = async () => {
    setScoring(true);
    
    const scoredCandidates = candidates.map(candidate => ({
      id: candidate.id,
      ...calculateScores(candidate)
    }));

    try {
      const response = await fetch('/api/candidates/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoredCandidates)
      });

      if (response.ok) {
        onScoreUpdate();
      }
    } catch (error) {
      console.error('Error updating scores:', error);
    } finally {
      setScoring(false);
    }
  };

  return (
    <div className="scoring-system">
      <h2>Automated Scoring System</h2>
      
      <div className="scoring-info">
        <div className="scoring-criteria">
          <h3>Scoring Criteria</h3>
          
          <div className="criteria-section">
            <h4>Technical Score (40% weight)</h4>
            <ul>
              <li>High-demand skills: React, Node.js, Python, AWS</li>
              <li>Experience years (up to 20 points)</li>
              <li>Programming languages and frameworks</li>
            </ul>
          </div>

          <div className="criteria-section">
            <h4>Resume Score (35% weight)</h4>
            <ul>
              <li>Education level and institution prestige</li>
              <li>Previous company reputation</li>
              <li>Professional background</li>
            </ul>
          </div>

          <div className="criteria-section">
            <h4>Diversity Score (25% weight)</h4>
            <ul>
              <li>Geographic diversity (non-Silicon Valley)</li>
              <li>Experience level variety</li>
              <li>Background diversity</li>
            </ul>
          </div>
        </div>

        <div className="scoring-actions">
          <button 
            onClick={handleScoreAll}
            disabled={scoring || candidates.length === 0}
            className="score-all-btn"
          >
            {scoring ? 'Scoring...' : `Score All ${candidates.length} Candidates`}
          </button>
          
          <div className="scoring-stats">
            <p>Candidates to process: {candidates.length}</p>
            <p>This will calculate technical, resume, and diversity scores</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringSystem;
              
