export interface User {
  id: string;
  name: string;
  email: string;
  institution?: string;
  major?: string;
  createdAt?: string;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  filename: string;
  course_tag: string;
  file_size: number;
  page_count: number;
  chunk_count: number;
  word_count: number;
  embedding_model: string;
  vector_index_type: string;
  created_at: string;
}

export interface SourceReference {
  chunk_id: string;
  doc_id: string;
  filename: string;
  page_number: number;
  score: number;
  excerpt: string;
}

export type StudyChatMode = "Quick" | "2-Mark" | "5-Mark" | "10-Mark" | "Teach Me";

export interface ChatSessionItem {
  id: string;
  user_id: string;
  question: string;
  mode: StudyChatMode;
  answer: string;
  model_used: string;
  sources: SourceReference[];
  created_at: string;
}

export interface TeachExplanationItem {
  id: string;
  user_id: string;
  topic: string;
  intuition: string;
  concept: string;
  example: string;
  important_points: string[];
  common_mistakes: string[];
  quick_check: {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  };
  sources: SourceReference[];
  model_used: string;
  created_at: string;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  topic: string;
  options: string[];
  correct_index: number;
  explanation: string;
  source_filename: string;
  source_page: number;
  source_excerpt: string;
}

export interface QuizItem {
  id: string;
  user_id: string;
  title: string;
  topic_focus: string;
  questions: QuizQuestionItem[];
  submitted: boolean;
  user_answers?: number[];
  score?: number;
  total?: number;
  percentage?: number;
  weak_topics_identified?: string[];
  created_at: string;
  completed_at?: string;
}

export interface StudyPlanTaskItem {
  id: string;
  day_number: number;
  date_label: string;
  topic: string;
  activity_type: "Concept Review" | "Practice Quiz" | "Active Recall" | "Source Deep-Dive";
  duration_minutes: number;
  source_reference: string;
  notes: string;
  completed: boolean;
}

export interface StudyPlanItem {
  id: string;
  user_id: string;
  title: string;
  exam_date: string;
  days_remaining: number;
  daily_hours: number;
  focus_topics: string[];
  tasks: StudyPlanTaskItem[];
  created_at: string;
}

export interface RescueSheetItem {
  id: string;
  user_id: string;
  title: string;
  high_yield_definitions: Array<{
    term: string;
    definition: string;
    source_ref: string;
  }>;
  core_formulas_or_rules: Array<{
    name: string;
    expression_or_rule: string;
    when_to_use: string;
    source_ref: string;
  }>;
  likely_exam_questions: Array<{
    question: string;
    mark_weight: string;
    key_points_to_hit: string[];
    source_ref: string;
  }>;
  rapid_pitfalls: string[];
  sources: Array<{
    filename: string;
    page_number: number;
  }>;
  created_at: string;
}

export interface DashboardSummary {
  stats: {
    document_count: number;
    total_pages: number;
    total_chunks: number;
    questions_asked: number;
    concepts_taught: number;
    quizzes_completed: number;
    average_quiz_score: number | null;
    active_study_plans: number;
  };
  recent_documents: DocumentItem[];
  recent_chats: ChatSessionItem[];
  recent_quizzes: QuizItem[];
  weak_topics: Array<{
    topic: string;
    missed: number;
    total: number;
    accuracy: number;
  }>;
  model_config: {
    gemma_model: string;
  };
}

export type AppPage =
  | "landing"
  | "dashboard"
  | "documents"
  | "chat"
  | "teach"
  | "quiz"
  | "progress"
  | "plan"
  | "rescue";
