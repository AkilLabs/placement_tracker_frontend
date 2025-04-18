export interface InternshipUpdate {
  Company: string;
  Department: string;
  NumberOfStudents: number;
  Status: string;
}

export interface FormData {
  Date: string;
  ReportedBy: string;
  FinalYearPlacementUpdates: {
    OffersReceived: string;
    TotalSinceApril: string;
    Remarks: string;
    UnplacedStudentsCount: {
      SNSCE: number;
      SNSCT: number;
    };
    AwaitedResults: string;
  };
  PreFinalYearInternships: {
    OffersToday: string;
    TotalSinceApril: number;
    Remarks: string;
  };
  PreFinalYearHighSalaryOpportunities: {
    OffersToday: string;
    TotalSinceApril: string;
    Remarks: string;
  };
  InternshipUpdates: InternshipUpdate[];
}

export interface User {
  id?: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  token?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}