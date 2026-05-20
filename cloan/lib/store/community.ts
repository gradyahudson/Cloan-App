import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FeedPost {
  id: string;
  type: "loan_paid_off" | "milestone" | "savings_goal" | "payoff_anniversary" | "crew_win";
  emoji: string;
  message: string;
  timestamp: string;
  isOwn: boolean;
  likes: number;
  liked: boolean;
}

export interface CrewMember {
  id: string;
  displayName: string;
  avatarEmoji: string;
  streakDays: number;
  totalXP: number;
  isYou: boolean;
}

export interface Crew {
  id: string;
  name: string;
  emoji: string;
  members: CrewMember[];
  challenge?: {
    description: string;
    targetCents: number;
    currentCents: number;
    endsAt: string;
  };
  createdAt: string;
}

// Seeded demo posts for the feed
const DEMO_POSTS: FeedPost[] = [
  { id: "d1", type: "loan_paid_off", emoji: "🎉", message: "Someone just paid off their first loan — $8,400 gone!", timestamp: "2 hours ago", isOwn: false, likes: 24, liked: false },
  { id: "d2", type: "milestone", emoji: "🔥", message: "A Cloan user hit a 30-day streak. Monthly Momentum unlocked!", timestamp: "5 hours ago", isOwn: false, likes: 18, liked: false },
  { id: "d3", type: "savings_goal", emoji: "🛡️", message: "Someone completed their emergency fund. Sleep easier tonight.", timestamp: "Yesterday", isOwn: false, likes: 31, liked: false },
  { id: "d4", type: "loan_paid_off", emoji: "👑", message: "A teacher just paid off $67,200 in student debt after 4 years.", timestamp: "2 days ago", isOwn: false, likes: 142, liked: false },
  { id: "d5", type: "crew_win", emoji: "⚡", message: "A Cloan Crew of 5 paid off $3,200 together this month!", timestamp: "3 days ago", isOwn: false, likes: 55, liked: false },
  { id: "d6", type: "milestone", emoji: "🌳", message: "Someone reached Tree level — 4,000 XP earned!", timestamp: "4 days ago", isOwn: false, likes: 12, liked: false },
  { id: "d7", type: "payoff_anniversary", emoji: "🎂", message: "1 year of using Cloan — $4,800 in extra payments made.", timestamp: "5 days ago", isOwn: false, likes: 47, liked: false },
  { id: "d8", type: "loan_paid_off", emoji: "🏁", message: "Someone hit the halfway mark — 50% of their original balance paid off!", timestamp: "1 week ago", isOwn: false, likes: 38, liked: false },
];

interface CommunityState {
  feedPosts: FeedPost[];
  crew: Crew | null;
  shareToFeed: boolean;

  initFeed: () => void;
  postToFeed: (post: Omit<FeedPost, "id" | "timestamp" | "likes" | "liked" | "isOwn">) => void;
  toggleLike: (postId: string) => void;
  setShareToFeed: (value: boolean) => void;
  createCrew: (name: string, emoji: string) => void;
  joinCrew: (crewId: string) => void;
  leaveCrew: () => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      feedPosts: DEMO_POSTS,
      crew: null,
      shareToFeed: true,

      initFeed: () => {
        if (get().feedPosts.length === 0) {
          set({ feedPosts: DEMO_POSTS });
        }
      },

      postToFeed: (post) =>
        set((state) => ({
          feedPosts: [
            {
              ...post,
              id: `post_${Date.now()}`,
              timestamp: "Just now",
              likes: 0,
              liked: false,
              isOwn: true,
            },
            ...state.feedPosts,
          ],
        })),

      toggleLike: (postId) =>
        set((state) => ({
          feedPosts: state.feedPosts.map((p) =>
            p.id === postId
              ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
              : p
          ),
        })),

      setShareToFeed: (value) => set({ shareToFeed: value }),

      createCrew: (name, emoji) =>
        set({
          crew: {
            id: `crew_${Date.now()}`,
            name,
            emoji,
            members: [
              {
                id: "me",
                displayName: "You",
                avatarEmoji: "🌱",
                streakDays: 0,
                totalXP: 0,
                isYou: true,
              },
            ],
            createdAt: new Date().toISOString(),
          },
        }),

      joinCrew: (crewId) => {
        // In production this would fetch from API
        set({
          crew: {
            id: crewId,
            name: "Debt Destroyers",
            emoji: "⚡",
            members: [
              { id: "me", displayName: "You", avatarEmoji: "🌱", streakDays: 3, totalXP: 120, isYou: true },
              { id: "m2", displayName: "Alex R.", avatarEmoji: "🌿", streakDays: 14, totalXP: 890, isYou: false },
              { id: "m3", displayName: "Jordan T.", avatarEmoji: "🌳", streakDays: 7, totalXP: 540, isYou: false },
            ],
            challenge: {
              description: "Pay off $500 combined this month",
              targetCents: 50000,
              currentCents: 23400,
              endsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
            },
            createdAt: new Date().toISOString(),
          },
        });
      },

      leaveCrew: () => set({ crew: null }),
    }),
    {
      name: "cloan-community",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
