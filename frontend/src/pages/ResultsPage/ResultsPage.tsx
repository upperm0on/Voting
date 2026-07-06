import React, { useState, useEffect } from 'react';
import { Download, Printer, Eye, Lock } from 'lucide-react';
import type { CategoryResult } from '../../types';

interface ResultsPageProps {
  apiBase: string;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({ apiBase }) => {
  const [resultsData, setResultsData] = useState<CategoryResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [revealedCategories, setRevealedCategories] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/vote-summary/`);
      if (!res.ok) throw new Error('Failed to load voting results.');
      const data = await res.json();
      setResultsData(data);
    } catch (err: any) {
      console.error(err);
      alert('Error fetching voting results: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReveal = (categoryId: number) => {
    setRevealedCategories(prev => ({
      ...prev,
      [categoryId]: true
    }));
  };

  const getPictureUrl = (url: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&q=80';
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  const exportToCSV = () => {
    if (resultsData.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Rank,Candidate,Votes,Percentage\n";

    resultsData.forEach(cat => {
      cat.details.forEach((detail, index) => {
        const pct = cat.total_votes > 0 ? ((detail.votes / cat.total_votes) * 100).toFixed(1) : "0";
        csvContent += `"${cat.category.replace(/"/g, '""')}",` +
                      `${index + 1},` +
                      `"${detail.individual.replace(/"/g, '""')}",` +
                      `${detail.votes},` +
                      `${pct}%\n`;
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `school_voting_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="summary-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', margin: '0' }}>Election Live Dashboard</h1>
        </div>
        <div className="export-group" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={triggerPrint}>
            <Printer size={18} />
            Print / PDF
          </button>
          <button className="btn btn-primary" onClick={exportToCSV}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div style={{
            width: '30px', height: '30px', border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary-color)', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 12px'
          }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Recalculating election reports...</p>
        </div>
      ) : resultsData.length === 0 ? (
        <div className="wizard-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No election results are available. Cast some votes first!
        </div>
      ) : (
        <div>
          {resultsData.map(cat => {
            const isRevealed = revealedCategories[cat.category_id] || false;
            
            // Winners (Top 2)
            const topTwo = cat.details.slice(0, 2);
            // Others (3rd and lower)
            const others = cat.details.slice(2);

            return (
              <section key={cat.category_id} className="results-category-section" style={{
                backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '32px'
              }}>
                
                <div className="results-category-header" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px'
                }}>
                  <h3 className="results-category-title" style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>
                    {cat.category}
                  </h3>
                  <span className="results-total-votes" style={{
                    fontSize: '0.9rem', color: 'var(--primary-color)', backgroundColor: 'var(--primary-light)',
                    padding: '4px 12px', borderRadius: '9999px', fontWeight: 'bold'
                  }}>
                    {cat.total_votes} total votes
                  </span>
                </div>

                {/* Sub-container containing Top standouts & Winner Spotlight */}
                <div className="results-grid">
                  
                  {/* Candidates stands lists */}
                  <div>
                    {/* Top 2 candidates (Hidden/Blurred until revealed) */}
                    <div className="results-locked-container">
                      {!isRevealed && topTwo.length > 0 && (
                        <div className="results-locked-overlay">
                          <Lock size={32} style={{ color: '#f59e0b', marginBottom: '12px' }} />
                          <h4 style={{ color: '#ffffff', fontSize: '1.2rem', marginBottom: '16px' }}>
                            Top Standings Locked
                          </h4>
                          <button 
                            type="button"
                            className="reveal-btn"
                            onClick={() => handleReveal(cat.category_id)}
                          >
                            <Eye size={18} />
                            Reveal Final Standings
                          </button>
                        </div>
                      )}

                      {/* Top Two candidate listings */}
                      <div style={{ filter: !isRevealed && topTwo.length > 0 ? 'blur(8px)' : 'none', transition: 'filter 0.3s ease', padding: '4px' }}>
                        {topTwo.map((detail, index) => {
                          const percentage = cat.total_votes > 0 ? (detail.votes / cat.total_votes) * 100 : 0;
                          const rank = index + 1;

                          return (
                            <div key={detail.id} className="candidate-progress-row" style={{
                              display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px'
                            }}>
                              <div className={`results-rank-badge rank-${rank}`}>
                                {rank}
                              </div>
                              <img 
                                src={getPictureUrl(detail.picture)} 
                                alt="" 
                                className="candidate-progress-pic" 
                              />
                              <div className="candidate-progress-info" style={{ flexGrow: 1 }}>
                                <div className="candidate-progress-labels" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
                                  <span>{detail.individual}</span>
                                  <span>
                                    {detail.votes} votes 
                                    <span className="candidate-progress-votes" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 'normal' }}>
                                      {' '}({percentage.toFixed(1)}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="progress-bar-container">
                                  <div 
                                    className="progress-bar-fill" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Others list (3rd place and below - always visible) */}
                    {others.length > 0 && (
                      <div style={{ marginTop: '24px', borderTop: '1px dashed var(--border-color)', paddingTop: '16px' }}>
                        <h5 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          Other Contestants
                        </h5>
                        {others.map((detail, index) => {
                          const percentage = cat.total_votes > 0 ? (detail.votes / cat.total_votes) * 100 : 0;
                          const rank = index + 3; // Offset by 2 (top two)

                          return (
                            <div key={detail.id} className="candidate-progress-row" style={{
                              display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px'
                            }}>
                              <div className="results-rank-badge">
                                {rank}
                              </div>
                              <img 
                                src={getPictureUrl(detail.picture)} 
                                alt="" 
                                className="candidate-progress-pic" 
                                style={{ opacity: 0.8 }}
                              />
                              <div className="candidate-progress-info" style={{ flexGrow: 1 }}>
                                <div className="candidate-progress-labels" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.95rem' }}>
                                  <span>{detail.individual}</span>
                                  <span>
                                    {detail.votes} votes 
                                    <span className="candidate-progress-votes" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                      {' '}({percentage.toFixed(1)}%)
                                    </span>
                                  </span>
                                </div>
                                <div className="progress-bar-container">
                                  <div 
                                    className="progress-bar-fill" 
                                    style={{ width: `${percentage}%`, backgroundColor: 'var(--border-color)' }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Winner Spotlight side panel (Revealed dynamically) */}
                  <div>
                    {isRevealed ? (
                      cat.winner ? (
                        <div className="winner-card" style={{ height: '100%' }}>
                          <div className="winner-badge">Winner</div>
                          <span className="winner-title" style={{ fontSize: '0.8rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 'bold' }}>
                            Winner Elect
                          </span>
                          <img 
                            src={getPictureUrl(cat.winner.picture)} 
                            alt="" 
                            className="winner-pic" 
                          />
                          <span className="winner-name" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{cat.winner.individual}</span>
                          <span className="winner-votes-desc">
                            Leading with <strong>{cat.winner.votes}</strong> votes out of {cat.total_votes}
                          </span>
                        </div>
                      ) : (
                        <div style={{
                          height: '100%', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
                          color: 'var(--text-muted)', fontSize: '0.95rem', minHeight: '260px'
                        }}>
                          No candidate has received votes yet.
                        </div>
                      )
                    ) : (
                      /* Spotlight lock screen */
                      <div style={{
                        height: '100%', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px',
                        color: 'var(--text-muted)', minHeight: '260px', textAlign: 'center'
                      }}>
                        <Lock size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <span>Winner Spotlight is Locked</span>
                      </div>
                    )}
                  </div>

                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
