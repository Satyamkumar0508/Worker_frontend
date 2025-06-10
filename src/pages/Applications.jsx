"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Filter, CheckCircle } from "lucide-react"
import { useJobs } from "../contexts/JobContext"
import ApplicationCard from "../components/ApplicationCard"

const Applications = () => {
  const { jobId } = useParams()
  const { getJobApplications, getJobById } = useJobs()
  const [applications, setApplications] = useState([])
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedApplicant, setSelectedApplicant] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch job details
        const jobData = await getJobById(jobId)
        if (!jobData) {
          console.error("Job not found or error fetching job data")
          setLoading(false)
          return
        }

        setJob(jobData)

        // Check if job already has a selected applicant
        if (jobData && jobData.status === "assigned") {
          setSelectedApplicant(jobData.assignedTo)
        }

        // Fetch applications
        const applicationsData = await getJobApplications(jobId)
        setApplications(applicationsData || [])
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [jobId, getJobApplications, getJobById])

  // Handle selection complete
  const handleSelectionComplete = async (applicationId, jobId) => {
    // Refresh job and applications data to show updated status
    try {
      const updatedJob = await getJobById(jobId)
      setJob(updatedJob)

      if (updatedJob && updatedJob.status === "assigned") {
        setSelectedApplicant(updatedJob.assignedTo)
      }

      const updatedApplications = await getJobApplications(jobId)
      setApplications(updatedApplications)
    } catch (error) {
      console.error("Error refreshing data after selection:", error)
    }
  }

  // Filter applications based on status
  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "all") return true
    return app.status === statusFilter
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Job not found</h3>
        <Link to="/provider/dashboard" className="text-emerald-600 hover:text-emerald-800">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/provider/dashboard" className="text-emerald-600 hover:text-emerald-800 flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h1>
            <p className="text-gray-600 mb-4">{job.description}</p>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">Location: {job.location}</div>
              <div className="text-sm text-gray-500">Payment: {job.payment}</div>
              <div className="text-sm text-gray-500">Duration: {job.duration}</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                job.status === "open"
                  ? "bg-green-100 text-green-800"
                  : job.status === "assigned"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </div>
            {job.status === "assigned" && (
              <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <CheckCircle size={14} className="mr-1" />
                Candidate Selected
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center">
          <Filter size={20} className="text-gray-500 mr-2" />
          <span className="text-gray-700 font-medium mr-4">Filter by status:</span>
          <div className="flex space-x-2">
            {["all", "pending", "selected", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md text-sm ${
                  statusFilter === status ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {job.status === "assigned" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle size={20} className="text-emerald-600 mr-2" />
            <span className="text-emerald-800 font-medium">
              A candidate has been selected for this job. Other applications are now marked as "Not Selected".
            </span>
          </div>
        </div>
      )}

      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No applications found</h3>
          <p className="text-gray-500">
            {statusFilter === "all"
              ? "There are no applications for this job yet."
              : `There are no ${statusFilter} applications for this job.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              job={job}
              onSelectionComplete={handleSelectionComplete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Applications
