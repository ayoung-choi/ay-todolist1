export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded data
  uploadedAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  assignee: string; // 담당자
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string; // 예: 시술, 상담, 재고관리, 청소 등
  dueDate?: Date;
  status: 'todo' | 'in-progress' | 'completed';
  comments: Comment[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface TodoFilters {
  assignee?: string;
  category?: string;
  status?: Todo['status'];
  priority?: Todo['priority'];
  search?: string;
}

export interface TodoSort {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}

export interface AppSettings {
  teamMembers: TeamMember[];
  categories: Category[];
  defaultAssignee?: string;
}
