/* eslint-disable no-undef */
"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import { AlertCircle, Clock, RefreshCw, Mail } from "lucide-react"

const Login = () => {
  const [step, setStep] = useState(1) // 1: email, 2: OTP
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [canResend, setCanResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const { loginWithOTP, login, getDevOTP } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  // OTP Timer Effect
  useEffect(() => {
    let interval = null
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((timer) => timer - 1)
      }, 1000)
    } else if (otpTimer === 0 && step === 2) {
      setCanResend(true)
    }
    return () => clearInterval(interval)
  }, [otpTimer, step])

  // Enable resend after 5 seconds
  useEffect(() => {
    if (step === 2) {
      const resendTimer = setTimeout(() => {
        setCanResend(true)
      }, 5000)
      return () => clearTimeout(resendTimer)
    }
  }, [step])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email)
      setStep(2)
      setOtpTimer(300) // 5 minutes timer
      setCanResend(false)
    } catch (error) {
      setError(error.message || t("failedToSendOTP"))
      console.error(error)
    }

    setLoading(false)
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    setError("")

    try {
      const success = await login(email)

      if (success) {
        setOtpTimer(60) // Reset timer
        setCanResend(false)
      } else {
        setError(t("failedToResendOTP"))
      }
    } catch (error) {
      setError(t("networkError"))
      console.error(error)
    }

    setResendLoading(false)
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await loginWithOTP(email, otp)
      if (user) {
        navigate(user.userType === "provider" ? "/provider" : "/seeker")
      } else {
        setError(t("invalidOTP"))
      }
    } catch (error) {
      setError(error.response?.data?.detail || t("invalidOTP"))
      console.error(error)
    }

    setLoading(false)
  }

  const handleBackToEmail = () => {
    setStep(1)
    setOtp("")
    setError("")
    setOtpTimer(0)
    setCanResend(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {step === 1 ? t("loginToWorkersGlobe") : t("enterOTP")}
            </h2>
            <p className="text-gray-600">
              {step === 1 ? (
                t("enterEmailToReceiveOTP")
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Mail size={16} />
                  {t("otpSentTo")} {email}
                </span>
              )}
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("emailAddress")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder={t("enterEmailPlaceholder")}
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 shadow-lg"
                >
                  {loading ? t("loading") : t("sendOTP")}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("enterOTP")}
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center text-lg tracking-widest transition-colors"
                  placeholder={t("otpPlaceholder")}
                  required
                />
              </div>

              {/* Development helper - only show in development and don't show OTP in alert */}
              {/* {process.env.NODE_ENV === "development" && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      const otpData = await getDevOTP(email)
                      if (otpData && otpData.otp) {
                        setOtp(otpData.otp)
                        console.log("Development OTP auto-filled:", otpData.otp)
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {t("devAutoFillOTP")}
                  </button>
                </div>
              )} */}

              {/* Email sent confirmation */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Mail className="text-green-600 mr-2" size={16} />
                  <p className="text-green-800 text-sm">
                    Verification code sent to your email. Please check your inbox.
                  </p>
                </div>
              </div>

              {/* OTP Timer */}
              <div className="text-center">
                {otpTimer > 0 ? (
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Clock size={16} className="mr-1" />
                    {t("otpExpiresIn")} {formatTime(otpTimer)}
                  </div>
                ) : (
                  <div className="text-sm text-red-600">{t("otpExpired")}</div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otpTimer === 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 shadow-lg"
                >
                  {loading ? t("loading") : t("verifyOTP")}
                </button>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || resendLoading}
                  className="flex items-center justify-center text-emerald-600 hover:text-emerald-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw size={16} className="mr-1" />
                  {resendLoading ? t("loading") : t("resendOTP")}
                </button>

                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
                >
                  {t("backToEmail")}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {t("dontHaveAccount")}{" "}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-800 font-medium transition-colors">
                {t("register")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
