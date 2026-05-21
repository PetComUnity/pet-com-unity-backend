export type LostReportStatus = 'active' | 'resolved';

export interface LostReport {
  id: string;
  petId: string;
  ownerId: string;
  city: string;
  lastSeenLocation?: string;
  dateLost?: Date;
  message?: string;
  status: LostReportStatus;
  createdAt: Date;
}

export interface CreateLostReportInput {
  petId: string;
  ownerId: string;
  city: string;
  lastSeenLocation?: string;
  dateLost?: string;
  message?: string;
}
