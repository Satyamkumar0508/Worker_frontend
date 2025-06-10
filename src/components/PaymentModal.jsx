"use client"

import { useState } from "react"
import { X, CreditCard } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, applicantCount }) => {
  const { t } = useLanguage()
  const [selectedPlan, setSelectedPlan] = useState("basic")
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      id: "basic",
      name: "Basic Plan",
      nameHi: "बेसिक प्लान",
      nameOd: "ବେସିକ୍ ପ୍ଲାନ୍",
      applicants: "1-2",
      price: "₹50",
      description: "View up to 2 applicants",
      descriptionHi: "2 आवेदकों तक देखें",
      descriptionOd: "୨ ଆବେଦନକାରୀ ପର୍ଯ୍ୟନ୍ତ ଦେଖନ୍ତୁ",
    },
    {
      id: "standard",
      name: "Standard Plan",
      nameHi: "स्टैंडर्ड प्लान",
      nameOd: "ଷ୍ଟାଣ୍ଡାର୍ଡ ପ୍ଲାନ୍",
      applicants: "1-5",
      price: "₹100",
      description: "View up to 5 applicants",
      descriptionHi: "5 आवेदकों तक देखें",
      descriptionOd: "୫ ଆବେଦନକାରୀ ପର୍ଯ୍ୟନ୍ତ ଦେଖନ୍ତୁ",
    },
    {
      id: "premium",
      name: "Premium Plan",
      nameHi: "प्रीमियम प्लान",
      nameOd: "ପ୍ରିମିୟମ୍ ପ୍ଲାନ୍",
      applicants: "1-10",
      price: "₹200",
      description: "View up to 10 applicants",
      descriptionHi: "10 आवेदकों तक देखें",
      descriptionOd: "୧୦ ଆବେଦନକାରୀ ପର୍ଯ୍ୟନ୍ତ ଦେଖନ୍ତୁ",
    },
  ]

  const handlePayment = async () => {
    setLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false)
      onPaymentSuccess(selectedPlan)
      onClose()
      alert("Payment successful! You can now view applicants.")
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t("paymentRequired")}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">You have {applicantCount} applicant(s) for this job.</p>
          <p className="text-sm text-gray-500">{t("selectPlan")} to view applicant details:</p>
        </div>

        <div className="space-y-3 mb-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedPlan === plan.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-800">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                  <p className="text-xs text-gray-500">Applicants: {plan.applicants}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">{plan.price}</div>
                  <input
                    type="radio"
                    name="plan"
                    checked={selectedPlan === plan.id}
                    onChange={() => setSelectedPlan(plan.id)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <span>{t("loading")}</span>
            ) : (
              <>
                <CreditCard size={18} className="mr-2" />
                {t("pay")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
