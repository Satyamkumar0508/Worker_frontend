"use client"
import { Link } from "react-router-dom"
import { useLanguage } from "../contexts/LanguageContext"
import {
  Users,
  Briefcase,
  Star,
  CheckCircle,
  ArrowRight,
  Shield,
  MapPin,
  Clock,
  Hammer,
  Truck,
  HomeIcon,
  Utensils,
  Phone,
  Mail,
} from "lucide-react"

const Home = () => {
  const { t } = useLanguage()

  const jobCategories = [
    {
      icon: <Hammer className="w-12 h-12 text-emerald-600" />,
      title: t("constructionLabor"),
      description: t("constructionDesc"),
      jobs: `2,500${t("jobsAvailable")}`,
    },
    {
      icon: <HomeIcon className="w-12 h-12 text-emerald-600" />,
      title: t("domesticServices"),
      description: t("domesticDesc"),
      jobs: `1,800${t("jobsAvailable")}`,
    },
    {
      icon: <Truck className="w-12 h-12 text-emerald-600" />,
      title: t("deliveryTransport"),
      description: t("deliveryDesc"),
      jobs: `1,200${t("jobsAvailable")}`,
    },
    {
      icon: <Utensils className="w-12 h-12 text-emerald-600" />,
      title: t("foodHospitality"),
      description: t("foodDesc"),
      jobs: `900${t("jobsAvailable")}`,
    },
  ]

  const features = [
    {
      icon: <Users className="w-8 h-8 text-emerald-600" />,
      title: t("verifiedWorkers"),
      description: t("verifiedWorkersDesc"),
    },
    {
      icon: <MapPin className="w-8 h-8 text-emerald-600" />,
      title: t("localJobs"),
      description: t("localJobsDesc"),
    },
    {
      icon: <Clock className="w-8 h-8 text-emerald-600" />,
      title: t("flexibleTiming"),
      description: t("flexibleTimingDesc"),
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-600" />,
      title: t("securePayments"),
      description: t("securePaymentsDesc"),
    },
  ]

  const steps = [
    {
      number: "1",
      title: t("step1"),
      description: t("step1Desc"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: "2",
      title: t("step2"),
      description: t("step2Desc"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      number: "3",
      title: t("step3"),
      description: t("step3Desc"),
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("heroTitle")}</h1>
            <p className="text-xl md:text-2xl mb-8 text-emerald-100">{t("heroSubtitle")}</p>
            <p className="text-lg mb-10 text-emerald-200 max-w-3xl mx-auto">{t("heroDescription")}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors inline-flex items-center justify-center"
              >
                {t("joinAsWorker")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
              >
                {t("hireWorkers")}
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">500+</div>
                <div className="text-emerald-200">{t("activeWorkers")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">5,000+</div>
                <div className="text-emerald-200">{t("jobsPosted")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-emerald-200">{t("cities")}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-emerald-200">{t("rating")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("popularJobCategories")}</h2>
            <p className="text-lg text-gray-600">{t("findOpportunities")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {jobCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="mb-4 flex justify-center">{category.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                  {category.jobs}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("whyChooseWorkersGlobe")}</h2>
            <p className="text-lg text-gray-600">{t("trustedByThousands")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("howItWorks")}</h2>
            <p className="text-lg text-gray-600">{t("simpleSteps")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("whatUsersSay")}</h2>
            <p className="text-lg text-gray-600">{t("realExperiences")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{t("testimonial1")}"</p>
              <div className="font-semibold text-gray-900">{t("testimonial1Name")}</div>
              <div className="text-gray-600">{t("testimonial1Role")}</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{t("testimonial2")}"</p>
              <div className="font-semibold text-gray-900">{t("testimonial2Name")}</div>
              <div className="text-gray-600">{t("testimonial2Role")}</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{t("testimonial3")}"</p>
              <div className="font-semibold text-gray-900">{t("testimonial3Name")}</div>
              <div className="text-gray-600">{t("testimonial3Role")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("readyToStart")}</h2>
          <p className="text-xl mb-8 text-emerald-100">{t("joinThousands")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
            >
              {t("registerNow")}
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("needHelp")}</h2>
            <p className="text-lg text-gray-600">{t("getInTouch")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Phone className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("callUs")}</h3>
              <p className="text-gray-600">+91 77838 54401</p>
              <p className="text-gray-600">{t("mondayToSaturday")}</p>
            </div>

            <div className="text-center">
              <Mail className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("emailUs")}</h3>
              <p className="text-gray-600">support@workersglobe.com</p>
              <p className="text-gray-600">{t("responseTime")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
