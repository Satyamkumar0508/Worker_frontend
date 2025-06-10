import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { LanguageProvider } from "./contexts/LanguageContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { JobProvider } from "./contexts/JobContext"
import ErrorBoundary from "./components/ErrorBoundary"
import PrivateRoute from "./components/PrivateRoute"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import JobProviderDashboard from "./pages/JobProviderDashboard"
import JobSeekerDashboard from "./pages/JobSeekerDashboard"
import JobDetails from "./pages/JobDetails"
import PostJob from "./pages/PostJob"
import Applications from "./pages/Applications"
import Profile from "./pages/Profile"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <JobProvider>
              <div className="flex flex-col min-h-screen">
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/*" element={<Navigate to="/admin/login" replace />} />

                  {/* Public Routes */}
                  <Route
                    path="/"
                    element={
                      <>
                        <Navbar />
                        <main className="flex-grow">
                          <ErrorBoundary>
                            <Home />
                          </ErrorBoundary>
                        </main>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <>
                        <Navbar />
                        <main className="flex-grow">
                          <ErrorBoundary>
                            <Login />
                          </ErrorBoundary>
                        </main>
                        <Footer />
                      </>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <>
                        <Navbar />
                        <main className="flex-grow">
                          <ErrorBoundary>
                            <Register />
                          </ErrorBoundary>
                        </main>
                        <Footer />
                      </>
                    }
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/provider"
                    element={
                      <PrivateRoute userType="provider">
                        <>
                          <Navbar />
                          <main className="flex-grow container mx-auto px-4 py-8">
                            <ErrorBoundary>
                              <JobProviderDashboard />
                            </ErrorBoundary>
                          </main>
                          <Footer />
                        </>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/provider/post-job"
                    element={
                      <PrivateRoute userType="provider">
                        <>
                          <Navbar />
                          <main className="flex-grow">
                            <ErrorBoundary>
                              <PostJob />
                            </ErrorBoundary>
                          </main>
                          <Footer />
                        </>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/provider/applications/:jobId"
                    element={
                      <PrivateRoute userType="provider">
                        <>
                          <Navbar />
                          <main className="flex-grow container mx-auto px-4 py-8">
                            <ErrorBoundary>
                              <Applications />
                            </ErrorBoundary>
                          </main>
                          <Footer />
                        </>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/seeker"
                    element={
                      <PrivateRoute userType="seeker">
                        <>
                          <Navbar />
                          <main className="flex-grow container mx-auto px-4 py-8">
                            <ErrorBoundary>
                              <JobSeekerDashboard />
                            </ErrorBoundary>
                          </main>
                          <Footer />
                        </>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/job/:id"
                    element={
                      <PrivateRoute>
                        <>
                          <Navbar />
                          <main className="flex-grow container mx-auto px-4 py-8">
                            <ErrorBoundary>
                              <JobDetails />
                            </ErrorBoundary>
                          </main>
                          <Footer />
                        </>
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <>
                          <Navbar />
                          <main className="flex-grow container mx-auto px-4 py-8">
                            <ErrorBoundary>
                              <Profile />
                            </ErrorBoundary>
                          </main>
                          <Footer />
                        </>
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
            </JobProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  )
}

export default App
