export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isLoading?: boolean;
}

export interface AssistantConfig {
  name: string;
  systemInstruction: string;
  model: string;
}

export interface ChatSession {
  messages: Message[];
}
