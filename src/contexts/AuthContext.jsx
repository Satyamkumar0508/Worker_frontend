/* eslint-disable no-unused-vars */
"use client"

import { createContext, useState, useContext, useEffect } from "react"
import axios from "axios"

// Use local backend URL for development
const API_URL = "https://worker-backend-7fyo.onrender.com" // Local backend URL

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)

  // Configure axios defaults
  axios.defaults.baseURL = API_URL
  axios.defaults.timeout = 10000 // 10 second timeout

  // Add request interceptor for debugging
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        console.log("🚀 Making request to:", `${API_URL}${config.url}`, "with data:", config.data)
        return config
      },
      (error) => {
        console.error("❌ Request error:", error)
        return Promise.reject(error)
      },
    )

    return () => {
      axios.interceptors.request.eject(requestInterceptor)
    }
  }, [])

  // Add response interceptor for handling 401 errors and debugging
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        console.log("✅ Response received:", response.status, response.data)
        return response
      },
      (error) => {
        console.error("❌ Response error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url,
        })
        if (error.response && error.response.status === 401) {
          console.log("🔒 Session expired. Logging out...")
          logout()
        }
        return Promise.reject(error)
      },
    )

    return () => {
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [])

  // Add token to requests if available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      console.log("🔑 Token set in headers")
    } else {
      delete axios.defaults.headers.common["Authorization"]
      console.log("🔑 Token removed from headers")
    }
  }, [token])

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("currentUser")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setCurrentUser(JSON.parse(storedUser))

      // Verify token is still valid by fetching user profile
      axios
        .get("/users/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        })
        .catch(() => {
          // If token is invalid, log out
          logout()
        })
    }

    setLoading(false)
  }, [])

  // Test API connectivity
  const testConnection = async () => {
    try {
      console.log("🔍 Testing API connection to:", API_URL)
      const response = await axios.get("/test")
      console.log("✅ API connection test successful:", response.data)
      return true
    } catch (error) {
      console.error("❌ API connection test failed:", error.message)
      return false
    }
  }

  // Check database status
  const checkDatabaseStatus = async () => {
    try {
      console.log("🔍 Checking database status...")
      const response = await axios.get("/db-status")
      console.log("✅ Database status:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Database status check failed:", error.message)
      return null
    }
  }

  const login = async (email) => {
    try {
      console.log("🔐 Initiating login for:", email)
      const response = await axios.post("/send-otp", { email })
      console.log("✅ OTP sent successfully:", response.data)

      return true
    } catch (error) {
      console.error("❌ Login initiation error:", error)

      // Better error handling
      if (error.response?.status === 404) {
        throw new Error("User not found. Please register first.")
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      } else {
        throw new Error("Failed to send OTP. Please check if the backend server is running.")
      }
    }
  }

  // Development helper to get OTP (only for development)
  const getDevOTP = async (email) => {
    try {
      const response = await axios.get(`/dev/get-otp/${email}`)
      return response.data
    } catch (error) {
      console.error("Failed to get dev OTP:", error)
      return null
    }
  }

  const register = async (userData) => {
    try {
      console.log("📝 Starting registration process for:", userData.email)

      // Test connection first
      const connectionOk = await testConnection()
      if (!connectionOk) {
        throw new Error("Cannot connect to server. Please check if the backend is running on http://localhost:8000")
      }

      // Remove password from userData if it exists
      const { password, ...userDataWithoutPassword } = userData

      console.log("📤 Sending registration data:", userDataWithoutPassword)

      // Register the user without password
      const response = await axios.post("/register", userDataWithoutPassword)
      console.log("✅ Registration response:", response.data)

      // After registration, send OTP for login
      try {
        console.log("📧 Sending OTP after registration...")
        await axios.post("/send-otp", { email: userData.email })

        // Store user type in localStorage for redirect after OTP login
        localStorage.setItem("pendingUserType", userData.userType)

        return response.data
      } catch (otpError) {
        console.error("❌ Failed to send OTP after registration:", otpError)
        // Even if OTP fails, registration was successful
        return response.data
      }
    } catch (error) {
      console.error("❌ Registration error:", error)

      // Format error message to avoid rendering objects directly
      if (error.response?.data?.detail) {
        const errorDetail = error.response.data.detail
        if (typeof errorDetail === "object") {
          throw new Error("Registration failed. Please check your information and try again.")
        } else {
          throw new Error(errorDetail)
        }
      } else if (error.message) {
        throw new Error(error.message)
      } else {
        throw new Error("Registration failed. Please check if the backend server is running and try again.")
      }
    }
  }

  const loginWithOTP = async (email, otp) => {
    try {
      console.log("🔐 Verifying OTP for:", email)
      const response = await axios.post("/verify-otp", { email, otp })
      const { access_token } = response.data

      // Set the token in axios and state
      setToken(access_token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`

      // Get user profile
      const userResponse = await axios.get("/users/me")
      const userData = userResponse.data

      setCurrentUser(userData)
      localStorage.setItem("token", access_token)
      localStorage.setItem("currentUser", JSON.stringify(userData))

      console.log("✅ Login successful for:", email)
      return userData
    } catch (error) {
      console.error("❌ OTP verification error:", error)
      return null
    }
  }

  const logout = () => {
    console.log("🚪 Logging out user")
    setCurrentUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("currentUser")
    localStorage.removeItem("pendingUserType")
  }

  const updateProfile = async (userData) => {
    try {
      console.log("🔄 Sending profile update request:", userData)

      const response = await axios.put("/users/me", userData)
      const updatedUser = response.data

      console.log("✅ Profile update response:", updatedUser)

      // Update both state and localStorage
      setCurrentUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      return updatedUser
    } catch (error) {
      console.error("❌ Update profile error:", error)

      // Provide more specific error messages
      if (error.response?.status === 400) {
        throw new Error("Invalid profile data. Please check your information.")
      } else if (error.response?.status === 401) {
        throw new Error("Session expired. Please log in again.")
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      } else {
        throw new Error("Failed to update profile. Please try again.")
      }
    }
  }

  const value = {
    currentUser,
    login,
    loginWithOTP,
    register,
    logout,
    updateProfile,
    testConnection,
    checkDatabaseStatus,
    getDevOTP,
    isProvider: currentUser?.userType === "provider",
    isSeeker: currentUser?.userType === "seeker",
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
