import { useEffect, useState } from "react"
import type { User } from "@/types"
import { clearAuth, getStoredUser, getToken, setStoredUser, setToken } from "@/lib/auth"

interface AuthState {
  user: User | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => ({
    user: getStoredUser(),
    loading: false,
  }))

  useEffect(() => {
    function onStorage() {
      setState({ user: getStoredUser(), loading: false })
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  function login(token: string, user: User) {
    setToken(token)
    setStoredUser(user)
    setState({ user, loading: false })
  }

  function logout() {
    clearAuth()
    setState({ user: null, loading: false })
  }

  return {
    user: state.user,
    loading: state.loading,
    isAuthenticated: getToken() !== null,
    isAdmin: state.user?.role === "admin",
    login,
    logout,
  }
}
