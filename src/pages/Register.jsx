"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { AlertCircle, Wifi, WifiOff, Mail, Shield, CheckCircle } from "lucide-react"
import LocationSelector from "../components/LocationSelector"

const Register = () => {
  const { t } = useLanguage()
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)

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

  // Add selectedSkills to formData initial state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    age: "",
    permanentAddress: "",
    presentAddress: "",
    workingState: "",
    workingDistrict: "",
    workingCity: "", // Keep for backward compatibility, will be set to district
    pincode: "",
    phone: "",
    userType: "",
    skills: "",
    selectedSkills: [], // Add this new field
    yearsOfExperience: "",
    bio: "",
    copyAddress: false,
    otp: "", // Add OTP field
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)
  const [backendStatus, setBackendStatus] = useState("checking")
  const { register, testConnection, checkDatabaseStatus } = useAuth()
  const navigate = useNavigate()

  // Experience options
  const experienceOptions = [
    { value: "0", label: t("zeroYears") },
    { value: "1", label: t("lessThanOneYear") },
    { value: "2", label: t("lessThanTwoYears") },
    { value: "3", label: t("lessThanThreeYears") },
    { value: "4", label: t("lessThanFourYears") },
    { value: "5", label: t("fiveOrMoreYears") },
  ]

  // Test connection on component mount
  useEffect(() => {
    const testConnectivity = async () => {
      console.log("🔍 Testing API connectivity...")
      setBackendStatus("checking")

      const isConnected = await testConnection()
      setConnectionStatus(isConnected)
      setBackendStatus(isConnected ? "connected" : "disconnected")

      if (isConnected) {
        const dbStatus = await checkDatabaseStatus()
        console.log("📊 Database status:", dbStatus)
      }
    }

    testConnectivity()
  }, [testConnection, checkDatabaseStatus])

  // OTP countdown timer
  useEffect(() => {
    let timer
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [otpCountdown])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox" && name === "copyAddress") {
      setFormData({
        ...formData,
        [name]: checked,
        presentAddress: checked ? formData.permanentAddress : "",
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const selectedSkills = prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill]

      return {
        ...prev,
        selectedSkills,
        skills: selectedSkills.join(", "), // Keep the old skills field for compatibility
      }
    })
  }

  const handleSkillRemove = (skillToRemove) => {
    setFormData((prev) => {
      const selectedSkills = prev.selectedSkills.filter((skill) => skill !== skillToRemove)
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

  const sendOTP = async () => {
    if (!formData.email) {
      setError("Please enter your email address first")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return
    }

    setOtpLoading(true)
    setError("")

    try {
      const response = await fetch("https://worker-backend-7fyo.onrender.com/register/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setOtpStep(true)
        setOtpCountdown(300) // 5 minutes
        setError("")
      } else {
        setError(data.detail || "Failed to send OTP")
      }
    } catch (error) {
      console.error("OTP send error:", error)
      setError("Failed to send OTP. Please check your connection.")
    }

    setOtpLoading(false)
  }

  const verifyOTPAndProceed = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setError("Please enter the 6-digit OTP")
      return
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(formData.otp)) {
      setError("OTP must be 6 digits")
      return
    }

    // Optional: Verify OTP with backend without consuming it
    try {
      const response = await fetch("https://worker-backend-7fyo.onrender.com/verify-otp-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          verify_only: true, // Flag to indicate we're only verifying, not consuming
        }),
      })

      if (response.ok) {
        setEmailVerified(true)
        setOtpStep(false)
        setError("")
      } else {
        const data = await response.json()
        setError(data.detail || "Invalid OTP. Please try again.")
      }
    } catch (error) {
      // If verification endpoint doesn't exist, proceed anyway
      // The OTP will be verified during registration
      console.log("OTP verification endpoint not available, proceeding to registration form")
      setEmailVerified(true)
      setOtpStep(false)
      setError("")
    }
  }

  const handleLocationSelect = (locationData) => {
    setFormData((prev) => ({
      ...prev,
      workingState: locationData.state,
      workingDistrict: locationData.district,
      workingCity: locationData.district, // Set city to district for compatibility
      pincode: locationData.pincode,
    }))
  }

  const validateForm = () => {
    // Check if email is verified
    if (!emailVerified) {
      setError("Please verify your email address first")
      return false
    }

    // Ensure OTP is still available
    if (!formData.otp || formData.otp.length !== 6) {
      setError("OTP is missing. Please verify your email again.")
      setEmailVerified(false)
      setOtpStep(true)
      return false
    }

    // Age validation
    if (Number.parseInt(formData.age) < 18) {
      setError(t("ageMinimum"))
      return false
    }

    // Phone validation
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(formData.phone)) {
      setError(t("phoneValid"))
      return false
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError(t("validEmail"))
      return false
    }

    // Required fields validation
    const requiredFields = [
      { field: "name", message: t("nameRequired") },
      { field: "email", message: t("emailRequired") },
      { field: "gender", message: "Gender is required" },
      { field: "age", message: t("ageRequired") },
      { field: "permanentAddress", message: t("addressRequired") },
      { field: "workingState", message: "Working state is required" },
      { field: "workingDistrict", message: "Working district is required" },
      { field: "pincode", message: "Pincode is required" },
      { field: "phone", message: t("phoneRequired") },
      { field: "userType", message: "User type is required" },
      { field: "bio", message: t("bioRequired") },
    ]

    if (formData.userType === "seeker") {
      requiredFields.push(
        { field: "selectedSkills", message: t("skillsRequired") },
        { field: "yearsOfExperience", message: t("experienceRequired") },
      )
    }

    for (const { field, message } of requiredFields) {
      if (field === "selectedSkills") {
        if (!formData.selectedSkills || formData.selectedSkills.length === 0) {
          setError(message)
          return false
        }
      } else if (!formData[field] || formData[field].toString().trim() === "") {
        setError(message)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Check connection before submitting
    if (connectionStatus === false) {
      setError("Cannot connect to server. Please make sure the backend is running on https://worker-backend-7fyo.onrender.com")
      return
    }

    setError("")
    setLoading(true)

    try {
      // Process skills if job seeker
      const userData = {
        ...formData,
        age: Number.parseInt(formData.age),
        yearsOfExperience: formData.userType === "seeker" ? Number.parseInt(formData.yearsOfExperience) : 0,
        skills: formData.userType === "seeker" ? formData.selectedSkills.map((skill) => skill.toLowerCase()) : [],
        rating: 0,
      }

      console.log("📤 Submitting registration data:", userData)

      const response = await fetch("https://worker-backend-7fyo.onrender.com/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful, redirect to login
        navigate("/login", {
          state: {
            message:
              "Registration successful! Please check your email for welcome information. You can now login to your account.",
          },
        })
      } else {
        setError(data.detail || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("❌ Registration error:", error)
      setError("Failed to create an account. Please try again later.")
    }

    setLoading(false)
  }

  const getStatusColor = () => {
    switch (backendStatus) {
      case "connected":
        return "bg-green-100 border-green-400 text-green-700"
      case "disconnected":
        return "bg-red-100 border-red-400 text-red-700"
      case "checking":
        return "bg-yellow-100 border-yellow-400 text-yellow-700"
      default:
        return "bg-gray-100 border-gray-400 text-gray-700"
    }
  }

  const getStatusIcon = () => {
    switch (backendStatus) {
      case "connected":
        return <Wifi size={20} className="mr-2" />
      case "disconnected":
        return <WifiOff size={20} className="mr-2" />
      case "checking":
        return <AlertCircle size={20} className="mr-2" />
      default:
        return <AlertCircle size={20} className="mr-2" />
    }
  }

  const getStatusMessage = () => {
    switch (backendStatus) {
      case "connected":
        return "✅ Connected to backend server (https://worker-backend-7fyo.onrender.com)"
      case "disconnected":
        return "❌ Cannot connect to backend server. Please start the server on https://worker-backend-7fyo.onrender.com"
      case "checking":
        return "🔍 Checking backend connection..."
      default:
        return "❓ Unknown connection status"
    }
  }

  const handleOTPExpiration = () => {
    setEmailVerified(false)
    setOtpStep(true)
    setOtpSent(false)
    setFormData({ ...formData, otp: "" })
    setError("Your OTP has expired. Please request a new one.")
  }

  // OTP Modal/Step
  if (otpStep) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
              <p className="text-gray-600 mt-2">We've sent a 6-digit verification code to</p>
              <p className="font-semibold text-emerald-600">{formData.email}</p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                <AlertCircle size={20} className="mr-2" />
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength="6"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                  required
                />
              </div>

              {otpCountdown > 0 && (
                <div className="text-center text-sm text-gray-600">
                  Code expires in: {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, "0")}
                </div>
              )}

              <button
                onClick={verifyOTPAndProceed}
                disabled={!formData.otp || formData.otp.length !== 6}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify Email
              </button>

              <div className="text-center">
                <button
                  onClick={() => {
                    setOtpStep(false)
                    setOtpSent(false)
                    setFormData({ ...formData, otp: "" })
                  }}
                  className="text-gray-600 hover:text-gray-800 text-sm"
                >
                  ← Back to registration
                </button>
              </div>

              {otpCountdown === 0 && (
                <div className="text-center">
                  <button
                    onClick={sendOTP}
                    disabled={otpLoading}
                    className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                  >
                    {otpLoading ? "Sending..." : "Resend OTP"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{t("createAccount")} - Workers Globe</h2>

          {/* Backend Connection Status */}
          {/* <div className={`mb-6 p-4 rounded-lg flex items-center ${getStatusColor()}`}>
            {getStatusIcon()}
            {getStatusMessage()}
          </div> */}

          {/* Email Verification Status */}
          {emailVerified && (
            <div className="mb-6 p-4 rounded-lg flex items-center bg-green-100 border-green-400 text-green-700">
              <CheckCircle size={20} className="mr-2" />
              Email verified successfully! You can now complete your registration.
            </div>
          )}

          {/* OTP Status Display */}
          {emailVerified && formData.otp && (
            <div className="mb-6 p-4 rounded-lg flex items-center justify-between bg-blue-50 border-blue-200 text-blue-700">
              <div className="flex items-center">
                <CheckCircle size={20} className="mr-2" />
                <span>Email verified with OTP: ****{formData.otp.slice(-2)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmailVerified(false)
                  setOtpStep(true)
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Change Email?
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Verification Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Shield className="mr-2" />
                Email Verification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("email")} *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={emailVerified}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:bg-gray-100"
                    required
                  />
                </div>
                <div>
                  {!emailVerified ? (
                    <button
                      type="button"
                      onClick={sendOTP}
                      disabled={otpLoading || !formData.email}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? "Sending..." : "Send OTP"}
                    </button>
                  ) : (
                    <div className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-lg font-medium text-center">
                      ✓ Verified
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">{t("basicInformation")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("fullName")} *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("gender")} *
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  >
                    <option value="">{t("selectGender")}</option>
                    <option value="male">{t("male")}</option>
                    <option value="female">{t("female")}</option>
                    <option value="other">{t("other")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("age")} *
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("phoneNumber")} *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("userType")} *
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    required
                  >
                    <option value="">{t("selectUserType")}</option>
                    <option value="provider">{t("jobProvider")}</option>
                    <option value="seeker">{t("jobSeeker")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">{t("addressInformation")}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("permanentAddress")} *
                  </label>
                  <textarea
                    id="permanentAddress"
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter your permanent address"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id="copyAddress"
                      name="copyAddress"
                      checked={formData.copyAddress}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="copyAddress" className="text-sm text-gray-700">
                      {t("presentAddressSame")}
                    </label>
                  </div>
                  <label htmlFor="presentAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("presentAddress")} *
                  </label>
                  <textarea
                    id="presentAddress"
                    name="presentAddress"
                    value={formData.presentAddress}
                    onChange={handleChange}
                    rows={3}
                    disabled={formData.copyAddress}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:bg-gray-100"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <LocationSelector
                    onLocationSelect={handleLocationSelect}
                    disabled={loading}
                    initialState={formData.workingState}
                    initialDistrict={formData.workingDistrict}
                  />
                </div>
              </div>
            </div>

            {/* Job Seeker Specific Fields */}
            {formData.userType === "seeker" && (
              <div className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">{t("professionalInformation")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
                      Skills *
                    </label>
                    <div className="relative">
                      <div
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer bg-white min-h-[48px] flex flex-wrap items-center gap-2"
                        onClick={() => setSkillsDropdownOpen(!skillsDropdownOpen)}
                      >
                        {formData.selectedSkills.length > 0 ? (
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
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {availableSkills.map((skill) => (
                            <div
                              key={skill}
                              className={`px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                                formData.selectedSkills.includes(skill) ? "bg-emerald-50 text-emerald-700" : ""
                              }`}
                              onClick={() => handleSkillToggle(skill)}
                            >
                              <span>{skill}</span>
                              {formData.selectedSkills.includes(skill) && (
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

                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("yearsOfExperience")} *
                    </label>
                    <select
                      id="yearsOfExperience"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      required={formData.userType === "seeker"}
                    >
                      <option value="">Select experience</option>
                      {experienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Bio */}
            <div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    {t("bio")} *
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder={t("bioPlaceholder")}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || backendStatus !== "connected" || !emailVerified}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-4 px-6 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
              >
                {loading ? t("loading") : t("register")}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {t("alreadyHaveAccount")}{" "}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">
                {t("login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
