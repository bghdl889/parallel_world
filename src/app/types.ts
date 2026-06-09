export type PageName = "home" | "create" | "join" | "timeline" | "results";
export type TemplateType = 2 | 3 | 4 | 6 | 9;

export interface NavProps {
  navigate: (path: string) => void;
}

export interface AppState {
  template: TemplateType;
  setTemplate: (t: TemplateType) => void;
}

// ─── Backend data models ──────────────────────

export interface Challenge {
  id: string;
  name: string;
  challenge_date: string;
  checkpoints: string[];
  template: number;
  status: "forming" | "active" | "completed";
  host_id: string;
  created_at: string;
}

export interface Participant {
  id: string;
  challenge_id: string;
  user_id: string;
  tags: string[];
  avatar_seed: string;
  is_host: boolean;
  joined_at: string;
}

export interface CheckIn {
  id: string;
  challenge_id: string;
  user_id: string;
  checkpoint: string;
  photo_url: string;
  caption: string;
  created_at: string;
}
