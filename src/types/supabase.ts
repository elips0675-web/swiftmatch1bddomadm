export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      matches: {
        Row: MatchRow
        Insert: MatchInsert
      }
      chats: {
        Row: ChatRow
        Insert: ChatInsert
      }
      chat_participants: {
        Row: ChatParticipantRow
        Insert: ChatParticipantInsert
      }
      messages: {
        Row: MessageRow
        Insert: MessageInsert
      }
      notifications: {
        Row: NotificationRow
        Insert: NotificationInsert
      }
      interests: {
        Row: InterestRow
      }
      profile_interests: {
        Row: ProfileInterestRow
        Insert: ProfileInterestInsert
      }
      likes: {
        Row: LikeRow
        Insert: LikeInsert
      }
      reports: {
        Row: ReportRow
        Insert: ReportInsert
      }
    }
    Views: {
      user_search: {
        Row: UserSearchRow
      }
    }
    Functions: {
      calculate_match_score: {
        Args: { profile_id: number; target_id: number }
        Returns: number
      }
      get_nearby_users: {
        Args: { lat: number; lng: number; radius_km: number }
        Returns: ProfileRow[]
      }
    }
  }
}

export interface ProfileRow {
  id: string
  created_at: string
  updated_at: string
  name: string
  age: number
  bio: string | null
  avatar_url: string | null
  photos: string[]
  gender: string | null
  looking_for: string | null
  goal: string | null
  height: number | null
  city: string | null
  lat: number | null
  lng: number | null
  zodiac: string | null
  circadian: string | null
  attachment_style: string | null
  super_likes: number
  boost_until: string | null
  online: boolean
  last_seen: string
}

export interface ProfileInsert {
  id: string
  name: string
  age: number
  bio?: string
  avatar_url?: string
  photos?: string[]
  gender?: string
  looking_for?: string
  goal?: string
  height?: number
  city?: string
  lat?: number
  lng?: number
  zodiac?: string
  circadian?: string
  attachment_style?: string
  super_likes?: number
  boost_until?: string
}

export interface ProfileUpdate {
  name?: string
  age?: number
  bio?: string
  avatar_url?: string
  photos?: string[]
  gender?: string
  looking_for?: string
  goal?: string
  height?: number
  city?: string
  lat?: number
  lng?: number
  zodiac?: string
  circadian?: string
  attachment_style?: string
  super_likes?: number
  boost_until?: string
  online?: boolean
  last_seen?: string
}

export interface MatchRow {
  id: string
  created_at: string
  user1_id: string
  user2_id: string
  matched: boolean
}

export interface MatchInsert {
  user1_id: string
  user2_id: string
  matched?: boolean
}

export interface ChatRow {
  id: string
  created_at: string
  updated_at: string
  last_message: string | null
  last_sender_id: string | null
}

export interface ChatInsert {
  id?: string
}

export interface ChatParticipantRow {
  chat_id: string
  profile_id: string
  joined_at: string
}

export interface ChatParticipantInsert {
  chat_id: string
  profile_id: string
}

export interface MessageRow {
  id: string
  created_at: string
  chat_id: string
  sender_id: string
  text: string
  reply_to: string | null
}

export interface MessageInsert {
  chat_id: string
  sender_id: string
  text: string
  reply_to?: string
}

export interface NotificationRow {
  id: string
  created_at: string
  profile_id: string
  type: string
  payload: Record<string, unknown>
  read: boolean
}

export interface NotificationInsert {
  profile_id: string
  type: string
  payload?: Record<string, unknown>
  read?: boolean
}

export interface InterestRow {
  id: number
  name_ru: string
  name_en: string
  category: string
}

export interface ProfileInterestRow {
  profile_id: string
  interest_id: number
}

export interface ProfileInterestInsert {
  profile_id: string
  interest_id: number
}

export interface LikeRow {
  id: string
  created_at: string
  from_profile_id: string
  to_profile_id: string
  type: 'like' | 'super_like'
}

export interface LikeInsert {
  from_profile_id: string
  to_profile_id: string
  type: 'like' | 'super_like'
}

export interface ReportRow {
  id: string
  created_at: string
  reporter_id: string
  reported_id: string
  reason: string
  description: string | null
  status: 'pending' | 'resolved' | 'dismissed'
}

export interface ReportInsert {
  reporter_id: string
  reported_id: string
  reason: string
  description?: string
}

export interface UserSearchRow {
  id: string
  name: string
  age: number
  avatar_url: string | null
  bio: string | null
  city: string | null
  goal: string | null
  zodiac: string | null
  interests: string[]
  match_score: number
  distance_km: number
}
