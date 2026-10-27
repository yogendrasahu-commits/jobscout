import { apiClient } from './apiClient.js';

export const postService = {
  /**
   * Fetch all feed posts
   */
  async getPosts() {
    const res = await apiClient.get('/api/posts');
    return res.posts || [];
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
