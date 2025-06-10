/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  Briefcase,
  Bell,
  Star,
  LogOut,
  Eye,
  Trash2,
  TrendingUp,
  Activity,
  AlertCircle,
  Loader2,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Building,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
  RefreshCw,
  CheckCheck,
  Filter,
  Search,
  UserCheck,
  BriefcaseIcon,
  UserX,
  Award,
  AlertOctagon,
} from "lucide-react"

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [notifications, setNotifications] = useState([])
  const [notificationStats, setNotificationStats] = useState({})
  const [recentActivity, setRecentActivity] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabLoading, setTabLoading] = useState(false)

  // Notification filters and search
  const [notificationFilter, setNotificationFilter] = useState("all")
  const [notificationSearch, setNotificationSearch] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalType, setModalType] = useState(null) // 'user' or 'job'
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState(null)

  useEffect(() => {
    // Check admin authentication
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      navigate("/admin/login")
      return
    }

    fetchAdminData()
  }, [navigate])

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (autoRefresh && activeTab === "notifications") {
      const interval = setInterval(() => {
        fetchNotifications()
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh, activeTab])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      // Fetch all data in parallel
      const [statsResponse, usersResponse, jobsResponse, notificationsResponse, notificationStatsResponse] =
        await Promise.all([
          fetch("http://localhost:8000/admin/stats", { headers }),
          fetch("http://localhost:8000/admin/users", { headers }),
          fetch("http://localhost:8000/admin/jobs", { headers }),
          fetch("http://localhost:8000/admin/notifications", { headers }),
          fetch("http://localhost:8000/admin/notifications/stats", { headers }),
        ])

      // Check if all requests were successful
      if (
        !statsResponse.ok ||
        !usersResponse.ok ||
        !jobsResponse.ok ||
        !notificationsResponse.ok ||
        !notificationStatsResponse.ok
      ) {
        throw new Error("Failed to fetch admin data")
      }

      const [statsData, usersData, jobsData, notificationsData, notificationStatsData] = await Promise.all([
        statsResponse.json(),
        usersResponse.json(),
        jobsResponse.json(),
        notificationsResponse.json(),
        notificationStatsResponse.json(),
      ])

      // Update state with real data
      setStats(statsData)
      setUsers(usersData)
      setJobs(jobsData)
      setNotifications(notificationsData)
      setNotificationStats(notificationStatsData)

      // Generate recent activity from real data
      generateRecentActivity(usersData, jobsData)
    } catch (error) {
      console.error("Error fetching admin data:", error)
      setError("Failed to load admin data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      const [notificationsResponse, notificationStatsResponse] = await Promise.all([
        fetch("http://localhost:8000/admin/notifications", { headers }),
        fetch("http://localhost:8000/admin/notifications/stats", { headers }),
      ])

      if (notificationsResponse.ok && notificationStatsResponse.ok) {
        const [notificationsData, notificationStatsData] = await Promise.all([
          notificationsResponse.json(),
          notificationStatsResponse.json(),
        ])

        setNotifications(notificationsData)
        setNotificationStats(notificationStatsData)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const generateRecentActivity = (usersData, jobsData) => {
    const activities = []

    // Add recent user registrations (last 10)
    const recentUsers = usersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

    recentUsers.forEach((user) => {
      activities.push({
        type: "user_registration",
        message: `New user registration: ${user.name} (${user.userType})`,
        timestamp: user.createdAt,
        user: user.name,
        userType: user.userType,
      })
    })

    // Add recent job postings (last 10)
    const recentJobs = jobsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

    recentJobs.forEach((job) => {
      activities.push({
        type: "job_posting",
        message: `Job posted: ${job.title} by ${job.providerName}`,
        timestamp: job.createdAt,
        jobTitle: job.title,
        provider: job.providerName,
      })
    })

    // Sort all activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    setRecentActivity(activities.slice(0, 10))
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`

    return time.toLocaleDateString()
  }

  // Notification management functions
  const handleDeleteNotification = async (notificationId) => {
    try {
      setTabLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

      const response = await fetch(`http://localhost:8000/admin/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Remove notification from local state
        setNotifications(notifications.filter((n) => n.id !== notificationId))
        // Refresh stats
        fetchNotifications()
      } else {
        throw new Error("Failed to delete notification")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      alert("Failed to delete notification. Please try again.")
    } finally {
      setTabLoading(false)
    }
  }

  const handleMarkAllNotificationsRead = async () => {
    try {
      setTabLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

      const response = await fetch("http://localhost:8000/admin/notifications/mark-all-read", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Marked ${result.modifiedCount} notifications as read`)
        // Refresh notifications
        fetchNotifications()
      } else {
        throw new Error("Failed to mark notifications as read")
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
      alert("Failed to mark notifications as read. Please try again.")
    } finally {
      setTabLoading(false)
    }
  }

  // Filter and search notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter = notificationFilter === "all" || notification.type === notificationFilter
    const matchesSearch =
      notificationSearch === "" ||
      notification.title.toLowerCase().includes(notificationSearch.toLowerCase()) ||
      notification.message.toLowerCase().includes(notificationSearch.toLowerCase()) ||
      notification.userName.toLowerCase().includes(notificationSearch.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "new-application":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "job-selected":
        return <UserCheck className="h-4 w-4 text-green-500" />
      case "job-completed":
        return <Award className="h-4 w-4 text-purple-500" />
      case "application-rejected":
        return <UserX className="h-4 w-4 text-red-500" />
      case "new-matching-job":
        return <BriefcaseIcon className="h-4 w-4 text-orange-500" />
      case "payment-success":
        return <DollarSign className="h-4 w-4 text-green-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  // Get notification type display name
  const getNotificationTypeDisplay = (type) => {
    switch (type) {
      case "new-application":
        return "New Application"
      case "job-selected":
        return "Job Selection"
      case "job-completed":
        return "Job Completed"
      case "application-rejected":
        return "Application Rejected"
      case "new-matching-job":
        return "Job Match"
      case "payment-success":
        return "Payment Success"
      default:
        return "Notification"
    }
  }

  // View functionality
  const handleViewUser = async (userId) => {
    try {
      setTabLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

      // Fetch detailed user information
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setSelectedItem(userData)
      } else {
        // If detailed endpoint doesn't exist, use existing user data
        const user = users.find((u) => u.id === userId)
        setSelectedItem(user)
      }

      setModalType("user")
      setViewModalOpen(true)
    } catch (error) {
      console.error("Error fetching user details:", error)
      // Fallback to existing data
      const user = users.find((u) => u.id === userId)
      setSelectedItem(user)
      setModalType("user")
      setViewModalOpen(true)
    } finally {
      setTabLoading(false)
    }
  }

  const handleViewJob = async (jobId) => {
    try {
      setTabLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

      // Fetch detailed job information including applications
      const [jobResponse, applicationsResponse] = await Promise.all([
        fetch(`http://localhost:8000/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`http://localhost:8000/applications/job/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }).catch(() => ({ ok: false })), // Handle case where no applications exist
      ])

      if (jobResponse.ok) {
        const jobData = await jobResponse.json()

        // Add applications data if available
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json()
          jobData.applications = applicationsData
        } else {
          jobData.applications = []
        }

        setSelectedItem(jobData)
      } else {
        // Fallback to existing data
        const job = jobs.find((j) => j.id === jobId)
        setSelectedItem(job)
      }

      setModalType("job")
      setViewModalOpen(true)
    } catch (error) {
      console.error("Error fetching job details:", error)
      // Fallback to existing data
      const job = jobs.find((j) => j.id === jobId)
      setSelectedItem(job)
      setModalType("job")
      setViewModalOpen(true)
    } finally {
      setTabLoading(false)
    }
  }

  // Delete functionality
  const handleDeleteUser = (userId, userName) => {
    const user = users.find((u) => u.id === userId)
    setItemToDelete({ id: userId, name: userName, type: "user", data: user })
    setDeleteType("user")
    setDeleteConfirmOpen(true)
  }

  const handleDeleteJob = (jobId, jobTitle) => {
    const job = jobs.find((j) => j.id === jobId)
    setItemToDelete({ id: jobId, name: jobTitle, type: "job", data: job })
    setDeleteType("job")
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      setTabLoading(true)
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

      const endpoint =
        itemToDelete.type === "user"
          ? `http://localhost:8000/admin/users/${itemToDelete.id}`
          : `http://localhost:8000/admin/jobs/${itemToDelete.id}`

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete ${itemToDelete.type}`)
      }

      // Show success message
      alert(`${itemToDelete.type === "user" ? "User" : "Job"} "${itemToDelete.name}" deleted successfully`)

      // Refresh data after deletion
      await fetchAdminData()

      // Close modal
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error)
      alert(`Failed to delete ${itemToDelete.type}. Please try again.`)
    } finally {
      setTabLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    navigate("/admin/login")
  }

  const handleRefresh = () => {
    if (activeTab === "notifications") {
      fetchNotifications()
    } else {
      fetchAdminData()
    }
  }

  // Modal Components (keeping existing ones)
  const UserViewModal = ({ user, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User Type</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.userType === "provider" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.userType}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {user.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Age</label>
                  <p className="text-gray-900">{user.age} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Gender</label>
                  <p className="text-gray-900 capitalize">{user.gender}</p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Working City</label>
                  <p className="text-gray-900">{user.workingCity || "Not specified"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Pincode</label>
                  <p className="text-gray-900">{user.pincode || "Not specified"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Permanent Address</label>
                  <p className="text-gray-900">{user.permanentAddress || "Not specified"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Present Address</label>
                  <p className="text-gray-900">{user.presentAddress || "Not specified"}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Professional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Years of Experience</label>
                  <p className="text-gray-900">{user.yearsOfExperience || 0} years</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rating</label>
                  <p className="text-gray-900 flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    {user.rating?.toFixed(1) || "0.0"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Skills</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.skills && user.skills.length > 0 ? (
                      user.skills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No skills specified</span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Bio</label>
                  <p className="text-gray-900">{user.bio || "No bio provided"}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Joined Date</label>
                  <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User ID</label>
                  <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const JobViewModal = ({ job, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Job Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Job Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Job Title</label>
                  <p className="text-xl font-semibold text-gray-900">{job.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === "open"
                        ? "bg-green-100 text-green-800"
                        : job.status === "assigned"
                          ? "bg-yellow-100 text-yellow-800"
                          : job.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.location}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment</label>
                  <p className="text-gray-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />₹{job.payment}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {job.duration}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Wage Type</label>
                  <p className="text-gray-900 capitalize">{job.wageType || "daily"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Negotiable</label>
                  <p className="text-gray-900">{job.negotiable ? "Yes" : "No"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{job.description}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">Required Skills</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {job.requiredSkills && job.requiredSkills.length > 0 ? (
                      job.requiredSkills.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No specific skills required</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Provider Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Provider Name</label>
                  <p className="text-gray-900">{job.providerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Provider ID</label>
                  <p className="text-gray-900 font-mono text-sm">{job.providerId}</p>
                </div>
                {job.providerEmail && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{job.providerEmail}</p>
                  </div>
                )}
                {job.providerPhone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{job.providerPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Statistics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Job Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Applicants</label>
                  <p className="text-2xl font-bold text-gray-900">{job.applicants || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Posted Date</label>
                  <p className="text-gray-900">{new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Job ID</label>
                  <p className="text-gray-900 font-mono text-sm">{job.id}</p>
                </div>
              </div>
            </div>

            {/* Applications (if available) */}
            {job.applications && job.applications.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Applications ({job.applications.length})
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {job.applications.map((application, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{application.seekerName}</p>
                          <p className="text-sm text-gray-600">
                            Applied: {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                          {application.rankingScore && (
                            <p className="text-sm text-blue-600">Match Score: {application.rankingScore.toFixed(1)}%</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            application.status === "selected"
                              ? "bg-green-100 text-green-800"
                              : application.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {application.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const DeleteConfirmModal = ({ item, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {item.type} <strong>"{item.name}"</strong>? This action cannot be undone and
            will also remove all related data.
          </p>

          {item.type === "user" && item.data && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Deleting this user will also remove:
              </p>
              <ul className="text-sm text-yellow-700 mt-1 ml-4">
                <li>• All job applications (if job seeker)</li>
                <li>• All posted jobs and their applications (if job provider)</li>
                <li>• All notifications and related data</li>
              </ul>
            </div>
          )}

          {item.type === "job" && item.data && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Deleting this job will also remove:
              </p>
              <ul className="text-sm text-yellow-700 mt-1 ml-4">
                <li>• All applications for this job</li>
                <li>• All related notifications</li>
                <li>• Job history and statistics</li>
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={tabLoading}
            >
              {tabLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </div>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <button
          onClick={handleRefresh}
          className="flex items-center px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Activity className="h-4 w-4 mr-2" />
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">
                {users.filter((u) => u.userType === "seeker").length} seekers,{" "}
                {users.filter((u) => u.userType === "provider").length} providers
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              <p className="text-xs text-gray-500 mt-1">
                {jobs.filter((j) => j.status === "open").length} open{" "}
                {/* {jobs.filter((j) => j.status === "closed").length} closed {""} */}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              <p className="text-xs text-gray-500 mt-1">Total job applications</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              <p className="text-xs text-gray-500 mt-1">Currently accepting applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center">
                  {activity.type === "user_registration" ? (
                    <Users className="h-4 w-4 text-blue-500 mr-3" />
                  ) : (
                    <Briefcase className="h-4 w-4 text-green-500 mr-3" />
                  )}
                  <div>
                    <span className="text-sm text-gray-600">{activity.message}</span>
                    {activity.userType && (
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          activity.userType === "provider" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {activity.userType}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">User Management</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Total: {users.length} users</span>
            {tabLoading && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      <div className="text-xs text-gray-400">{user.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.userType === "provider" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.userType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">{user.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.workingCity || user.location || "Not specified"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="View Details"
                      onClick={() => handleViewUser(user.id)}
                      disabled={tabLoading}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={tabLoading}
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderJobs = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Job Management</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Total: {jobs.length} jobs</span>
            {tabLoading && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No jobs found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      <div className="text-sm text-gray-500">{job.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.providerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.status === "open"
                          ? "bg-green-100 text-green-800"
                          : job.status === "assigned"
                            ? "bg-yellow-100 text-yellow-800"
                            : job.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{job.applicants || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{job.payment}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="View Details"
                      onClick={() => handleViewJob(job.id)}
                      disabled={tabLoading}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      disabled={tabLoading}
                      title="Delete Job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notificationStats.totalNotifications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertOctagon className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-gray-900">{notificationStats.unreadNotifications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent (24h)</p>
              <p className="text-2xl font-bold text-gray-900">{notificationStats.recentNotifications || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Auto Refresh</p>
              <div className="flex items-center mt-1">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                    autoRefresh ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      autoRefresh ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={`ml-2 text-sm ${autoRefresh ? "text-emerald-600" : "text-gray-500"}`}>
                  {autoRefresh ? "On" : "Off"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Controls */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-medium text-gray-900">System Notifications</h3>
              {tabLoading && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={notificationSearch}
                  onChange={(e) => setNotificationSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  value={notificationFilter}
                  onChange={(e) => setNotificationFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="new-application">New Applications</option>
                  <option value="job-selected">Job Selections</option>
                  <option value="job-completed">Job Completions</option>
                  <option value="application-rejected">Rejections</option>
                  <option value="new-matching-job">Job Matches</option>
                  <option value="payment-success">Payments</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleRefresh}
                  className="flex items-center px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  disabled={tabLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${tabLoading ? "animate-spin" : ""}`} />
                  Refresh
                </button>

                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={tabLoading || notificationStats.unreadNotifications === 0}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </button>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredNotifications.length} of {notifications.length} notifications
              {notificationFilter !== "all" && ` (filtered by ${getNotificationTypeDisplay(notificationFilter)})`}
              {notificationSearch && ` (search: "${notificationSearch}")`}
            </span>
            <span>
              Last updated:{" "}
              {notificationStats.lastUpdated ? new Date(notificationStats.lastUpdated).toLocaleTimeString() : "Never"}
            </span>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[600px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">
                {notificationFilter !== "all" || notificationSearch
                  ? "No notifications match your current filters"
                  : "No notifications found"}
              </p>
              {(notificationFilter !== "all" || notificationSearch) && (
                <button
                  onClick={() => {
                    setNotificationFilter("all")
                    setNotificationSearch("")
                  }}
                  className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{notification.title}</h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {getNotificationTypeDisplay(notification.type)}
                          </span>
                          {!notification.read && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                        {/* User Information */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{notification.userName}</span>
                            {notification.userType && (
                              <span
                                className={`px-1 py-0.5 rounded text-xs ${
                                  notification.userType === "provider"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {notification.userType}
                              </span>
                            )}
                          </div>
                          {notification.userEmail && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{notification.userEmail}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(notification.timestamp)}</span>
                          </div>
                        </div>

                        {/* Additional Context */}
                        {notification.jobTitle && (
                          <div className="mt-2 text-xs text-gray-600">
                            <span className="font-medium">Job:</span> {notification.jobTitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Notification"
                        disabled={tabLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Type Statistics */}
        {Object.keys(notificationStats.notificationTypes || {}).length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(notificationStats.notificationTypes || {}).map(([type, count]) => (
                <div key={type} className="text-center">
                  <div className="flex justify-center mb-1">{getNotificationIcon(type)}</div>
                  <div className="text-xs text-gray-600">{getNotificationTypeDisplay(type)}</div>
                  <div className="text-sm font-semibold text-gray-900">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-4 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full">Live Data</span>
              {autoRefresh && activeTab === "notifications" && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-1"></div>
                  Auto-refresh
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: Activity },
              { id: "users", name: "Users", icon: Users, count: users.length },
              { id: "jobs", name: "Jobs", icon: Briefcase, count: jobs.length },
              {
                id: "notifications",
                name: "Notifications",
                icon: Bell,
                count: notifications.length,
                badge: notificationStats.unreadNotifications > 0 ? notificationStats.unreadNotifications : null,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded-full">{tab.count}</span>
                )}
                {tab.badge && (
                  <span className="ml-1 bg-red-500 text-white px-2 py-1 text-xs rounded-full">{tab.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "users" && renderUsers()}
        {activeTab === "jobs" && renderJobs()}
        {activeTab === "notifications" && renderNotifications()}
      </div>

      {/* Modals */}
      {viewModalOpen && selectedItem && modalType === "user" && (
        <UserViewModal user={selectedItem} onClose={() => setViewModalOpen(false)} />
      )}

      {viewModalOpen && selectedItem && modalType === "job" && (
        <JobViewModal job={selectedItem} onClose={() => setViewModalOpen(false)} />
      )}

      {deleteConfirmOpen && itemToDelete && (
        <DeleteConfirmModal
          item={itemToDelete}
          onConfirm={confirmDelete}
          onCancel={() => {
            setDeleteConfirmOpen(false)
            setItemToDelete(null)
          }}
        />
      )}
    </div>
  )
}

export default AdminDashboard
