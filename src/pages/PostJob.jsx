"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useJobs } from "../contexts/JobContext"
import { useLanguage } from "../contexts/LanguageContext"
import { DollarSign, Clock, Users, Briefcase, FileText } from "lucide-react"
import LocationSelector from "../components/LocationSelector"

const PostJob = () => {
  const navigate = useNavigate()
  const { createJob } = useJobs()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    state: "",
    district: "",
    pincode: "",
    payment: "",
    duration: "",
    wageType: "daily",
    negotiable: false,
    preferredExperience: "",
    preferredAge: "",
    preferredGender: "any",
  })

  // Predefined job titles matching the skills from registration
  const jobTitles = [
    "Farming Labour",
    "Construction Labour",
    "Mason",
    "Carpenter",
    "Electrician",
    "Gardener",
    "Domestic Cook",
    "Driver",
    "Plumber",
    "Security Guard",
  ]

  const ageRanges = ["18-25", "26-35", "36-45", "46-55", "55+"]

  const experienceOptions = [
    { value: "", label: t("noPreference") },
    { value: "0", label: t("noExperience") },
    { value: "1", label: "1 " + t("year") },
    { value: "2", label: "2 " + t("years") },
    { value: "3", label: "3 " + t("years") },
    { value: "5", label: "5+ " + t("years") },
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleLocationSelect = (locationData) => {
    setFormData((prev) => ({
      ...prev,
      state: locationData.state,
      district: locationData.district,
      pincode: locationData.pincode,
      // For backward compatibility, set the location field as well
      location: `${locationData.district}, ${locationData.state} - ${locationData.pincode}`,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Convert preferredExperience to number if it's not empty
      const jobData = {
        ...formData,
        preferredExperience: formData.preferredExperience ? Number.parseInt(formData.preferredExperience) : null,
        // Set category based on job title for backward compatibility
        category: formData.title,
        // Set required skills based on job title
        requiredSkills: [formData.title.toLowerCase()],
      }

      console.log("Submitting job data:", jobData)
      await createJob(jobData)
      alert(t("jobPostedSuccessfully"))
      navigate("/provider")
    } catch (error) {
      console.error("Error posting job:", error)

      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        console.error("Server error:", error.response.data)
        alert(`${t("failedToPostJob")}: ${error.response.data.message || error.response.statusText}`)
      } else if (error.request) {
        // Request was made but no response received
        console.error("Network error:", error.request)
        alert(`${t("failedToPostJob")}: Network error. Please check your connection.`)
      } else {
        // Something else happened
        console.error("Error:", error.message)
        alert(`${t("failedToPostJob")}: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const isLocationSelected = formData.state && formData.district && formData.pincode

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("postNewJob")}</h1>
            <p className="text-gray-600">{t("fillJobDetails")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="inline w-4 h-4 mr-1" />
                {t("jobTitle")} *
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">{t("selectJobTitle") || "Select Job Title"}</option>
                {jobTitles.map((title) => (
                  <option key={title} value={title}>
                    {title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the job title that best matches the work you need done
              </p>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                {t("jobDescription")} *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t("describeJobRequirements")}
                required
              />
            </div>

            {/* Location Selector */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Job Location</h3>
              <LocationSelector onLocationSelect={handleLocationSelect} />

              {/* Location validation message */}
              {!isLocationSelected && (
                <p className="mt-2 text-amber-600 text-sm">
                  Please select a complete location (state, district, and pincode)
                </p>
              )}
            </div>

            {/* Payment and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  {t("payment")} (₹) *
                </label>
                <input
                  type="number"
                  name="payment"
                  value={formData.payment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={t("enterAmount")}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  {t("wageType")} *
                </label>
                <select
                  name="wageType"
                  value={formData.wageType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="daily">{t("daily")}</option>
                  <option value="weekly">{t("weekly")}</option>
                  <option value="monthly">{t("monthly")}</option>
                  <option value="total">{t("total")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  {t("duration")} *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={t("enterDuration")}
                  required
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  {t("preferredExperience")}
                </label>
                <select
                  name="preferredExperience"
                  value={formData.preferredExperience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {experienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  {t("preferredAge")}
                </label>
                <select
                  name="preferredAge"
                  value={formData.preferredAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{t("noPreference")}</option>
                  {ageRanges.map((range) => (
                    <option key={range} value={range}>
                      {range} {t("years")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  {t("preferredGender")}
                </label>
                <select
                  name="preferredGender"
                  value={formData.preferredGender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="any">{t("any")}</option>
                  <option value="male">{t("male")}</option>
                  <option value="female">{t("female")}</option>
                </select>
              </div>
            </div>

            {/* Negotiable */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="negotiable"
                checked={formData.negotiable}
                onChange={handleInputChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">{t("negotiable")}</label>
            </div>

            {/* Location Summary */}
            {isLocationSelected && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h4 className="text-sm font-medium text-emerald-800 mb-2">Job Location Summary:</h4>
                <p className="text-emerald-700">
                  {formData.district}, {formData.state} - {formData.pincode}
                </p>
                <p className="text-xs text-emerald-600 mt-1">
                  Workers in this area will be able to find your job posting
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/provider")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={loading || !isLocationSelected}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {loading ? t("posting") : t("postJob")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostJob
