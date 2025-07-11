export interface StudyRecord {
  id: string;
  subject: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface CreateStudyRecord {
  subject: string;
  title: string;
  content: string;
} 