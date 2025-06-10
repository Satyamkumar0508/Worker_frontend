"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useJobs } from "../contexts/JobContext"
import axios from "axios"

const Profile = () => {
  const { currentUser, isProvider, isSeeker, updateProfile } = useAuth()
  const { getProviderJobs, getSeekerApplications } = useJobs()

  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false)

  // Predefined list of available skills
  const availableSkills = [
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

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    workingCity: "",
    pincode: "",
    permanentAddress: "",
    presentAddress: "",
    bio: "",
    skills: "",
    selectedSkills: [],
    gender: "",
    age: "",
    yearsOfExperience: "",
  })
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Initialize form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      // Convert skills array to proper format for multi-select
      const userSkills = currentUser.skills || []
      const selectedSkills = userSkills.map((skill) => {
        // Find matching skill from availableSkills (case-insensitive)
        const matchedSkill = availableSkills.find(
          (availableSkill) => availableSkill.toLowerCase() === skill.toLowerCase(),
        )
        return matchedSkill || skill // Use matched skill or original if no match
      })

      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        workingCity: currentUser.workingCity || "",
        pincode: currentUser.pincode || "",
        permanentAddress: currentUser.permanentAddress || "",
        presentAddress: currentUser.presentAddress || "",
        bio: currentUser.bio || "",
        skills: currentUser.skills ? currentUser.skills.join(", ") : "",
        selectedSkills: selectedSkills, // Add this new field
        gender: currentUser.gender || "",
        age: currentUser.age || "",
        yearsOfExperience: currentUser.yearsOfExperience || "",
      })
    }
  }, [currentUser])

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const selectedSkills =
        prev.selectedSkills && prev.selectedSkills.includes(skill)
          ? prev.selectedSkills.filter((s) => s !== skill)
          : [...(prev.selectedSkills || []), skill]

      return {
        ...prev,
        selectedSkills,
        skills: selectedSkills.join(", "), // Keep the old skills field for compatibility
      }
    })
  }

  const handleSkillRemove = (skillToRemove) => {
    setFormData((prev) => {
      const selectedSkills = (prev.selectedSkills || []).filter((skill) => skill !== skillToRemove)
      return {
        ...prev,
        selectedSkills,
        skills: selectedSkills.join(", "),
      }
    })
  }

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillsDropdownOpen && !event.target.closest(".relative")) {
        setSkillsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [skillsDropdownOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error("Name is required")
      }
      if (!formData.phone.trim()) {
        throw new Error("Phone number is required")
      }
      if (!formData.workingCity.trim()) {
        throw new Error("Working city is required")
      }
      if (!formData.pincode.trim()) {
        throw new Error("Pincode is required")
      }
      if (!formData.presentAddress.trim()) {
        throw new Error("Present address is required")
      }
      if (!formData.bio.trim()) {
        throw new Error("Bio is required")
      }

      // Process the form data
      const userData = {
        name: formData.name.trim(),
        email: currentUser.email, // Keep original email (read-only)
        phone: formData.phone.trim(),
        workingCity: formData.workingCity.trim(),
        pincode: formData.pincode.trim(),
        permanentAddress: currentUser.permanentAddress, // Keep original permanent address (read-only)
        presentAddress: formData.presentAddress.trim(),
        bio: formData.bio.trim(),
        gender: formData.gender || currentUser.gender,
        age: Number.parseInt(formData.age) || currentUser.age,
        yearsOfExperience: Number.parseInt(formData.yearsOfExperience) || currentUser.yearsOfExperience,
        userType: currentUser.userType, // Keep original user type
        rating: currentUser.rating, // Keep original rating
        skills: isSeeker ? (formData.selectedSkills || []).map((skill) => skill.toLowerCase()) : currentUser.skills,
      }

      console.log("🔄 Updating profile with data:", userData)

      const updatedUser = await updateProfile(userData)
      console.log("✅ Profile updated successfully:", updatedUser)

      setIsEditing(false)
      setSuccessMessage("Profile updated successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("❌ Profile update error:", error)
      setError(error.message || "Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Stats state
  const [stats, setStats] = useState({
    providerJobs: [],
    applications: [],
    completedJobs: 0,
    openJobs: 0,
    assignedJobs: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
  })

  // Function to fetch job applications count for all jobs
  const fetchApplicationsCount = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return 0

      const response = await axios.get("http://localhost:8000/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.length || 0
    } catch (error) {
      console.error("Error fetching applications count:", error)
      return 0
    }
  }

  // Load stats when component mounts
  useEffect(() => {
    const loadStats = async () => {
      if (!currentUser) return

      setStatsLoading(true)
      console.log("📊 Loading stats for user:", currentUser.email, "Type:", currentUser.userType)

      try {
        if (isProvider) {
          try {
            // Fetch provider's jobs directly from the API
            const token = localStorage.getItem("token")
            if (!token) {
              console.error("No token found")
              setStatsLoading(false)
              return
            }

            console.log("📊 Fetching provider jobs from API...")
            const response = await axios.get("http://localhost:8000/jobs/provider", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            const providerJobs = response.data
            console.log("📊 Provider jobs fetched:", providerJobs)

            if (Array.isArray(providerJobs)) {
              // Debug job status values
              console.log(
                "📊 Job status values:",
                providerJobs.map((job) => ({
                  id: job.id,
                  status: job.status,
                  jobStatus: job.jobStatus,
                })),
              )

              // Calculate job status counts
              const completedJobs = providerJobs.filter((job) => {
                const status = job.status || job.jobStatus
                return status === "completed" || status === "COMPLETED" || status === "Completed"
              }).length

              // Fix for open jobs count
              const openJobs = providerJobs.filter((job) => {
                // Check all possible status field names and values
                const status = job.status || job.jobStatus
                return status === "open" || status === "OPEN" || status === "Open"
              }).length

              console.log("📊 Open jobs count:", openJobs)

              const assignedJobs = providerJobs.filter((job) => {
                const status = job.status || job.jobStatus
                return status === "assigned" || status === "ASSIGNED" || status === "Assigned"
              }).length

              // Calculate total applications across all jobs
              let totalApplications = 0
              for (const job of providerJobs) {
                totalApplications += job.applicants || 0
              }

              console.log("📊 Provider stats calculated:", {
                totalJobs: providerJobs.length,
                completedJobs,
                openJobs,
                assignedJobs,
                totalApplications,
              })

              setStats((prev) => ({
                ...prev,
                providerJobs,
                completedJobs,
                openJobs,
                assignedJobs,
                totalApplications,
              }))
            } else {
              console.error("❌ Provider jobs is not an array:", providerJobs)
              setStats((prev) => ({
                ...prev,
                providerJobs: [],
                completedJobs: 0,
                openJobs: 0,
                assignedJobs: 0,
                totalApplications: 0,
              }))
            }
          } catch (error) {
            console.error("❌ Error loading provider stats:", error)
          }
        }

        if (isSeeker) {
          try {
            const applications = await getSeekerApplications()
            console.log("📊 Seeker applications fetched:", applications)

            if (Array.isArray(applications)) {
              const acceptedApplications = applications.filter(
                (app) => app.status === "selected" || app.status === "accepted" || app.status === "SELECTED",
              ).length

              const pendingApplications = applications.filter(
                (app) => app.status === "pending" || app.status === "PENDING",
              ).length

              setStats((prev) => ({
                ...prev,
                applications,
                acceptedApplications,
                pendingApplications,
              }))
            } else {
              console.error("❌ Seeker applications is not an array:", applications)
              setStats((prev) => ({
                ...prev,
                applications: [],
                acceptedApplications: 0,
                pendingApplications: 0,
              }))
            }
          } catch (error) {
            console.error("❌ Error loading seeker stats:", error)
          }
        }
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setStatsLoading(false)
      }
    }

    if (currentUser) {
      loadStats()
    }
  }, [isProvider, isSeeker, currentUser, getSeekerApplications])

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-32 bg-emerald-600"></div>
        <div className="px-6 py-4 md:px-8 md:py-6">
          <div className="flex flex-col md:flex-row md:items-end -mt-16 mb-4">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center text-emerald-800 text-4xl font-bold">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="mt-4 md:mt-0 md:ml-6 md:mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{currentUser.name}</h1>
              <p className="text-gray-600">{currentUser.userType === "provider" ? "Job Provider" : "Job Seeker"}</p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-auto">
              <button
                onClick={() => {
                  setIsEditing(!isEditing)
                  setError("")
                  setSuccessMessage("")
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-gray-500 text-xs">(Read-only)</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="workingCity" className="block text-sm font-medium text-gray-700 mb-1">
                    Working City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="workingCity"
                    name="workingCity"
                    type="text"
                    value={formData.workingCity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {isSeeker && (
                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <input
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      type="number"
                      min="0"
                      max="50"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Permanent Address <span className="text-gray-500 text-xs">(Read-only)</span>
                </label>
                <textarea
                  id="permanentAddress"
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  disabled
                  readOnly
                />
              </div>

              <div>
                <label htmlFor="presentAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Present Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="presentAddress"
                  name="presentAddress"
                  value={formData.presentAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Tell us about yourself..."
                  required
                />
              </div>

              {isSeeker && (
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <div className="relative">
                    <div
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer bg-white min-h-[42px] flex flex-wrap items-center gap-2"
                      onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
                    >
                      {formData.selectedSkills && formData.selectedSkills.length > 0 ? (
                        formData.selectedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSkillRemove(skill)
                              }}
                              className="ml-1 text-emerald-600 hover:text-emerald-800"
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">Select your skills...</span>
                      )}
                      <svg
                        className={`ml-auto h-5 w-5 text-gray-400 transition-transform ${
                          skillsDropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {skillsDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {availableSkills.map((skill) => (
                          <div
                            key={skill}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                              formData.selectedSkills && formData.selectedSkills.includes(skill)
                                ? "bg-emerald-50 text-emerald-700"
                                : ""
                            }`}
                            onClick={() => handleSkillToggle(skill)}
                          >
                            <span>{skill}</span>
                            {formData.selectedSkills && formData.selectedSkills.includes(skill) && (
                              <svg className="h-4 w-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select multiple skills that match your expertise</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setError("")
                    setSuccessMessage("")
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-2">About</h2>
                  <p className="text-gray-600">{currentUser.bio || "No bio available"}</p>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p className="capitalize">{currentUser.gender || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Age</p>
                      <p>{currentUser.age ? `${currentUser.age} years` : "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Working City</p>
                      <p>{currentUser.workingCity || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pincode</p>
                      <p>{currentUser.pincode || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Address Information</h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Permanent Address</p>
                      <p className="text-gray-700">{currentUser.permanentAddress || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Present Address</p>
                      <p className="text-gray-700">{currentUser.presentAddress || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {isSeeker && (
                  <>
                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-2">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.skills && currentUser.skills.length > 0 ? (
                          currentUser.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500">No skills specified</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-800 mb-2">Experience</h2>
                      <p className="text-gray-600">
                        {currentUser.yearsOfExperience
                          ? `${currentUser.yearsOfExperience} years of experience`
                          : "Experience not specified"}
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-2">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{currentUser.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{currentUser.phone || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p>{new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-lg font-medium text-gray-800 mb-3">Stats</h2>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <span className="ml-2 text-gray-600">Loading stats...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isSeeker && (
                      <div>
                        <p className="text-sm text-gray-500">Rating</p>
                        <div className="flex items-center">
                          <div className="flex">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <span key={i} className="text-yellow-400">
                                  {i < Math.floor(currentUser.rating || 0) ? "★" : "☆"}
                                </span>
                              ))}
                          </div>
                          <span className="ml-2">{(currentUser.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    )}

                    {isProvider && (
                      <>
                        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                          <p className="text-sm text-gray-500">Total Jobs Posted</p>
                          <p className="font-medium text-2xl text-gray-800">{stats.providerJobs?.length || 0}</p>
                        </div>

                        <div className="bg-white p-3 rounded-md shadow-sm border border-green-200">
                          <p className="text-sm text-gray-500">Open Jobs</p>
                          <p className="font-medium text-2xl text-green-600">{stats.openJobs || 0}</p>
                        </div>

                        <div className="bg-white p-3 rounded-md shadow-sm border border-yellow-200">
                          <p className="text-sm text-gray-500">Assigned Jobs</p>
                          <p className="font-medium text-2xl text-yellow-600">{stats.assignedJobs || 0}</p>
                        </div>

                        <div className="bg-white p-3 rounded-md shadow-sm border border-blue-200">
                          <p className="text-sm text-gray-500">Completed Jobs</p>
                          <p className="font-medium text-2xl text-blue-600">{stats.completedJobs || 0}</p>
                        </div>

                        <div className="bg-white p-3 rounded-md shadow-sm border border-purple-200">
                          <p className="text-sm text-gray-500">Total Applications</p>
                          <p className="font-medium text-2xl text-purple-600">{stats.totalApplications || 0}</p>
                        </div>
                      </>
                    )}

                    {isSeeker && (
                      <>
                        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
                          <p className="text-sm text-gray-500">Total Applications</p>
                          <p className="font-medium text-2xl">{stats.applications?.length || 0}</p>
                        </div>

                        <div className="bg-white p-3 rounded-md shadow-sm border border-green-200">
                          <p className="text-sm text-gray-500">Accepted Applications</p>
                          <p className="font-medium text-2xl text-green-600">{stats.acceptedApplications || 0}</p>
                        </div>

                        <div className="bg-white p-3 rounded-md shadow-sm border border-yellow-200">
                          <p className="text-sm text-gray-500">Pending Applications</p>
                          <p className="font-medium text-2xl text-yellow-600">{stats.pendingApplications || 0}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
