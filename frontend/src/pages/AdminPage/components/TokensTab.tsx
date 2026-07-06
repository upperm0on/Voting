import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Copy, Check, Download, FileSpreadsheet } from 'lucide-react';
import type { TokenBatch, VoterToken } from '../../../types';
import { Modal } from '../../../components/ui/Modal';

interface TokensTabProps {
  apiBase: string;
}

export const TokensTab: React.FC<TokensTabProps> = ({ apiBase }) => {
  const [batches, setBatches] = useState<TokenBatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // View tokens sub-state
  const [viewingBatchName, setViewingBatchName] = useState<string | null>(null);
  const [batchTokens, setBatchTokens] = useState<VoterToken[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Generate batch sub-state
  const [isGenModalOpen, setIsGenModalOpen] = useState<boolean>(false);
  const [batchName, setBatchName] = useState<string>('');
  const [tokenCount, setTokenCount] = useState<number>(50);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/voter-tokens/batches/`);
      if (!res.ok) throw new Error('Failed to load token batches');
      const data = await res.json();
      setBatches(data);
    } catch (err: any) {
      alert(err.message || 'Error fetching batches');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim() || tokenCount <= 0) return;
    setIsGenerating(true);

    try {
      const res = await fetch(`${apiBase}/api/voter-tokens/generate_batch/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_name: batchName.trim(), count: tokenCount })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate token batch');

      alert(data.message);
      setIsGenModalOpen(false);
      setBatchName('');
      setTokenCount(50);
      await fetchBatches();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteBatch = async (batchName: string) => {
    if (!confirm(`Are you sure you want to delete batch "${batchName}"? This will invalidate all unused tokens in this batch and delete logs of used tokens.`)) return;

    try {
      const res = await fetch(`${apiBase}/api/voter-tokens/delete_batch/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_name: batchName })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete batch');

      alert(data.message);
      if (viewingBatchName === batchName) {
        setViewingBatchName(null);
      }
      await fetchBatches();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleViewTokens = async (batchName: string) => {
    setViewingBatchName(batchName);
    setIsLoadingTokens(true);
    try {
      const res = await fetch(`${apiBase}/api/voter-tokens/?batch_name=${encodeURIComponent(batchName)}`);
      if (!res.ok) throw new Error('Failed to load batch tokens');
      const data = await res.json();
      setBatchTokens(data);
    } catch (err: any) {
      alert(err.message || 'Error fetching batch tokens');
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const downloadBatchCSV = async (batchName: string, format: 'list' | 'grid') => {
    try {
      const res = await fetch(`${apiBase}/api/voter-tokens/?batch_name=${encodeURIComponent(batchName)}`);
      if (!res.ok) throw new Error('Failed to load batch tokens for export');
      const tokens: VoterToken[] = await res.json();
      
      let csvContent = '';
      if (format === 'list') {
        csvContent = 'Token,Status,Used At\n' + tokens.map(t => {
          const status = t.is_used ? 'used' : 'unused';
          const usedAt = t.used_at ? new Date(t.used_at).toLocaleString().replace(/,/g, '') : '';
          return `${t.token},${status},${usedAt}`;
        }).join('\n');
      } else {
        const colsCount = 5;
        const rowsCount = Math.ceil(tokens.length / colsCount);
        const rows = [];
        
        for (let r = 0; r < rowsCount; r++) {
          const rowTokens = [];
          for (let c = 0; c < colsCount; c++) {
            const idx = r * colsCount + c;
            if (idx < tokens.length) {
              rowTokens.push(tokens[idx].token);
            } else {
              rowTokens.push('');
            }
          }
          rows.push(rowTokens.join(','));
        }
        csvContent = rows.join('\n');
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${batchName.replace(/\s+/g, '_')}_tokens_${format}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || 'Error exporting batch CSV');
    }
  };

  const copyTokensToClipboard = () => {
    const text = batchTokens.map(t => t.token).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedToken('all');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const copySingleToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setCopiedToken(tok);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div>
      <div className="admin-header-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2>Voter Authentication Tokens</h2>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsGenModalOpen(true)}
        >
          <Plus size={18} />
          Generate Batch
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{
            width: '24px', height: '24px', border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary-color)', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 8px'
          }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading token batches...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Batch Name</th>
                <th>Created At</th>
                <th>Total Tokens</th>
                <th>Used Standings</th>
                <th>Unused Standings</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No token batches configured. Click "Generate Batch" to create one.
                  </td>
                </tr>
              ) : (
                batches.map((batch, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{batch.batch_name}</td>
                    <td>{formatDate(batch.created_at)}</td>
                    <td>{batch.total}</td>
                    <td>
                      <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>
                        {batch.used} used
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                        {batch.unused} available
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          className="action-icon-btn" 
                          onClick={() => handleViewTokens(batch.batch_name)}
                          title="View tokens in batch"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="action-icon-btn" 
                          onClick={() => downloadBatchCSV(batch.batch_name, 'grid')}
                          title="Download print grid (CSV)"
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          className="action-icon-btn delete" 
                          onClick={() => handleDeleteBatch(batch.batch_name)}
                          title="Delete entire batch"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Viewing Tokens Modal */}
      {viewingBatchName && (
        <Modal 
          isOpen={true} 
          onClose={() => setViewingBatchName(null)}
          title={`Batch Details: ${viewingBatchName}`}
        >
          {isLoadingTokens ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{
                width: '24px', height: '24px', border: '3px solid var(--border-color)',
                borderTopColor: 'var(--primary-color)', borderRadius: '50%',
                animation: 'spin 1s linear infinite', margin: '0 auto 8px'
              }}></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading batch tokens...</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Total: {batchTokens.length} tokens
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={copyTokensToClipboard}
                  >
                    {copiedToken === 'all' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedToken === 'all' ? 'Copied!' : 'Copy All'}</span>
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => downloadBatchCSV(viewingBatchName, 'grid')}
                  >
                    <Download size={14} />
                    <span>Print Grid (CSV)</span>
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={() => downloadBatchCSV(viewingBatchName, 'list')}
                  >
                    <FileSpreadsheet size={14} />
                    <span>List (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Grid of Tokens */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '10px', maxHeight: '300px', overflowY: 'auto', padding: '12px',
                backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)', marginBottom: '20px'
              }}>
                {batchTokens.map(tok => (
                  <div 
                    key={tok.id} 
                    onClick={() => copySingleToken(tok.token)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 10px', borderRadius: '4px', cursor: 'pointer',
                      border: '1px solid var(--border-color)', 
                      backgroundColor: tok.is_used ? 'var(--danger-bg)' : 'var(--bg-card)',
                      color: tok.is_used ? 'var(--danger-color)' : 'var(--text-main)',
                      fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 'bold'
                    }}
                    title={tok.is_used ? `Used on ${formatDate(tok.used_at)}` : 'Click to copy token'}
                  >
                    <span>{tok.token}</span>
                    {copiedToken === tok.token ? (
                      <Check size={12} />
                    ) : tok.is_used ? (
                      <span style={{ fontSize: '0.65rem' }}>USED</span>
                    ) : (
                      <Copy size={10} style={{ opacity: 0.5 }} />
                    )}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setViewingBatchName(null)}
                >
                  Close View
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Generate Tokens Modal */}
      {isGenModalOpen && (
        <Modal 
          isOpen={isGenModalOpen} 
          onClose={() => setIsGenModalOpen(false)}
          title="Generate Voter Tokens"
        >
          <form onSubmit={handleGenerateBatch}>
            <div className="form-group">
              <label className="form-label" htmlFor="batch-name-input">Batch / Chunk Name</label>
              <input 
                type="text" 
                id="batch-name-input"
                className="form-input" 
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. Science Dept Batch A"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="token-count-input">Number of Tokens</label>
              <input 
                type="number" 
                id="token-count-input"
                className="form-input" 
                value={tokenCount}
                onChange={(e) => setTokenCount(Math.max(1, parseInt(e.target.value) || 0))}
                min={1}
                max={2000}
                placeholder="e.g. 100"
                required
              />

            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setIsGenModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isGenerating || !batchName.trim()}
              >
                {isGenerating ? 'Generating...' : 'Generate Chunks'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
