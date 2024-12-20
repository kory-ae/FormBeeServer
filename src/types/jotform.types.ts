export interface FormAnswer {
    name: string;
    text: string;
    type: string;
    answer?: string;
    order: string;
  }
  
  export interface FormResponse {
    id: number;
    created_at: string;
    answers: Record<string, FormAnswer>;
  }
  
  export interface FormRecord {
    questionId: string;
    questionText: string;
    answer: string;
    type: string;
    order: string;
  }