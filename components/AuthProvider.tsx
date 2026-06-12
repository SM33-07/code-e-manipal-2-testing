"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"

import { createClient } from "@/lib/supabase/client"

interface AuthContextType {
  user: any | null
  role: string
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {

  const supabase = createClient()

  const [user,setUser] = useState<any | null>(null)
  const [role,setRole] = useState("participant")
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    const getSession = async()=>{

      const {data} = await supabase.auth.getSession()

      const u = data.session?.user ?? null

      setUser(u)
      setRole(u?.user_metadata?.role || "participant")
      setLoading(false)
    }

    getSession()

    const {data:listener} = supabase.auth.onAuthStateChange(
      (_event,session)=>{

        const u = session?.user ?? null

        setUser(u)
        setRole(u?.user_metadata?.role || "participant")
      }
    )

    return ()=>listener.subscription.unsubscribe()

  },[])

  const login = async(email:string,password:string)=>{

    const {data,error} = await supabase.auth.signInWithPassword({
      email,password
    })

    if(error) throw new Error(error.message)

    setUser(data.user)
    setRole(data.user?.user_metadata?.role || "participant")

    return data
  }

  const logout = async()=>{
    await supabase.auth.signOut()
    setUser(null)
    setRole("participant")
  }

  return(
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        logout,
        isAuthenticated:!!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){

  const context = useContext(AuthContext)

  if(!context){
    throw new Error("useAuth must be used within AuthProvider")
  }

  return context
}
