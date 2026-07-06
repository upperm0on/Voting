export interface Category {
  id: number;
  name: string;
}

export interface Candidate {
  id: number;
  position: number;
  position_name: string;
  name: string;
  picture: string | null;
}

export interface CandidateResult {
  id: number;
  individual: string;
  picture: string | null;
  votes: number;
}

export interface CategoryResult {
  category_id: number;
  category: string;
  total_votes: number;
  details: CandidateResult[];
  winner: CandidateResult | null;
}

export interface TokenBatch {
  batch_name: string;
  total: number;
  used: number;
  unused: number;
  created_at: string | null;
}

export interface VoterToken {
  id: number;
  token: string;
  is_used: boolean;
  batch_name: string;
  created_at: string;
  used_at: string | null;
}
