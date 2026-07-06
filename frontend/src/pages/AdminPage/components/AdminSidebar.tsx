import React from 'react';
import { Vote, Users, KeyRound, Award } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: 'categories' | 'candidates' | 'tokens' | 'results';
  onChangeTab: (tab: 'categories' | 'candidates' | 'tokens' | 'results') => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onChangeTab }) => {
  return (
    <aside className="admin-sidebar">
      <button 
        type="button"
        className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
        onClick={() => onChangeTab('categories')}
      >
        <Vote size={18} />
        <span>Voting Positions</span>
      </button>
      <button 
        type="button"
        className={`admin-tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
        onClick={() => onChangeTab('candidates')}
      >
        <Users size={18} />
        <span>Candidates Directory</span>
      </button>
      <button 
        type="button"
        className={`admin-tab-btn ${activeTab === 'tokens' ? 'active' : ''}`}
        onClick={() => onChangeTab('tokens')}
      >
        <KeyRound size={18} />
        <span>Voter Tokens</span>
      </button>
      <button 
        type="button"
        className={`admin-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
        onClick={() => onChangeTab('results')}
      >
        <Award size={18} />
        <span>Live Results</span>
      </button>
    </aside>
  );
};
