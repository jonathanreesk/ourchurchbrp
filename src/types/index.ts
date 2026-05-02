export interface ReadingPlan {
  id: string;
  date: string;
  day_of_week: string;
  reading: string;
  created_at: string;
}

export interface CompletedReading {
  id: string;
  date: string;
  completed_at: string;
  created_at: string;
}

export type BibleVersion = 'ESV' | 'NIV' | 'NLT';

export interface BiblePassage {
  reference: string;
  text: string;
}

export interface Comment {
  id: string;
  reading_date: string;
  author_name: string;
  content: string;
  created_at: string;
}
