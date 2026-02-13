export interface DashboardSettings {
  bonusActive: boolean;
  bonusTitle?: string | null;
  bonusDescription?: string | null;
  familyBalance: number;
  familyLevel: number;
  familyXP: number;
  familyXPRequired: number;
  goalName?: string | null;
  goalCurrent?: number | null;
  goalTarget?: number | null;
}

export interface RecentReport {
  id: string;
  itemName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  user: {
    firstName: string | null;
    name: string | null;
  };
}

export interface BestEmployee {
  firstName: string | null;
  name: string | null;
  image: string | null;
  reports: {
    userShare: number | null;
  }[];
}
