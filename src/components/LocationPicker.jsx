"use client"

import { useState } from "react"
import { MapPin, Navigation, Globe } from "lucide-react"

const LocationPicker = ({ onLocationSelect, disabled = false }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const getGPSLocation = async () => {
    setLoading(true)
    setError("")

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser")
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Try Nominatim (OpenStreetMap) - Free and reliable
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "WorkersGlobe/1.0 (contact@workersglobe.com)",
            },
          },
        )

        if (response.ok) {
          const data = await response.json()

          if (data && data.address) {
            const locationInfo = {
              address: data.display_name,
              city: data.address.city || data.address.town || data.address.village || data.address.county || "",
              state: data.address.state || data.address.region || "",
              postcode: data.address.postcode || "",
              country: data.address.country || "",
              coordinates: { latitude, longitude },
            }

            onLocationSelect(locationInfo)
            return
          }
        }
      } catch (error) {
        console.log("Nominatim failed, trying BigDataCloud...", error)
      }

      // Fallback to BigDataCloud
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        )

        if (response.ok) {
          const data = await response.json()

          const locationInfo = {
            address: `${data.locality || ""} ${data.principalSubdivision || ""} ${data.countryName || ""}`.trim(),
            city: data.city || data.locality || "",
            state: data.principalSubdivision || "",
            postcode: data.postcode || "",
            country: data.countryName || "",
            coordinates: { latitude, longitude },
          }

          onLocationSelect(locationInfo)
          return
        }
      } catch (error) {
        console.log("BigDataCloud failed...", error)
      }

      // Basic fallback with coordinates
      const locationInfo = {
        address: `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        city: "Unknown City",
        state: "",
        postcode: "",
        country: "",
        coordinates: { latitude, longitude },
      }

      onLocationSelect(locationInfo)
    } catch (error) {
      console.error("GPS Location error:", error)

      let errorMessage = "Unable to get precise location. "
      if (error.code === 1) {
        errorMessage += "Please allow location access in your browser."
      } else if (error.code === 2) {
        errorMessage += "Location information is unavailable."
      } else if (error.code === 3) {
        errorMessage += "Location request timed out."
      } else {
        errorMessage += "Please try the approximate location option."
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getIPLocation = async () => {
    setLoading(true)
    setError("")

    try {
      // Try ipapi.co first (free, reliable)
      let response = await fetch("https://ipapi.co/json/")

      if (response.ok) {
        const data = await response.json()

        if (data && !data.error) {
          const locationInfo = {
            address: `${data.city || ""}, ${data.region || ""}, ${data.country_name || ""}`.replace(/^,\s*|,\s*$/g, ""),
            city: data.city || "",
            state: data.region || "",
            postcode: data.postal || "",
            country: data.country_name || "",
            coordinates: { latitude: data.latitude, longitude: data.longitude },
          }

          onLocationSelect(locationInfo)
          return
        }
      }

      // Fallback to ip-api.com
      response = await fetch("http://ip-api.com/json/")

      if (response.ok) {
        const data = await response.json()

        if (data && data.status === "success") {
          const locationInfo = {
            address: `${data.city || ""}, ${data.regionName || ""}, ${data.country || ""}`.replace(/^,\s*|,\s*$/g, ""),
            city: data.city || "",
            state: data.regionName || "",
            postcode: data.zip || "",
            country: data.country || "",
            coordinates: { latitude: data.lat, longitude: data.lon },
          }

          onLocationSelect(locationInfo)
          return
        }
      }

      throw new Error("All IP location services failed")
    } catch (error) {
      console.error("IP Location error:", error)
      setError("Unable to detect location automatically. Please enter your address manually.")
    } finally {
      setLoading(false)
    }
  }

  const getManualLocation = () => {
    // Provide common Indian cities as suggestions
    const commonCities = [
      "Mumbai, Maharashtra",
      "Delhi, Delhi",
      "Bangalore, Karnataka",
      "Hyderabad, Telangana",
      "Chennai, Tamil Nadu",
      "Kolkata, West Bengal",
      "Pune, Maharashtra",
      "Ahmedabad, Gujarat",
      "Jaipur, Rajasthan",
      "Surat, Gujarat",
    ]

    const selectedCity = prompt(
      "Enter your city and state (e.g., Mumbai, Maharashtra):\n\nCommon cities:\n" + commonCities.join("\n"),
    )

    if (selectedCity && selectedCity.trim()) {
      const [city, state] = selectedCity.split(",").map((s) => s.trim())

      const locationInfo = {
        address: selectedCity.trim(),
        city: city || "",
        state: state || "",
        postcode: "",
        country: "India",
        coordinates: null,
      }

      onLocationSelect(locationInfo)
    }
  }

  return (
    <div className="space-y-3">
      {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</div>}
      {!error && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> For more accurate location selection, use the State/District dropdowns in the form
            above. This GPS feature is for quick approximate location detection.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={getGPSLocation}
          disabled={disabled || loading}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Navigation size={16} className="mr-2" />
          {loading ? "Getting..." : "Precise Location"}
        </button>

        <button
          type="button"
          onClick={getIPLocation}
          disabled={disabled || loading}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Globe size={16} className="mr-2" />
          {loading ? "Getting..." : "Approximate"}
        </button>

        <button
          type="button"
          onClick={getManualLocation}
          disabled={disabled || loading}
          className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <MapPin size={16} className="mr-2" />
          Manual Entry
        </button>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong>Precise:</strong> Uses GPS (requires permission)
        </p>
        <p>
          <strong>Approximate:</strong> Uses internet connection
        </p>
        <p>
          <strong>Manual:</strong> Type your location
        </p>
      </div>
    </div>
  )
}

export default LocationPicker
