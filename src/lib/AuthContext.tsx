import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { User } from "@/types"
import { api } from "./api"
import { clearAuth, getStoredUser, getToken, setStoredUser, setToken } from "./auth"

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (token: string, user: User) => void
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser())
  const [loading, setLoading] = useState<boolean>(getToken() !== null && user === null)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await api.get<{ user: User }>("/auth/me")
      setStoredUser(res.user)
      setUser(res.user)
    } catch {
      clearAuth()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (getToken() && !user) {
      void refresh()
    } else {
      setLoading(false)
    }
  }, [refresh, user])

  const login = useCallback((token: string, u: User) => {
    setToken(token)
    setStoredUser(u)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: user !== null,
    isAdmin: user?.role === "admin",
    login,
    logout,
    refresh,
  }), [user, loading, login, logout, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
