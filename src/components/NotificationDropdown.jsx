"use client"
import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { useNotifications } from "../contexts/NotificationContext"
import { useAuth } from "../contexts/AuthContext"
import { Link } from "react-router-dom"

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { currentUser } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading, refreshNotifications } = useNotifications()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Set up polling for notifications
  useEffect(() => {
    if (currentUser) {
      // Initial fetch
      refreshNotifications()

      // Set up polling every 30 seconds
      const intervalId = setInterval(() => {
        refreshNotifications()
      }, 30000)

      return () => clearInterval(intervalId)
    }
  }, [currentUser, refreshNotifications])

  // Handle notification click
  const handleNotificationClick = async (notificationId) => {
    await markAsRead(notificationId)
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  if (!currentUser) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-2 px-3 bg-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
            {notifications.length > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-4 px-3 text-center text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-4 px-3 text-center text-gray-500">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`py-3 px-4 border-b border-gray-100 ${!notification.read ? "bg-blue-50" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleNotificationClick(notification.id)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="py-2 px-3 bg-gray-100 text-center">
              <Link
                to="/notifications"
                className="text-xs text-blue-600 hover:text-blue-800"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
