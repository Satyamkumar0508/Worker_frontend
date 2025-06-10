"use client"

import { useState } from "react"
import { Star, ThumbsUp, CheckCircle, AlertCircle, User, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { useJobs } from "../contexts/JobContext"
import { useLanguage } from "../contexts/LanguageContext"

const ApplicationCard = ({ application, job, onSelectionComplete }) => {
  const { currentUser } = useAuth()
  const { selectApplicant } = useJobs()
  const { t } = useLanguage()
  const [showContact, setShowContact] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectionSuccess, setSelectionSuccess] = useState(false)

  const isSelected = application.status === "selected"
  const isRejected = job.status === "assigned" && application.status !== "selected"
  const isCompleted = job.status === "completed"

  const handleSelect = async () => {
    if (loading) return

    if (window.confirm(`Are you sure you want to select ${application.seekerName} for this job?`)) {
      setLoading(true)
      try {
        await selectApplicant(application.id)
        setSelectionSuccess(true)

        // Call the callback to notify parent component about the selection
        if (onSelectionComplete) {
          onSelectionComplete(application.id, job.id)
        }

        // Show success message
        alert(`${application.seekerName} has been selected for this job successfully!`)
      } catch (error) {
        console.error("Error selecting applicant:", error)
        alert("Failed to select applicant. Please try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
        />
      ))
  }

  // Get seeker profile data with fallbacks
  const seekerProfile = application.seekerProfile || {}
  const seekerEmail = seekerProfile.email || `${application.seekerId}@village.com`
  const seekerPhone = seekerProfile.phone || "Phone not available"
  const seekerAge = seekerProfile.age || "Age not specified"
  const seekerGender = seekerProfile.gender || "Not specified"
  const seekerCity = seekerProfile.workingCity || "Location not specified"
  const seekerExperience = seekerProfile.yearsOfExperience || 0

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden border ${
        isSelected
          ? "border-emerald-500 ring-1 ring-emerald-500"
          : isRejected
            ? "border-gray-300 opacity-75"
            : "border-gray-200"
      }`}
    >
      <div className="p-6">
        {isSelected && (
          <div className="mb-4 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-md flex items-center">
            <CheckCircle size={18} className="mr-2" />
            <span className="font-medium">Selected Candidate</span>
          </div>
        )}

        {isRejected && (
          <div className="mb-4 bg-gray-50 text-gray-500 px-4 py-2 rounded-md flex items-center">
            <AlertCircle size={18} className="mr-2" />
            <span className="font-medium">Not Selected</span>
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl mr-4">
              {application.seekerName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{application.seekerName}</h3>
              <div className="flex items-center mt-1">
                {renderStars(seekerProfile.rating || 0)}
                <span className="ml-2 text-sm text-gray-600">{(seekerProfile.rating || 0).toFixed(1)}</span>
              </div>
              <div className="flex items-center mt-1 text-sm text-gray-500">
                <User size={14} className="mr-1" />
                <span>
                  {seekerAge} years, {seekerGender}
                </span>
                <MapPin size={14} className="ml-3 mr-1" />
                <span>{seekerCity}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2">
            {/* Ranking Score */}
            {application.rankingScore !== undefined && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Rank: {application.rankingScore.toFixed(0)}%
              </div>
            )}

            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isSelected
                  ? "bg-emerald-100 text-emerald-800"
                  : isRejected
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {isSelected ? "Selected" : isRejected ? "Not Selected" : "Pending"}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">{t("skills")}:</div>
          <div className="flex flex-wrap gap-2">
            {(seekerProfile.skills || []).map((skill, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs ${
                  job.requiredSkills.includes(skill) ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">{t("experience")}:</div>
          <div className="text-gray-600 text-sm">
            <div className="flex items-center mb-1">
              <Calendar size={14} className="mr-2" />
              <span>{seekerExperience} years of experience</span>
            </div>
            <p>{seekerProfile.experience || "No additional experience details provided."}</p>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          Applied on {new Date(application.appliedAt).toLocaleDateString()}
        </div>

        {isSelected && (
          <div className="mb-4">
            <button
              onClick={() => setShowContact(!showContact)}
              className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center"
            >
              {showContact ? "Hide Contact Info" : "Show Contact Info"}
            </button>

            {showContact && (
              <div className="mt-3 p-4 bg-gray-50 rounded-md border">
                <h4 className="font-medium text-gray-800 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail size={16} className="mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Email:</span>
                    <span className="text-blue-600">{seekerEmail}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone size={16} className="mr-2 text-gray-500" />
                    <span className="font-medium mr-2">Phone:</span>
                    <span className="text-blue-600">{seekerPhone}</span>
                  </div>
                  {seekerProfile.permanentAddress && (
                    <div className="flex items-start text-sm">
                      <MapPin size={16} className="mr-2 mt-0.5 text-gray-500" />
                      <div>
                        <span className="font-medium">Address:</span>
                        <p className="text-gray-600 mt-1">{seekerProfile.permanentAddress}</p>
                        {seekerProfile.pincode && <p className="text-gray-600">PIN: {seekerProfile.pincode}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentUser.userType === "provider" && job.status === "open" && application.status === "pending" && (
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleSelect}
              disabled={loading || selectionSuccess}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
                loading || selectionSuccess
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              }`}
            >
              <ThumbsUp size={16} className="mr-2" />
              {loading ? "Selecting..." : selectionSuccess ? "Selected" : "Select Applicant"}
            </button>
          </div>
        )}

        {isCompleted && application.feedback && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm font-medium text-gray-700 mb-2">Feedback:</div>
            <div className="flex items-center mb-2">
              {renderStars(application.feedback.rating)}
              <span className="ml-2 text-sm text-gray-600">{application.feedback.rating.toFixed(1)}</span>
            </div>
            <p className="text-gray-600 text-sm">{application.feedback.comment}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationCard
