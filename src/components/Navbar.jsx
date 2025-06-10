"use client"

import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { Menu, X, LogOut, User, Settings } from "lucide-react"
import NotificationDropdown from "./NotificationDropdown"
import LanguageSelector from "./LanguageSelector"

const Navbar = () => {
  const { currentUser, logout, isProvider, isSeeker } = useAuth()
  const { t } = useLanguage()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleLogoClick = () => {
    // If user is not logged in, always go to home
    if (!currentUser) {
      navigate("/")
      return
    }

    // If user is on home, login, or register pages, go to home
    const currentPath = location.pathname
    if (currentPath === "/" || currentPath === "/login" || currentPath === "/register") {
      navigate("/")
      return
    }

    // If user is logged in and on other pages, go to their dashboard
    if (isProvider) {
      navigate("/provider")
    } else if (isSeeker) {
      navigate("/seeker")
    } else {
      // Fallback to home if user type is unclear
      navigate("/")
    }
  }

  return (
    <header className="bg-emerald-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <button
            onClick={handleLogoClick}
            className="text-2xl font-bold hover:text-emerald-200 transition-colors cursor-pointer"
          >
            Workers Globe
          </button>

          <div className="md:hidden">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2" aria-label="Toggle menu">
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav
            className={`${
              showMobileMenu ? "flex" : "hidden"
            } md:flex flex-col md:flex-row absolute md:relative top-14 md:top-0 left-0 right-0 bg-emerald-700 md:bg-transparent z-50 md:z-auto p-4 md:p-0 shadow-md md:shadow-none`}
          >
            {currentUser ? (
              <>
                {isProvider && (
                  <>
                    <Link
                      to="/provider"
                      className="block py-2 px-4 hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 rounded"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t("dashboard")}
                    </Link>
                    <Link
                      to="/provider/post-job"
                      className="block py-2 px-4 hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 rounded"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {t("postJob")}
                    </Link>
                  </>
                )}

                {isSeeker && (
                  <Link
                    to="/seeker"
                    className="block py-2 px-4 hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 rounded"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t("findJobs")}
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="block py-2 px-4 hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 rounded"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {t("profile")}
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center py-2 px-4 hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 rounded text-left"
                >
                  <LogOut size={18} className="mr-2" /> {t("logout")}
                </button>

                {/* Mobile Admin Link - Only show on homepage */}
                {location.pathname === "/" && (
                  <Link
                    to="/admin/login"
                    className="md:hidden flex items-center py-2 px-4 hover:bg-emerald-600 rounded"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Settings size={18} className="mr-2" /> Admin Panel
                  </Link>
                )}
              </>
            ) : (
              <>
                {/* Show Home link when on login or register pages */}
                {(location.pathname === "/login" || location.pathname === "/register") && (
                  <Link
                    to="/"
                    className="block py-2 px-4 hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 rounded"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t("home")}
                  </Link>
                )}

                {/* Show Login link only when not on login page */}
                {location.pathname !== "/login" && (
                  <Link
                    to="/login"
                    className="block py-2 px-4 hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 rounded"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t("login")}
                  </Link>
                )}

                {/* Show Register link only when not on register page */}
                {location.pathname !== "/register" && (
                  <Link
                    to="/register"
                    className="block py-2 px-4 hover:bg-emerald-600 md:hover:bg-transparent md:hover:text-emerald-200 rounded"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {t("register")}
                  </Link>
                )}

                {/* Mobile Admin Link - Only show on homepage */}
                {location.pathname === "/" && (
                  <Link
                    to="/admin/login"
                    className="md:hidden flex items-center py-2 px-4 hover:bg-emerald-600 rounded"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Settings size={18} className="mr-2" /> Admin Panel
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Right Side Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSelector />

            {/* Desktop Admin Link - Only show on homepage */}
            {location.pathname === "/" && (
              <Link
                to="/admin/login"
                className="flex items-center px-4 py-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 transition-colors"
              >
                <Settings size={18} className="mr-2" /> Admin Panel
              </Link>
            )}

            {currentUser && (
              <>
                <NotificationDropdown />
                <div className="flex items-center">
                  <Link to="/profile" className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center mr-2">
                      <User size={16} />
                    </div>
                    <span className="hidden lg:inline">{currentUser.name}</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
