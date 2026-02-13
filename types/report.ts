import { Contract } from '@prisma/client';

export interface ReportFormState {
  userContractId: string;
  itemName: string;
  quantity: string;
  proof: string;
  comment: string;
  participantIds: string[];
}

export interface Member {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
}

export interface UserContractWithContract {
  id: string;
  contractId: string;
  status: string;
  startedAt: string | Date;
  contract: Contract;
}
