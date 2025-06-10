"use client"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { MapPin, Calendar, Clock, Users, Award, CheckCircle } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useJobs } from "../contexts/JobContext"

const JobCard = ({ job, showApply = true, showApplications = false }) => {
  const { currentUser, isSeeker } = useAuth()
  const { getJobApplications, applyForJob } = useJobs()
  const [hasApplied, setHasApplied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applicantCount, setApplicantCount] = useState(job.applicants || 0)

  // Check if user has applied for this job and get latest applicant count
  useEffect(() => {
    const fetchData = async () => {
      if (!job || !currentUser) return

      try {
        const token = localStorage.getItem("token")
        if (!token) return

        // Always update the applicant count for the latest data
        const jobResponse = await fetch(`https://worker-backend-7fyo.onrender.com/jobs/${job.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (jobResponse.ok) {
          const updatedJob = await jobResponse.json()
          setApplicantCount(updatedJob.applicants || 0)
        }

        // Check if seeker has applied - use seeker applications endpoint for better reliability
        if (isSeeker && currentUser) {
          try {
            const applicationsResponse = await fetch("https://worker-backend-7fyo.onrender.com/applications/seeker", {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (applicationsResponse.ok) {
              const userApplications = await applicationsResponse.json()
              // Check if user has applied for this specific job
              const hasAppliedForJob = userApplications.some((app) => app.jobId === job.id)
              setHasApplied(hasAppliedForJob)
              console.log(`User has applied for job ${job.id}:`, hasAppliedForJob)
            }
          } catch (error) {
            console.error("Error checking application status:", error)
            // Fallback: check job-specific applications
            try {
              const applications = await getJobApplications(job.id)
              const hasAppliedForJob = applications.some((app) => app.seekerId === currentUser.id)
              setHasApplied(hasAppliedForJob)
            } catch (fallbackError) {
              console.error("Fallback application check failed:", fallbackError)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching job data:", error)
      }
    }

    fetchData()
  }, [isSeeker, currentUser, job, getJobApplications])

  const handleApply = async (e) => {
    e.preventDefault()
    if (loading || hasApplied) return

    setLoading(true)
    try {
      const result = await applyForJob(job.id)
      if (result) {
        // Immediately update the state to prevent duplicate applications
        setHasApplied(true)
        setApplicantCount((prev) => prev + 1)
        alert("Application submitted successfully!")
      } else {
        // If application failed because user already applied
        setHasApplied(true)
        alert("You have already applied for this job.")
      }
    } catch (error) {
      console.error("Error applying for job:", error)
      // Check if error is due to duplicate application
      if (error.response && error.response.status === 400) {
        setHasApplied(true)
        alert("You have already applied for this job.")
      } else {
        alert("Failed to apply for job. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (!job) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
            {job.matchScore && (
              <div className="mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {job.matchScore.toFixed(0)}% Match
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end space-y-2">
            {/* Consolidated Status Badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                job.status === "open" && (job.jobStatus === "OPEN" || !job.jobStatus)
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : job.status === "assigned"
                    ? "bg-yellow-100 text-yellow-800"
                    : job.status === "completed"
                      ? "bg-gray-100 text-gray-800"
                      : job.jobStatus === "CLOSED"
                        ? "bg-red-100 text-red-800 border border-red-300"
                        : "bg-blue-100 text-blue-800"
              }`}
            >
              {job.status === "open" && (job.jobStatus === "OPEN" || !job.jobStatus)
                ? "Open"
                : job.status === "assigned"
                  ? "Candidate Selected"
                  : job.status === "completed"
                    ? "Completed"
                    : job.jobStatus === "CLOSED"
                      ? "Closed"
                      : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{job.description}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-2 text-emerald-600" />
            <span>{job.location}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2 text-emerald-600" />
            <span>{formatDate(job.createdAt)}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Clock size={16} className="mr-2 text-emerald-600" />
            <span>{job.duration}</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Users size={16} className="mr-2 text-emerald-600" />
            <span>{applicantCount} applicant(s)</span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award size={16} className="mr-2 text-emerald-600" />
              <span className="font-medium text-gray-700">
                {job.payment} {job.wageType && `(${job.wageType})`}
              </span>
            </div>
            {job.negotiable && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Negotiable</span>
            )}
          </div>
        </div>

        {/* Selected Candidate Indicator */}
        {job.status === "assigned" && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg flex items-center">
            <CheckCircle size={16} className="mr-2 text-yellow-600" />
            <span className="text-yellow-800 text-sm font-medium">A candidate has been selected for this job</span>
          </div>
        )}

        {/* Preferences */}
        {(job.preferredExperience || job.preferredAge || job.preferredGender !== "any") && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Preferences:</div>
            <div className="flex flex-wrap gap-2 text-xs">
              {job.preferredExperience && (
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                  {job.preferredExperience}+ years exp
                </span>
              )}
              {job.preferredAge && (
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Age: {job.preferredAge}</span>
              )}
              {job.preferredGender && job.preferredGender !== "any" && (
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                  {job.preferredGender.charAt(0).toUpperCase() + job.preferredGender.slice(1)}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">Required Skills:</div>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills &&
              job.requiredSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                  {skill}
                </span>
              ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white mr-2">
              {job.providerName && job.providerName.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium">{job.providerName}</div>
            </div>
          </div>

          <div className="flex space-x-2">
            {showApplications && (
              <Link
                to={`/provider/applications/${job.id}`}
                className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-md text-sm font-medium hover:bg-emerald-200 transition-colors"
              >
                View Applications ({applicantCount})
              </Link>
            )}

            <Link
              to={`/job/${job.id}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Details
            </Link>

            {isSeeker && showApply && job.status === "open" && (job.jobStatus === "OPEN" || !job.jobStatus) && (
              <button
                onClick={handleApply}
                disabled={hasApplied || loading || job.status !== "open"}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  hasApplied || loading || job.status !== "open"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed border border-gray-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {loading ? "Applying..." : hasApplied ? "Already Applied" : "Apply"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobCard
