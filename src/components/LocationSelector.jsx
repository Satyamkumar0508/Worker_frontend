"use client"

import { useState, useEffect } from "react"
import { MapPin, ChevronDown, Check, Search } from "lucide-react"
import indianLocations from "../lib/indian-locations.json"

const LocationSelector = ({ onLocationSelect, disabled = false, initialState = "", initialDistrict = "" }) => {
  const [selectedState, setSelectedState] = useState(initialState)
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict)
  const [availableDistricts, setAvailableDistricts] = useState([])
  const [availablePincodes, setAvailablePincodes] = useState([])
  const [selectedPincode, setSelectedPincode] = useState("")
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false)
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false)
  const [pincodeDropdownOpen, setPincodeDropdownOpen] = useState(false)
  const [stateSearchTerm, setStateSearchTerm] = useState("")
  const [districtSearchTerm, setDistrictSearchTerm] = useState("")

  // Get sorted list of states
  const states = Object.keys(indianLocations.states).sort()

  // Filter states based on search term
  const filteredStates = states.filter((state) => state.toLowerCase().includes(stateSearchTerm.toLowerCase()))

  // Filter districts based on search term
  const filteredDistricts = availableDistricts.filter((district) =>
    district.toLowerCase().includes(districtSearchTerm.toLowerCase()),
  )

  // Update districts when state changes
  useEffect(() => {
    if (selectedState && indianLocations.states[selectedState]) {
      const districts = Object.keys(indianLocations.states[selectedState].districts).sort()
      setAvailableDistricts(districts)

      // Reset district and pincode if state changes
      if (selectedDistrict && !districts.includes(selectedDistrict)) {
        setSelectedDistrict("")
        setAvailablePincodes([])
        setSelectedPincode("")
      }
    } else {
      setAvailableDistricts([])
      setSelectedDistrict("")
      setAvailablePincodes([])
      setSelectedPincode("")
    }
  }, [selectedState])

  // Update pincodes when district changes
  useEffect(() => {
    if (selectedState && selectedDistrict && indianLocations.states[selectedState]?.districts[selectedDistrict]) {
      const pincodes = indianLocations.states[selectedState].districts[selectedDistrict].sort()
      setAvailablePincodes(pincodes)

      // Auto-select first pincode if only one available
      if (pincodes.length === 1) {
        setSelectedPincode(pincodes[0])
      } else if (selectedPincode && !pincodes.includes(selectedPincode)) {
        setSelectedPincode("")
      }
    } else {
      setAvailablePincodes([])
      setSelectedPincode("")
    }
  }, [selectedState, selectedDistrict])

  // Notify parent component when location changes
  useEffect(() => {
    if (selectedState && selectedDistrict && selectedPincode) {
      onLocationSelect({
        state: selectedState,
        district: selectedDistrict,
        pincode: selectedPincode,
        workingCity: selectedDistrict, // For backward compatibility
        address: `${selectedDistrict}, ${selectedState} - ${selectedPincode}`,
      })
    }
  }, [selectedState, selectedDistrict, selectedPincode, onLocationSelect])

  const handleStateSelect = (state) => {
    setSelectedState(state)
    setStateDropdownOpen(false)
    setStateSearchTerm("")
  }

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district)
    setDistrictDropdownOpen(false)
    setDistrictSearchTerm("")
  }

  const handlePincodeSelect = (pincode) => {
    setSelectedPincode(pincode)
    setPincodeDropdownOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".location-dropdown")) {
        setStateDropdownOpen(false)
        setDistrictDropdownOpen(false)
        setPincodeDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <MapPin className="w-6 h-6 text-emerald-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">Select Your Working Location</h3>
      </div>

      {/* State Selection */}
      <div className="location-dropdown relative">
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
          Working State *
        </label>
        <div
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer bg-white ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => !disabled && setStateDropdownOpen(!stateDropdownOpen)}
        >
          <div className="flex items-center justify-between">
            <span className={selectedState ? "text-gray-900" : "text-gray-500"}>
              {selectedState || "Select your working state"}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${stateDropdownOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {stateDropdownOpen && !disabled && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search states..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={stateSearchTerm}
                  onChange={(e) => setStateSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredStates.map((state) => (
                <div
                  key={state}
                  className={`px-4 py-3 cursor-pointer hover:bg-emerald-50 flex items-center justify-between ${
                    selectedState === state ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                  }`}
                  onClick={() => handleStateSelect(state)}
                >
                  <span>{state}</span>
                  {selectedState === state && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
              ))}
              {filteredStates.length === 0 && (
                <div className="px-4 py-3 text-gray-500 text-center">No states found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* District Selection */}
      <div className="location-dropdown relative">
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
          Working District/City *
        </label>
        <div
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer bg-white ${
            disabled || !selectedState ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => selectedState && !disabled && setDistrictDropdownOpen(!districtDropdownOpen)}
        >
          <div className="flex items-center justify-between">
            <span className={selectedDistrict ? "text-gray-900" : "text-gray-500"}>
              {selectedDistrict || (selectedState ? "Select your working district/city" : "Select state first")}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${districtDropdownOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {districtDropdownOpen && selectedState && !disabled && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search districts/cities..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  value={districtSearchTerm}
                  onChange={(e) => setDistrictSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredDistricts.map((district) => (
                <div
                  key={district}
                  className={`px-4 py-3 cursor-pointer hover:bg-emerald-50 flex items-center justify-between ${
                    selectedDistrict === district ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                  }`}
                  onClick={() => handleDistrictSelect(district)}
                >
                  <span>{district}</span>
                  {selectedDistrict === district && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
              ))}
              {filteredDistricts.length === 0 && (
                <div className="px-4 py-3 text-gray-500 text-center">No districts found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pincode Selection */}
      <div className="location-dropdown relative">
        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
          Pincode *
        </label>

        {availablePincodes.length === 0 ? (
          // Show placeholder when no district selected
          <input
            type="text"
            placeholder={selectedDistrict ? "Loading pincodes..." : "Select district first to view pincodes"}
            readOnly
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        ) : availablePincodes.length === 1 ? (
          // Show as read-only input if only one pincode
          <div className="relative">
            <input
              type="text"
              value={availablePincodes[0]}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-emerald-50 text-emerald-700 cursor-default font-medium"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        ) : (
          // Show as dropdown if multiple pincodes
          <>
            <div
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors cursor-pointer bg-white ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => !disabled && setPincodeDropdownOpen(!pincodeDropdownOpen)}
            >
              <div className="flex items-center justify-between">
                <span className={selectedPincode ? "text-gray-900" : "text-gray-500"}>
                  {selectedPincode || `Select pincode (${availablePincodes.length} available)`}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${pincodeDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
            </div>

            {pincodeDropdownOpen && !disabled && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-200">
                  <div className="text-xs text-gray-600 mb-2">Available pincodes for {selectedDistrict}:</div>
                </div>
                {availablePincodes.map((pincode) => (
                  <div
                    key={pincode}
                    className={`px-4 py-3 cursor-pointer hover:bg-emerald-50 flex items-center justify-between ${
                      selectedPincode === pincode ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                    }`}
                    onClick={() => handlePincodeSelect(pincode)}
                  >
                    <span className="font-mono">{pincode}</span>
                    {selectedPincode === pincode && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pincode count indicator */}
        {availablePincodes.length > 1 && (
          <div className="mt-2 text-xs text-gray-500">
            {availablePincodes.length} pincodes available for {selectedDistrict}
          </div>
        )}
      </div>

      {/* Location Summary */}
      {selectedState && selectedDistrict && selectedPincode && (
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg">
          <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center">
            <Check className="w-4 h-4 mr-2" />
            Selected Working Location:
          </h4>
          <p className="text-emerald-700 font-medium">
            {selectedDistrict}, {selectedState} - {selectedPincode}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            This location will be used to match you with nearby job opportunities
          </p>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium text-gray-600">How to select your location:</p>
        <p>• First, choose your working state from the dropdown</p>
        <p>• Then select your district/city where you want to work</p>
        <p>• The pincode will automatically populate based on your district selection</p>
        <p>• Use the search feature to quickly find your location</p>
      </div>
    </div>
  )
}

export default LocationSelector
