'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  getCountFromServer,
  setDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import type { CommunityPost, Comment, CommunityReport } from '@/types/community';

// --- Posts ---

export async function createCommunityPost(data: {
  title: string;
  content: string;
  contentPlainText: string;
  type: 'discussion' | 'question' | 'announcement';
  tags: string[];
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
}) {
  try {
    const postRef = await addDoc(collection(db, 'communityPosts'), {
      ...data,
      likeCount: 0,
      commentCount: 0,
      flagged: false,
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { success: true, postId: postRef.id };
  } catch (error) {
    console.error('Error creating post:', error);
    return { error: 'Failed to create post.' };
  }
}

export async function updateCommunityPost(
  postId: string,
  userId: string,
  data: { title?: string; content?: string; contentPlainText?: string; tags?: string[] }
) {
  try {
    const postRef = doc(db, 'communityPosts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return { error: 'Post not found.' };
    if (postSnap.data().authorId !== userId) return { error: 'Not authorized.' };

    const cleanData: Record<string, any> = { updatedAt: new Date().toISOString() };
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) cleanData[key] = value;
    }
    await updateDoc(postRef, cleanData);
    return { success: true };
  } catch (error) {
    console.error('Error updating post:', error);
    return { error: 'Failed to update post.' };
  }
}

export async function deleteCommunityPost(postId: string, userId: string) {
  try {
    const postRef = doc(db, 'communityPosts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return { error: 'Post not found.' };

    const postData = postSnap.data();
    if (postData.authorId !== userId) return { error: 'Not authorized.' };

    await updateDoc(postRef, { deleted: true, updatedAt: new Date().toISOString() });
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { error: 'Failed to delete post.' };
  }
}

export async function getCommunityPosts(options: {
  type?: 'discussion' | 'question' | 'announcement';
  authorId?: string;
  pageSize?: number;
  lastPostDate?: string;
}) {
  try {
    const { type, authorId, pageSize = 10, lastPostDate } = options;
    const constraints: any[] = [where('deleted', '==', false)];

    if (type) constraints.push(where('type', '==', type));
    if (authorId) constraints.push(where('authorId', '==', authorId));

    constraints.push(orderBy('createdAt', 'desc'));

    if (lastPostDate) {
      constraints.push(startAfter(lastPostDate));
    }

    constraints.push(firestoreLimit(pageSize + 1));

    const q = query(collection(db, 'communityPosts'), ...constraints);
    const snapshot = await getDocs(q);

    const posts: CommunityPost[] = [];
    snapshot.forEach((d) => {
      posts.push({ id: d.id, ...d.data() } as CommunityPost);
    });

    const hasMore = posts.length > pageSize;
    if (hasMore) posts.pop();

    return { posts, hasMore };
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return { posts: [], hasMore: false, error: error?.message || 'Failed to fetch posts.' };
  }
}

export async function getCommunityPostById(postId: string, userId?: string) {
  try {
    const postRef = doc(db, 'communityPosts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists() || postSnap.data().deleted) return { post: null };

    const post: CommunityPost = { id: postSnap.id, ...postSnap.data() } as CommunityPost;

    if (userId) {
      const likeRef = doc(db, 'communityPosts', postId, 'likes', userId);
      const likeSnap = await getDoc(likeRef);
      post.hasLiked = likeSnap.exists();
    }

    return { post };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { post: null };
  }
}

// --- Comments ---

export async function addComment(data: {
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
}) {
  try {
    const commentRef = await addDoc(
      collection(db, 'communityPosts', data.postId, 'comments'),
      {
        postId: data.postId,
        content: data.content,
        authorId: data.authorId,
        authorName: data.authorName,
        authorPhotoURL: data.authorPhotoURL,
        deleted: false,
        createdAt: new Date().toISOString(),
      }
    );

    const postRef = doc(db, 'communityPosts', data.postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      await updateDoc(postRef, { commentCount: (postSnap.data().commentCount || 0) + 1 });
    }

    return { success: true, commentId: commentRef.id };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { error: 'Failed to add comment.' };
  }
}

export async function deleteComment(postId: string, commentId: string, userId: string) {
  try {
    const commentRef = doc(db, 'communityPosts', postId, 'comments', commentId);
    const commentSnap = await getDoc(commentRef);
    if (!commentSnap.exists()) return { error: 'Comment not found.' };
    if (commentSnap.data().authorId !== userId) return { error: 'Not authorized.' };

    await updateDoc(commentRef, { deleted: true });

    const postRef = doc(db, 'communityPosts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const count = postSnap.data().commentCount || 1;
      await updateDoc(postRef, { commentCount: Math.max(0, count - 1) });
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { error: 'Failed to delete comment.' };
  }
}

export async function getComments(postId: string) {
  try {
    const q = query(
      collection(db, 'communityPosts', postId, 'comments'),
      where('deleted', '==', false),
      orderBy('createdAt', 'asc')
    );
    const snapshot = await getDocs(q);
    const comments: Comment[] = [];
    snapshot.forEach((d) => {
      comments.push({ id: d.id, ...d.data() } as Comment);
    });
    return { comments };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { comments: [] };
  }
}

// --- Likes ---

export async function toggleLike(postId: string, userId: string) {
  try {
    const likeRef = doc(db, 'communityPosts', postId, 'likes', userId);
    const likeSnap = await getDoc(likeRef);
    const postRef = doc(db, 'communityPosts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) return { error: 'Post not found.' };

    const currentCount = postSnap.data().likeCount || 0;

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likeCount: Math.max(0, currentCount - 1) });
      return { liked: false, likeCount: Math.max(0, currentCount - 1) };
    } else {
      await setDoc(likeRef, { userId, createdAt: new Date().toISOString() });
      await updateDoc(postRef, { likeCount: currentCount + 1 });
      return { liked: true, likeCount: currentCount + 1 };
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return { error: 'Failed to toggle like.' };
  }
}

// --- Reports & Moderation ---

export async function reportContent(data: {
  contentType: 'post' | 'comment';
  contentId: string;
  postId: string;
  reason: string;
  reporterId: string;
  reporterName: string;
}) {
  try {
    await addDoc(collection(db, 'communityReports'), {
      ...data,
      resolved: false,
      createdAt: new Date().toISOString(),
    });

    if (data.contentType === 'post') {
      await updateDoc(doc(db, 'communityPosts', data.postId), { flagged: true });
    }

    return { success: true };
  } catch (error) {
    console.error('Error reporting content:', error);
    return { error: 'Failed to submit report.' };
  }
}

export async function getFlaggedPosts() {
  try {
    const q = query(
      collection(db, 'communityPosts'),
      where('flagged', '==', true),
      where('deleted', '==', false),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const posts: CommunityPost[] = [];
    snapshot.forEach((d) => {
      posts.push({ id: d.id, ...d.data() } as CommunityPost);
    });
    return { posts };
  } catch (error) {
    console.error('Error fetching flagged posts:', error);
    return { posts: [] };
  }
}

export async function moderatePost(postId: string, action: 'dismiss' | 'delete') {
  try {
    const postRef = doc(db, 'communityPosts', postId);
    if (action === 'dismiss') {
      await updateDoc(postRef, { flagged: false });
    } else {
      await updateDoc(postRef, { deleted: true, updatedAt: new Date().toISOString() });
    }

    const reportsQuery = query(
      collection(db, 'communityReports'),
      where('postId', '==', postId),
      where('resolved', '==', false)
    );
    const reportsSnap = await getDocs(reportsQuery);
    const updates = reportsSnap.docs.map((d) => updateDoc(d.ref, { resolved: true }));
    await Promise.all(updates);

    return { success: true };
  } catch (error) {
    console.error('Error moderating post:', error);
    return { error: 'Failed to moderate post.' };
  }
}
