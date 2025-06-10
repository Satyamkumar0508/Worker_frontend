"use client"

import { useState, useEffect } from "react"
import { Briefcase } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import JobCard from "../components/JobCard"

const JobSeekerDashboard = () => {
  const { currentUser } = useAuth()
  const [viewMode, setViewMode] = useState("available")
  const [searchQuery, setSearchQuery] = useState("")
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("No authentication token found")
          setLoading(false)
          return
        }

        let jobsData = []

        if (viewMode === "available") {
          // For "All Jobs" - use the correct endpoint and filtering
          let url = "https://worker-backend-7fyo.onrender.com/jobs"

          if (searchQuery.trim()) {
            // Use search endpoint with query parameter
            url = `https://worker-backend-7fyo.onrender.com/jobs/search?q=${encodeURIComponent(searchQuery.trim())}`
            console.log("🔍 Searching All Jobs with URL:", url)
          } else {
            // When no search query, get all open jobs
            url = `${url}?status=open`
          }

          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!response.ok) {
            throw new Error(`Jobs API error: ${response.status}`)
          }

          jobsData = await response.json()
          console.log(`🔍 All Jobs results: ${jobsData.length} jobs found`)

          // Ensure we only show open jobs that are actually available
          jobsData = jobsData.filter((job) => {
            const isOpen = job.status === "open"
            const isAvailable = !job.jobStatus || job.jobStatus === "OPEN"
            return isOpen && isAvailable
          })

          console.log(`🔍 Filtered to ${jobsData.length} available jobs`)
        } else if (viewMode === "matching") {
          // For matching jobs, apply search filter after getting matches
          const response = await fetch("https://worker-backend-7fyo.onrender.com/jobs/matching", {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!response.ok) {
            throw new Error(`Matching jobs API error: ${response.status}`)
          }

          jobsData = await response.json()

          // Apply search filter to matching jobs if search query exists
          if (searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase().trim()
            jobsData = jobsData.filter(
              (job) =>
                job.title.toLowerCase().includes(searchTerm) ||
                job.description.toLowerCase().includes(searchTerm) ||
                job.location.toLowerCase().includes(searchTerm) ||
                (job.requiredSkills && job.requiredSkills.some((skill) => skill.toLowerCase().includes(searchTerm))) ||
                job.providerName.toLowerCase().includes(searchTerm),
            )
            console.log("🔍 Filtered matching jobs:", jobsData.length, "jobs found")
          }
        } else {
          // Fetch applications
          const response = await fetch("https://worker-backend-7fyo.onrender.com/applications/seeker", {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!response.ok) {
            throw new Error(`Applications API error: ${response.status}`)
          }

          const applicationsData = await response.json()
          setApplications(applicationsData || [])

          // Get job details for each application
          const jobsResponse = await fetch("https://worker-backend-7fyo.onrender.com/jobs", {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!jobsResponse.ok) {
            throw new Error(`Jobs API error: ${jobsResponse.status}`)
          }

          const availableJobs = await jobsResponse.json()

          // Safely map applications to jobs
          jobsData = (applicationsData || []).map((app) => {
            const job = availableJobs.find((j) => j.id === app.jobId) || {
              id: app.jobId,
              title: "Job no longer available",
              status: "unknown",
              location: "",
              category: "",
              requiredSkills: [],
              applicants: 0,
              providerName: "",
              payment: "",
              duration: "",
              createdAt: new Date().toISOString(),
            }
            return { ...job, applicationStatus: app.status }
          })

          // Apply search filter to applications if search query exists
          if (searchQuery.trim()) {
            const searchTerm = searchQuery.toLowerCase().trim()
            jobsData = jobsData.filter(
              (job) =>
                job.title.toLowerCase().includes(searchTerm) ||
                job.description?.toLowerCase().includes(searchTerm) ||
                job.location?.toLowerCase().includes(searchTerm) ||
                (job.requiredSkills && job.requiredSkills.some((skill) => skill.toLowerCase().includes(searchTerm))) ||
                job.providerName?.toLowerCase().includes(searchTerm),
            )
            console.log("🔍 Filtered applications:", jobsData.length, "jobs found")
          }
        }

        // Ensure jobsData is always an array
        setJobs(Array.isArray(jobsData) ? jobsData : [])
        console.log(
          `✅ Fetched ${Array.isArray(jobsData) ? jobsData.length : 0} jobs for ${viewMode} mode${searchQuery.trim() ? ` with search: "${searchQuery}"` : ""}`,
        )
      } catch (error) {
        console.error("❌ Error fetching data:", error)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [viewMode, searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    // The search will be triggered automatically by useEffect when searchQuery changes
    console.log("🔍 Search triggered for:", searchQuery)
  }

  // Add a function to handle real-time search as user types
  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    // The useEffect will automatically trigger when searchQuery changes
  }

  // Safety check for currentUser
  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Loading user data...</h3>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Find Jobs</h1>
        <p className="text-gray-600">
          Welcome back, {currentUser.name || "User"}! Find the perfect job that matches your skills.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search jobs by title, description, location, skills, or company..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Search Results Indicator */}
        {searchQuery.trim() && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-blue-800 font-medium">🔍 Search results for: "{searchQuery}"</span>
                <span className="ml-2 text-blue-600">
                  ({jobs.length} {jobs.length === 1 ? "job" : "jobs"} found)
                </span>
              </div>
              <button
                onClick={() => setSearchQuery("")}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* View Mode Selection */}
        <div className="flex items-center">
          <Briefcase size={20} className="text-gray-500 mr-2" />
          <span className="text-gray-700 font-medium mr-4">View:</span>
          <div className="flex space-x-2">
            {["available", "matching", "applications"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm ${
                  viewMode === mode ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {mode === "available" ? "All Jobs" : mode === "matching" ? "Matching Jobs" : "My Applications"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Loading jobs...</h3>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No jobs found</h3>
          <p className="text-gray-500">
            {viewMode === "available"
              ? "There are no available jobs matching your search."
              : viewMode === "matching"
                ? "There are no jobs matching your skills at the moment."
                : "You haven't applied to any jobs yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === "matching" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Jobs Ranked by Match Score</h3>
              <p className="text-blue-600 text-sm">
                Jobs are sorted by how well they match your skills, location, and experience.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job, index) => (
              <JobCard key={job.id || index} job={job} showApply={viewMode !== "applications"} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default JobSeekerDashboard
