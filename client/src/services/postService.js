import { apiClient } from './apiClient.js';

export const postService = {
  /**
   * Fetch all feed posts
   */
  async getPosts() {
    const res = await apiClient.get('/api/posts');
    if (res && Array.isArray(res.posts)) return res.posts;
    if (Array.isArray(res)) return res;
    return [];
  },

  /**
   * Create a new post
   */
  async createPost(postData) {
    const res = await apiClient.post('/api/posts', postData);
    return res.post;
  },

  /**
   * Like / unlike a post
   */
  async toggleLike(postId, userId) {
    return apiClient.post(`/api/posts/${postId}/like`, { userId });
  },

  /**
   * Add a comment to a post
   */
  async addComment(postId, commentData) {
    const res = await apiClient.post(`/api/posts/${postId}/comment`, commentData);
    return res.post;
  }
};
