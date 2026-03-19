export type ImpactLevel = 'high' | 'medium' | 'low';

export interface Evidence {
  id: string;
  name: string;
  description: string;
  impact: ImpactLevel;
  status: 'available' | 'collected' | 'presented';
  actionText: string;
  icon: 'mic' | 'mail' | 'book' | 'clock';
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  internalThoughts?: string;
  attachedEvidence?: Evidence;
}
