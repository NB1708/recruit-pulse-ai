export interface MasterTrackerRow {
  stage: string;
  clientStatus: string;
  year: string;
  month: string;
  date: string;
  tl: string;
  am: string;
  recruiter: string;
  recruiterName: string;
  organisation: string;
  role: string;
  location: string;
  candidateName: string;
  contact: string;
  emailId: string;
  totalExperience: string;
  ctc: string;
  expected: string;
  noticePeriod: string;
  currentCompany: string;
  status: string;
}

export interface SelectionSheetRow {
  srNo: string;
  month: string;
  year: string;
  dateOfSelection: string;
  candidateName: string;
  contactNumber: string;
  emailId: string;
  company: string;
  location: string;
  designation: string;
  ctcOffered: string;
  joiningDate: string;
  recruiter: string;
  recruiterName: string;
  candidateStatus: string;
  leadSource: string;
  joiningConfirmation: string;
  aiOrManualLead: string;
  clientPocName: string;
}

export interface EODSheetRow {
  date: string;
  recruiterName: string;
  totalCallsMade: number;
  lineupsDone: number;
  selections: number;
  joinings: number;
  remarks: string;
}

export type TabId = 'dashboard' | 'candidates' | 'whatsapp' | 'briefing';

export interface CandidateForWhatsApp {
  candidateName: string;
  role: string;
  organisation: string;
  clientStatus: string;
  recruiter: string;
  daysStuck: number;
  contact: string;
  location: string;
}
