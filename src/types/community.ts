export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  contentPlainText: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  type: 'discussion' | 'question' | 'announcement';
  tags: string[];
  likeCount: number;
  commentCount: number;
  flagged: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  hasLiked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  deleted: boolean;
  createdAt: string;
}

export interface CommunityReport {
  id: string;
  contentType: 'post' | 'comment';
  contentId: string;
  postId: string;
  reason: string;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  resolved: boolean;
}
