export type TimeRange = '24h' | '7d' | '30d'

export interface FollowerPoint {
  timestamp: string
  date: string
  followers: number
  netChange: number
}

export interface LikeUnlikePoint {
  label: string
  date: string
  likes: number
  unlikes: number
}

export interface EngagementPoint {
  timestamp: string
  label: string
  comments: number
  engagements: number
  rate: number
}

export interface KPISummary {
  totalFollowers: number
  followerGrowth: string
  followerGrowthPositive: boolean
  totalLikes: number
  totalUnlikes: number
  likeRatio: string
  totalComments: number
  totalEngagements: number
  engagementRate: string
}

export interface TopPostMetric extends Record<string, unknown> {
  id: string
  title: string
  type: 'Text' | 'Image' | 'Video'
  likes: number
  unlikes: number
  comments: number
  postedAt: string
}

export interface CreatorDashboardData {
  timeRange: TimeRange
  summary: KPISummary
  followersHistory: FollowerPoint[]
  likeUnlikeComparison: LikeUnlikePoint[]
  engagementHistory: EngagementPoint[]
  topPosts: TopPostMetric[]
}
