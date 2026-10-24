// Copyright (c) Meta Platforms, Inc. and affiliates.
// Social Media Content Analysis System - Seed Data (Section 5 capacity: 20% text, 60% image, 20% video)

import type { Post, User } from '../types/social';

export const CURRENT_USER: User = {
  id: 'usr_me_01',
  username: 'hunain_creator',
  name: 'Syed Muhammad Hunain',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  isFollowed: false,
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_01',
    userId: 'usr_alex_02',
    author: {
      id: 'usr_alex_02',
      username: 'alex_distrib',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      isFollowed: true,
    },
    type: 'IMAGE',
    description: 'Deconstructing our event-driven fan-out architecture at 500M DAU scale! Zero write bottleneck.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    ],
    hashtags: ['#systemdesign', '#eventdriven', '#scalability'],
    likesCount: 1420,
    commentsCount: 3,
    isLiked: false,
    comments: [
      {
        id: 'c_01',
        postId: 'post_01',
        userId: 'usr_sarah_03',
        author: {
          id: 'usr_sarah_03',
          username: 'sarah_infra',
          name: 'Sarah Chen',
          isFollowed: false,
        },
        text: 'Pre-computing feeds into FeedDB makes p99 read latencies drop under 20ms.',
        createdAt: '15m ago',
      },
      {
        id: 'c_02',
        postId: 'post_01',
        userId: 'usr_david_04',
        author: {
          id: 'usr_david_04',
          username: 'david_nosql',
          name: 'David Kim',
          isFollowed: true,
        },
        text: 'Love the decoupling between the Post Writer Service and the news feed fan-out!',
        createdAt: '8m ago',
      },
    ],
    createdAt: '22m ago',
  },
  {
    id: 'post_02',
    userId: 'usr_sarah_03',
    author: {
      id: 'usr_sarah_03',
      username: 'sarah_infra',
      name: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isFollowed: false,
    },
    type: 'TEXT',
    text: 'Key architectural takeaway from Section 5: With 50M posts/day and average sizes of 100KB for text, 0.5MB for images, and 20MB for videos, direct S3 uploads via pre-signed URLs are mandatory to prevent API Gateway bandwidth exhaustion.',
    hashtags: ['#cloudarchitecture', '#s3', '#presignedurls'],
    likesCount: 890,
    commentsCount: 1,
    isLiked: true,
    comments: [
      {
        id: 'c_03',
        postId: 'post_02',
        userId: 'usr_alex_02',
        author: {
          id: 'usr_alex_02',
          username: 'alex_distrib',
          name: 'Alex Rivera',
          isFollowed: true,
        },
        text: '100% agreement. Bypassing application servers for 216 TB/day media write workloads is essential.',
        createdAt: '30m ago',
      },
    ],
    createdAt: '1h ago',
  },
  {
    id: 'post_03',
    userId: 'usr_elena_05',
    author: {
      id: 'usr_elena_05',
      username: 'elena_ux',
      name: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isFollowed: true,
    },
    type: 'IMAGE',
    description: 'Astryx dark mode design tokens with neutral palette. The contrast ratios on data visuals look razor-sharp!',
    mediaUrls: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    ],
    hashtags: ['#astryxdesign', '#darkmode', '#uidesign'],
    likesCount: 2310,
    commentsCount: 0,
    isLiked: false,
    comments: [],
    createdAt: '2h ago',
  },
  {
    id: 'post_04',
    userId: 'usr_david_04',
    author: {
      id: 'usr_david_04',
      username: 'david_nosql',
      name: 'David Kim',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isFollowed: true,
    },
    type: 'VIDEO',
    description: 'Benchmarking NoSQL document stores under 2.5 billion daily interaction spikes. Watch query breakdown video.',
    mediaUrls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ],
    hashtags: ['#nosql', '#benchmark', '#bigdata'],
    likesCount: 3105,
    commentsCount: 0,
    isLiked: true,
    comments: [],
    createdAt: '4h ago',
  },
  {
    id: 'post_05',
    userId: 'usr_alex_02',
    author: {
      id: 'usr_alex_02',
      username: 'alex_distrib',
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      isFollowed: true,
    },
    type: 'IMAGE',
    description: 'Sub-2-second latency verified across feed fan-out pipeline.',
    mediaUrls: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    ],
    hashtags: ['#monitoring', '#sla', '#performance'],
    likesCount: 940,
    commentsCount: 0,
    isLiked: false,
    comments: [],
    createdAt: '6h ago',
  },
];
