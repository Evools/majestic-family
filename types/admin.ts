export interface AdminStats {
  totalMembers: number;
  pendingReports: number;
  activeContracts: number;
  familyBalance: number;
  recentReports: AdminRecentReport[];
}

export interface AdminRecentReport {
  id: string;
  itemName: string;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string; // serialized date from API
  user: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}
