export interface StudyRecord {
  id: string;
  subject: string;
  duration: number; // 学習時間（分）
  notes?: string; // 任意のメモ
  createdAt: Date;
  updatedAt: Date;
  user_id: string;
  user_email?: string;
  user_name?: string;
}

export interface CreateStudyRecord {
  subject: string;
  duration: number; // 学習時間（分）
  notes?: string; // 任意のメモ
}
