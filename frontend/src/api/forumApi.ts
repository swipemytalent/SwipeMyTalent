import { HttpService } from '../services/httpService';

export interface Forum {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  topicsCount: number;
  postsCount: number;
}

export interface Topic {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorFirstName: string;
  authorLastName: string;
  authorAvatar: string;
  postsCount: number;
  lastPostAt: string;
}

export interface Post {
  id: number;
  content: string;
  isSolution: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  authorFirstName: string;
  authorLastName: string;
  authorAvatar: string;
}

export interface ForumDetail {
  forum: Forum;
  topics: Topic[];
}

export interface TopicDetail {
  topic: Topic & {
    forumId: number;
    forumName: string;
  };
  posts: Post[];
}

export async function getAllForums(): Promise<Forum[]> {
  return await HttpService.get<Forum[]>('/forums');
}

export async function getForumById(id: number): Promise<ForumDetail> {
  return await HttpService.get<ForumDetail>(`/forums/${id}`);
}

export async function createTopic(data: {
  forumId: number;
  title: string;
  content: string;
}): Promise<{ message: string; topicId: number }> {
  return await HttpService.post<{ message: string; topicId: number }>('/topics', data);
}

export async function getTopicById(id: number): Promise<TopicDetail> {
  return await HttpService.get<TopicDetail>(`/topics/${id}`);
}

export async function createPost(data: {
  topicId: number;
  content: string;
}): Promise<{ message: string; postId: number }> {
  return await HttpService.post<{ message: string; postId: number }>('/posts', data);
} 