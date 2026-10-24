import type { CreatorDashboardData, TimeRange } from '../types/analytics'

export const getCreatorAnalytics = (timeRange: TimeRange): CreatorDashboardData => {
  switch (timeRange) {
    case '24h':
      return {
        timeRange: '24h',
        summary: {
          totalFollowers: 148290,
          followerGrowth: '+420 today',
          followerGrowthPositive: true,
          totalLikes: 34820,
          totalUnlikes: 1240,
          likeRatio: '96.6% positive',
          totalComments: 8940,
          totalEngagements: 43760,
          engagementRate: '4.8%',
        },
        followersHistory: [
          { timestamp: '00:00', date: '12 AM', followers: 147870, netChange: 15 },
          { timestamp: '04:00', date: '4 AM', followers: 147920, netChange: 50 },
          { timestamp: '08:00', date: '8 AM', followers: 148010, netChange: 90 },
          { timestamp: '12:00', date: '12 PM', followers: 148150, netChange: 140 },
          { timestamp: '16:00', date: '4 PM', followers: 148230, netChange: 80 },
          { timestamp: '20:00', date: '8 PM', followers: 148290, netChange: 60 },
        ],
        likeUnlikeComparison: [
          { label: 'Post #1 (Video)', date: 'Post 1', likes: 14200, unlikes: 410 },
          { label: 'Post #2 (Image)', date: 'Post 2', likes: 11400, unlikes: 380 },
          { label: 'Post #3 (Text)', date: 'Post 3', likes: 9220, unlikes: 450 },
        ],
        engagementHistory: [
          { timestamp: '00:00', label: '12 AM', comments: 720, engagements: 3500, rate: 3.2 },
          { timestamp: '04:00', label: '4 AM', comments: 450, engagements: 2100, rate: 2.1 },
          { timestamp: '08:00', label: '8 AM', comments: 1680, engagements: 8400, rate: 4.6 },
          { timestamp: '12:00', label: '12 PM', comments: 2450, engagements: 12800, rate: 5.9 },
          { timestamp: '16:00', label: '4 PM', comments: 2140, engagements: 10200, rate: 5.1 },
          { timestamp: '20:00', label: '8 PM', comments: 1500, engagements: 6760, rate: 4.2 },
        ],
        topPosts: [
          { id: 'p-1', title: 'Deep dive into distributed fan-out architecture', type: 'Video', likes: 14200, unlikes: 410, comments: 4120, postedAt: 'Today 10:15 AM' },
          { id: 'p-2', title: 'Infographic: 500M DAU capacity estimation model', type: 'Image', likes: 11400, unlikes: 380, comments: 2890, postedAt: 'Today 2:30 PM' },
          { id: 'p-3', title: 'Eventual consistency in social feed pipelines', type: 'Text', likes: 9220, unlikes: 450, comments: 1930, postedAt: 'Yesterday 6:00 PM' },
        ],
      }

    case '7d':
      return {
        timeRange: '7d',
        summary: {
          totalFollowers: 148290,
          followerGrowth: '+3,840 this week',
          followerGrowthPositive: true,
          totalLikes: 215400,
          totalUnlikes: 9120,
          likeRatio: '95.9% positive',
          totalComments: 62400,
          totalEngagements: 277800,
          engagementRate: '5.2%',
        },
        followersHistory: [
          { timestamp: 'Mon', date: 'Mon', followers: 144450, netChange: 480 },
          { timestamp: 'Tue', date: 'Tue', followers: 145020, netChange: 570 },
          { timestamp: 'Wed', date: 'Wed', followers: 145690, netChange: 670 },
          { timestamp: 'Thu', date: 'Thu', followers: 146240, netChange: 550 },
          { timestamp: 'Fri', date: 'Fri', followers: 146950, netChange: 710 },
          { timestamp: 'Sat', date: 'Sat', followers: 147610, netChange: 660 },
          { timestamp: 'Sun', date: 'Sun', followers: 148290, netChange: 680 },
        ],
        likeUnlikeComparison: [
          { label: 'Mon', date: 'Mon', likes: 28400, unlikes: 1200 },
          { label: 'Tue', date: 'Tue', likes: 31200, unlikes: 1350 },
          { label: 'Wed', date: 'Wed', likes: 35900, unlikes: 1420 },
          { label: 'Thu', date: 'Thu', likes: 29800, unlikes: 1190 },
          { label: 'Fri', date: 'Fri', likes: 38400, unlikes: 1580 },
          { label: 'Sat', date: 'Sat', likes: 27100, unlikes: 1180 },
          { label: 'Sun', date: 'Sun', likes: 24600, unlikes: 1200 },
        ],
        engagementHistory: [
          { timestamp: 'Mon', label: 'Mon', comments: 8200, engagements: 36600, rate: 4.8 },
          { timestamp: 'Tue', label: 'Tue', comments: 8900, engagements: 40100, rate: 5.1 },
          { timestamp: 'Wed', label: 'Wed', comments: 10400, engagements: 46300, rate: 5.8 },
          { timestamp: 'Thu', label: 'Thu', comments: 8600, engagements: 38400, rate: 4.9 },
          { timestamp: 'Fri', label: 'Fri', comments: 11200, engagements: 49600, rate: 6.2 },
          { timestamp: 'Sat', label: 'Sat', comments: 7800, engagements: 34900, rate: 4.5 },
          { timestamp: 'Sun', label: 'Sun', comments: 7300, engagements: 31900, rate: 4.3 },
        ],
        topPosts: [
          { id: 'p-1', title: 'Deep dive into distributed fan-out architecture', type: 'Video', likes: 48200, unlikes: 1820, comments: 14200, postedAt: '3 days ago' },
          { id: 'p-2', title: 'Infographic: 500M DAU capacity estimation model', type: 'Image', likes: 38600, unlikes: 1250, comments: 9400, postedAt: '5 days ago' },
          { id: 'p-3', title: 'Microservices architecture vs Monolith latency tradeoffs', type: 'Text', likes: 29400, unlikes: 1490, comments: 6800, postedAt: '6 days ago' },
        ],
      }

    case '30d':
    default:
      return {
        timeRange: '30d',
        summary: {
          totalFollowers: 148290,
          followerGrowth: '+16,420 this month',
          followerGrowthPositive: true,
          totalLikes: 894000,
          totalUnlikes: 38200,
          likeRatio: '95.9% positive',
          totalComments: 268000,
          totalEngagements: 1162000,
          engagementRate: '5.4%',
        },
        followersHistory: [
          { timestamp: 'Week 1', date: 'W1', followers: 131870, netChange: 3820 },
          { timestamp: 'Week 2', date: 'W2', followers: 136420, netChange: 4550 },
          { timestamp: 'Week 3', date: 'W3', followers: 141950, netChange: 5530 },
          { timestamp: 'Week 4', date: 'W4', followers: 148290, netChange: 6340 },
        ],
        likeUnlikeComparison: [
          { label: 'Week 1', date: 'W1', likes: 198000, unlikes: 8900 },
          { label: 'Week 2', date: 'W2', likes: 215000, unlikes: 9200 },
          { label: 'Week 3', date: 'W3', likes: 236000, unlikes: 9800 },
          { label: 'Week 4', date: 'W4', likes: 245000, unlikes: 10300 },
        ],
        engagementHistory: [
          { timestamp: 'Week 1', label: 'W1', comments: 58000, engagements: 256000, rate: 5.1 },
          { timestamp: 'Week 2', label: 'W2', comments: 64000, engagements: 279000, rate: 5.3 },
          { timestamp: 'Week 3', label: 'W3', comments: 72000, engagements: 308000, rate: 5.7 },
          { timestamp: 'Week 4', label: 'W4', comments: 74000, engagements: 319000, rate: 5.5 },
        ],
        topPosts: [
          { id: 'p-1', title: 'Deep dive into distributed fan-out architecture', type: 'Video', likes: 124000, unlikes: 4200, comments: 38900, postedAt: 'Oct 12' },
          { id: 'p-2', title: 'Infographic: 500M DAU capacity estimation model', type: 'Image', likes: 98000, unlikes: 3600, comments: 24500, postedAt: 'Oct 18' },
          { id: 'p-3', title: 'Why we picked NoSQL for high-throughput reactions', type: 'Text', likes: 78500, unlikes: 4100, comments: 19800, postedAt: 'Oct 05' },
        ],
      }
  }
}
