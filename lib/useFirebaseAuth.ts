import { useState, useEffect } from "react"
import { type User, signInWithEmailAndPassword, type AuthError } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting sign-in with:", email); // Add detailed logging
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign-in successful:", userCredential.user);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Detailed sign-in error:", error);
      // More granular error handling
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  return { user, loading, signIn }
}

