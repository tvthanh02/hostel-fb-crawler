export interface FacebookPost {
  facebookUrl?: string;
  url?: string;
  time?: string;
  user?: {
    id: string;
    name: string;
  };
  text?: string;
  topReactionsCount?: number;
  feedbackId?: string;
  id?: string;
  legacyId: string; // Required - used as unique ID
  attachments?: FacebookAttachment[];
  likesCount?: number;
  sharesCount?: number;
  commentsCount?: number;
  topComments?: unknown[];
  facebookId?: string;
  groupTitle?: string;
  pageAdLibrary?: {
    is_business_page_active: boolean;
    id: string;
  };
  inputUrl?: string;
}

export interface FacebookAttachment {
  thumbnail?: string;
  __typename?: string;
  is_playable?: boolean;
  image?: {
    uri: string;
    height: number;
    width: number;
  };
  id?: string;
  ocrText?: string;
  mediaset_token?: string;
  url?: string;
}