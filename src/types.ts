export interface QuestionMC {
  cau: number;
  loai: 'mc';
  hoi: string;
  A: string;
  B: string;
  C: string;
  D: string;
  dapAn: 'A' | 'B' | 'C' | 'D';
}

export interface QuestionFill {
  cau: number;
  loai: 'fill';
  hoi: string;
  dapAnChapNhan: string[];
}

export type Question = QuestionMC | QuestionFill;

export type StudentName = 'Minh Chi' | 'Duy Sang' | 'Bảo Khuê';
