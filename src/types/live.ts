export interface LiveStatus {
  isLive: boolean;
  videoId?: string;
  embedUrl?: string;
  hlsUrl?: string;
  title?: string;
  startedAt?: string; // ISO string
}

export interface LivePlayerState {
  isVisible: boolean;
  isMinimized: boolean;
  isMuted: boolean;
  userDismissed: boolean;
}

export interface LiveCommentAuthor {
  id?: string;
  name: string;
  pictureUrl?: string;
}

export interface LiveCommentItem {
  id: string;
  author: LiveCommentAuthor;
  message: string;
  createdAt: string; // ISO
  likeCount?: number;
  replyCount?: number;
}

export interface LiveCommentsPage {
  items: LiveCommentItem[];
  paging?: { nextCursor?: string; previousCursor?: string };
}


