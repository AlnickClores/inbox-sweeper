export interface CachedMessage {
  id: string;
  email: string;
  name: string;
  messageIds: string[];
  count: number;
  date: number;
  unread: boolean;
}

export type Order = "desc" | "asc";
