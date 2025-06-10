"use client"

import { createContext, useState, useContext, useCallback } from "react"
import { useAuth } from "./AuthContext"
import axios from "axios"
import { useNotifications } from "./NotificationContext"

const JobContext = createContext()

export const useJobs = () => useContext(JobContext)

export const JobProvider = ({ children }) => {
  const { currentUser } = useAuth()
  const { refreshNotifications } = useNotifications()
  const [loading, setLoading] = useState(false)

  const getJobs = useCallback(async (filters = {}) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return []
      }

      // Build query string from filters
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })

      console.log("Fetching jobs with filters:", filters)
      const response = await axios.get(`https://worker-backend-7fyo.onrender.com/jobs?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Jobs fetched successfully:", response.data)
      return response.data.jobs || response.data
    } catch (error) {
      console.error("Error fetching jobs:", error)
      if (error.response) {
        console.error("Response error:", error.response.data)
      }
      return []
    }
  }, [])

  // Fix the getJobById function to properly handle errors and always set loading to false
  const getJobById = useCallback(async (jobId) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("No token found")
        return null
      }

      console.log(`Fetching job details for ID: ${jobId}`)
      const response = await axios.get(`https://worker-backend-7fyo.onrender.com/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Job details fetched successfully:", response.data)
      return response.data
    } catch (error) {
      console.error(`Error fetching job ${jobId}:`, error)
      if (error.response) {
        console.error("Response error:", error.response.data)
        console.error("Response status:", error.response.status)
      }
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const getProviderJobs = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return []

      console.log("Fetching provider jobs...")
      const response = await axios.get("https://worker-backend-7fyo.onrender.com/jobs/provider", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Provider jobs fetched:", response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching provider jobs:", error)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Fix the getJobApplications function to properly handle errors
  const getJobApplications = useCallback(async (jobId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        return []
      }

      console.log(`Fetching applications for job: ${jobId}`)
      const response = await axios.get(`https://worker-backend-7fyo.onrender.com/applications/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Job applications fetched:", response.data)
      return response.data
    } catch (error) {
      console.error(`Error fetching applications for job ${jobId}:`, error)
      return []
    }
  }, [])

  const getSeekerApplications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return []

      console.log("Fetching seeker applications...")
      const response = await axios.get("https://worker-backend-7fyo.onrender.com/applications/seeker", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Seeker applications fetched:", response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching seeker applications:", error)
      return []
    }
  }, [])

  const applyForJob = useCallback(
    async (jobId) => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) return false

        console.log(`Applying for job: ${jobId}`)

        // First check if user has already applied
        const existingApplications = await axios.get("https://worker-backend-7fyo.onrender.com/applications/seeker", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const hasAlreadyApplied = existingApplications.data.some((app) => app.jobId === jobId)
        if (hasAlreadyApplied) {
          console.log("User has already applied for this job")
          return false
        }

        const response = await axios.post(
          "https://worker-backend-7fyo.onrender.com/applications",
          {
            jobId,
            seekerId: currentUser.id,
            seekerName: currentUser.name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        console.log("Application submitted successfully:", response.data)

        // Refresh notifications to show any new notifications for the provider
        setTimeout(() => {
          refreshNotifications()
        }, 1000)

        return response.data
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // Already applied
          console.log("Application rejected - user already applied")
          return false
        }
        console.error(`Error applying for job ${jobId}:`, error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [currentUser, refreshNotifications],
  )

  const createJob = useCallback(async (jobData) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) return null

      console.log("Creating job:", jobData)
      const response = await axios.post("https://worker-backend-7fyo.onrender.com/jobs", jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log("Job created successfully:", response.data)
      return response.data
    } catch (error) {
      console.error("Error creating job:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const selectApplicant = useCallback(
    async (applicationId) => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) return null

        console.log(`Selecting applicant with ID: ${applicationId}`)

        const response = await axios.put(
          `https://worker-backend-7fyo.onrender.com/applications/${applicationId}/select`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        console.log("Selection response:", response.data)

        // Refresh notifications to show any new notifications
        setTimeout(() => {
          refreshNotifications()
        }, 1000)

        return response.data
      } catch (error) {
        console.error(`Error selecting applicant ${applicationId}:`, error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [refreshNotifications],
  )

  const completeJob = useCallback(
    async (jobId, rating, feedback) => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) return null

        console.log(`Completing job: ${jobId}`)
        const response = await axios.put(
          `https://worker-backend-7fyo.onrender.com/jobs/${jobId}/complete`,
          { rating, feedback },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        console.log("Job completion response:", response.data)

        // Refresh notifications to show any new notifications
        setTimeout(() => {
          refreshNotifications()
        }, 1000)

        return response.data
      } catch (error) {
        console.error(`Error completing job ${jobId}:`, error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [refreshNotifications],
  )

  const value = {
    loading,
    getJobs,
    getJobById,
    getJobApplications,
    getProviderJobs,
    getSeekerApplications,
    applyForJob,
    createJob,
    postJob: createJob,
    selectApplicant,
    completeJob,
  }

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>
}
