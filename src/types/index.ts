export type Role = "reader" | "admin"

export interface User {
  id: number
  email: string
  full_name: string
  phone?: string
  role: Role
  created_at: string
}

export interface Category {
  id: number
  slug: string
  name_ru: string
  name_uz: string
}

export type PublicationType = "newspaper" | "magazine"

export interface Publication {
  id: number
  slug: string
  title_ru: string
  title_uz: string
  description_ru: string
  description_uz: string
  cover_url: string
  category_id: number
  category?: Category
  type: PublicationType
  price_per_month: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Issue {
  id: number
  publication_id: number
  issue_number: number
  title_ru?: string
  title_uz?: string
  published_at: string
  pdf_url: string
  cover_url?: string
  created_at: string
}

export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled"

export interface Subscription {
  id: number
  user_id: number
  publication_id: number
  publication?: Publication
  period_months: number
  start_date: string
  end_date: string
  status: SubscriptionStatus
  total_amount: number
  created_at: string
}

export interface Payment {
  id: number
  subscription_id: number
  amount: number
  card_last4: string
  status: "success" | "failed"
  paid_at: string
}

export interface AdminStats {
  users_count: number
  active_subscriptions: number
  monthly_revenue: number
  issues_count: number
}
