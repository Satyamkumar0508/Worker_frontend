"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Shield } from "lucide-react"

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simple admin authentication (in production, use proper authentication)
    if (credentials.username === "admin" && credentials.password === "admin123") {
      localStorage.setItem("adminToken", "admin-authenticated")
      navigate("/admin/dashboard")
    } else {
      setError("Invalid admin credentials")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center pt-20">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-xl font-bold text-emerald-600">
              Workers Globe
            </Link>
            <Link to="/" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <Shield className="mx-auto h-12 w-12 text-emerald-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Admin Portal</h2>
          <p className="text-gray-600">Workers Globe Administration</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={credentials.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
{/* 
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Demo credentials: admin / admin123</p>
        </div> */}
      </div>
    </div>
  )
}

export default AdminLogin
