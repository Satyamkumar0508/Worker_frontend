"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { MapPin, Calendar, Clock, Users, Award, ArrowLeft, Phone, Mail, LocateIcon as LocationIcon } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useJobs } from "../contexts/JobContext"

const JobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, isProvider, isSeeker } = useAuth()
  const { getJobById, getJobApplications, getSeekerApplications, applyForJob, completeJob } = useJobs()

  // State management
  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [myApplication, setMyApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState("")
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  // Use ref to prevent multiple simultaneous calls
  const fetchingRef = useRef(false)

  // Fetch job details and related data
  useEffect(() => {
    const fetchJobData = async () => {
      // Prevent multiple simultaneous calls
      if (fetchingRef.current) return
      fetchingRef.current = true

      try {
        setLoading(true)
        setError(null)

        if (!id) {
          setError("Job ID is missing")
          return
        }

        console.log("Fetching job details for ID:", id)

        // Fetch job details
        const jobData = await getJobById(id)
        if (!jobData) {
          setError("Job not found or you don't have permission to view it")
          return
        }

        console.log("Job data fetched:", jobData)
        setJob(jobData)

        // Fetch applications if user is a provider and owns this job
        if (isProvider && currentUser && jobData.providerId === currentUser.id) {
          try {
            const jobApplications = await getJobApplications(id)
            setApplications(jobApplications || [])
            console.log("Job applications fetched:", jobApplications)
          } catch (appError) {
            console.error("Error fetching job applications:", appError)
            setApplications([])
          }
        }

        // Check if seeker has applied for this job
        if (isSeeker && currentUser) {
          try {
            const seekerApplications = await getSeekerApplications()
            const userApplication = seekerApplications.find((app) => app.jobId === id)
            setMyApplication(userApplication || null)
            console.log("User application status:", userApplication)
          } catch (appError) {
            console.error("Error fetching seeker applications:", appError)
            setMyApplication(null)
          }
        }
      } catch (err) {
        console.error("Error fetching job data:", err)
        setError("Failed to load job details. Please try again.")
      } finally {
        setLoading(false)
        fetchingRef.current = false
      }
    }

    // Only fetch if we have the required data
    if (id && currentUser) {
      fetchJobData()
    }

    // Cleanup function
    return () => {
      fetchingRef.current = false
    }
  }, [id, currentUser, isProvider, isSeeker]) // Only depend on stable values

  const selectedApplication = applications.find((app) => app.status === "selected")
  const isJobOwner = isProvider && currentUser && job && job.providerId === currentUser.id
  const isAssignedSeeker = isSeeker && currentUser && job && job.assignedTo === currentUser.id
  const canComplete = (isJobOwner || isAssignedSeeker) && job && job.status === "assigned"
  const canViewContact = isJobOwner || (isAssignedSeeker && job && job.status === "assigned")

  const handleApply = async () => {
    if (!job || myApplication) return

    try {
      const result = await applyForJob(job.id)
      if (result) {
        // Refresh applications data
        const seekerApplications = await getSeekerApplications()
        const userApplication = seekerApplications.find((app) => app.jobId === id)
        setMyApplication(userApplication || null)

        // Update job applicant count
        setJob((prev) => ({
          ...prev,
          applicants: (prev.applicants || 0) + 1,
        }))

        alert("Application submitted successfully!")
      } else {
        alert("You have already applied for this job.")
      }
    } catch (error) {
      console.error("Error applying for job:", error)
      alert("Failed to apply for job. Please try again.")
    }
  }

  const handleComplete = async (e) => {
    e.preventDefault()
    if (!job) return

    try {
      const result = await completeJob(job.id, rating, feedback)
      if (result) {
        setShowFeedbackForm(false)
        // Refresh job data
        const updatedJob = await getJobById(job.id)
        setJob(updatedJob)
        alert("Job marked as completed and feedback submitted!")
      }
    } catch (error) {
      console.error("Error completing job:", error)
      alert("Failed to complete job. Please try again.")
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mt-4">Loading job details...</h3>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center text-emerald-600 hover:text-emerald-800">
            <ArrowLeft size={18} className="mr-2" />
            Back
          </button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Job Not Found"}</h2>
          <p className="text-gray-600 mb-6">
            {error || "The job you're looking for doesn't exist or has been removed."}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-emerald-600 hover:text-emerald-800">
          <ArrowLeft size={18} className="mr-2" />
          Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                job.status === "open"
                  ? "bg-green-100 text-green-800"
                  : job.status === "assigned"
                    ? "bg-blue-100 text-blue-800"
                    : job.status === "completed"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Job Details</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-3 text-emerald-600" />
                  <span>{job.location}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Calendar size={18} className="mr-3 text-emerald-600" />
                  <span>Posted on {formatDate(job.createdAt)}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock size={18} className="mr-3 text-emerald-600" />
                  <span>Duration: {job.duration}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Award size={18} className="mr-3 text-emerald-600" />
                  <span>Payment: {job.payment}</span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Users size={18} className="mr-3 text-emerald-600" />
                  <span>{job.applicants || 0} applicant(s)</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
              <p className="text-gray-600 mb-4">{job.description}</p>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mt-4 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* Job Preferences */}
              {(job.preferredExperience ||
                job.preferredAge ||
                (job.preferredGender && job.preferredGender !== "any")) && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mt-4 mb-3">Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredExperience && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {job.preferredExperience}+ years experience
                      </span>
                    )}
                    {job.preferredAge && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        Age: {job.preferredAge}
                      </span>
                    )}
                    {job.preferredGender && job.preferredGender !== "any" && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        {job.preferredGender.charAt(0).toUpperCase() + job.preferredGender.slice(1)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Application Status for Seekers */}
          {isSeeker && myApplication && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Your Application Status</h3>
              <div className="flex items-center">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    myApplication.status === "selected"
                      ? "bg-green-100 text-green-800"
                      : myApplication.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {myApplication.status === "selected"
                    ? "Congratulations! You were selected for this job"
                    : myApplication.status === "rejected"
                      ? "Your application was not selected"
                      : "Your application is under review"}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Applied on {formatDate(myApplication.appliedAt)}</p>
            </div>
          )}

          {/* Contact Information for Selected Candidates */}
          {canViewContact && selectedApplication && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                {isJobOwner ? "Selected Candidate Contact" : "Job Provider Contact"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Users size={16} className="mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">
                        {isJobOwner
                          ? selectedApplication?.seekerProfile?.name ||
                            selectedApplication?.seekerName ||
                            "Name not available"
                          : job.providerName || "Provider name not available"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Mail size={16} className="mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">
                        {isJobOwner
                          ? selectedApplication?.seekerProfile?.email || "Email not available"
                          : job.providerEmail || `${job.providerId}@village.com`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone size={16} className="mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">
                        {isJobOwner
                          ? selectedApplication?.seekerProfile?.phone || "Phone not available"
                          : "Contact through platform"}
                      </p>
                    </div>
                  </div>

                  {isJobOwner && selectedApplication?.seekerProfile?.workingCity && (
                    <div className="flex items-center">
                      <LocationIcon size={16} className="mr-2 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{selectedApplication.seekerProfile.workingCity}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Job Completion Status */}
          {job.status === "completed" && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Job Completion</h3>
              <p className="text-gray-600">
                This job was completed on {formatDate(job.completedAt || new Date().toISOString())}.
              </p>
              {job.rating && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Rating: </span>
                  <span className="font-medium">{job.rating}/5 stars</span>
                </div>
              )}
              {job.feedback && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Feedback: </span>
                  <span className="text-gray-700">{job.feedback}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white mr-3">
                  {job.providerName ? job.providerName.charAt(0) : "P"}
                </div>
                <div>
                  <div className="font-medium">{job.providerName || "Provider"}</div>
                  <div className="text-sm text-gray-500">Job Provider</div>
                </div>
              </div>

              <div className="flex space-x-3">
                {isJobOwner && job.status === "open" && (
                  <Link
                    to={`/provider/applications/${job.id}`}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    View Applications ({job.applicants || 0})
                  </Link>
                )}

                {isSeeker && job.status === "open" && !myApplication && (
                  <button
                    onClick={handleApply}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    Apply Now
                  </button>
                )}

                {canComplete && !showFeedbackForm && (
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Complete Job & Provide Feedback</h3>
              <form onSubmit={handleComplete} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl focus:outline-none hover:text-yellow-500 transition-colors"
                      >
                        {star <= rating ? "★" : "☆"}
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{rating} out of 5</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    Complete & Submit
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobDetails
