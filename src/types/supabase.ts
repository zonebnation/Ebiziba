export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          title: string
          description: string
          cover_url: string
          author: string
          language: string
          digital_price: number
          physical_price: number
          content_url: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          cover_url: string
          author: string
          language: string
          digital_price: number
          physical_price: number
          content_url: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          cover_url?: string
          author?: string
          language?: string
          digital_price?: number
          physical_price?: number
          content_url?: string
          created_at?: string
        }
      }
      user_books: {
        Row: {
          user_id: string
          book_id: string
          purchased_at: string
        }
        Insert: {
          user_id: string
          book_id: string
          purchased_at?: string
        }
        Update: {
          user_id?: string
          book_id?: string
          purchased_at?: string
        }
      }
      book_access_logs: {
        Row: {
          id: string
          user_id: string
          book_id: string
          accessed_at: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          accessed_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          accessed_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
  }
}
