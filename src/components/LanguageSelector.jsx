"use client"

import { useState, useRef, useEffect } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { Globe, ChevronDown } from "lucide-react"

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

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

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode)
    setIsOpen(false)
  }

  // Find current language name
  const currentLangName = availableLanguages.find((lang) => lang.code === currentLanguage)?.name || "Language"

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 text-white hover:bg-emerald-600 rounded-lg transition-colors"
      >
        <Globe size={18} className="mr-2" />
        <span className="mr-1">{currentLangName}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 py-1 border border-gray-200">
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 ${
                currentLanguage === language.code ? "bg-emerald-100 text-emerald-800 font-medium" : "text-gray-700"
              }`}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
