import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface State<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export function useFetch<T>(path: string | null, deps: unknown[] = []): State<T> & { refetch: () => void } {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: path !== null })
  const [bump, setBump] = useState(0)

  useEffect(() => {
    if (!path) {
      setState({ data: null, error: null, loading: false })
      return
    }
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    api
      .get<T>(path)
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ data: null, error: err.message, loading: false })
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, bump, ...deps])

  return { ...state, refetch: () => setBump((b) => b + 1) }
}
