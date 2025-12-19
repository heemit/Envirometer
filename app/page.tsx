"use client"

import { useState, useRef } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import CarbonForm from "@/components/carbon-form"
import ResultCard from "@/components/result-card"
import EarthLoader from "@/components/loading-spinner"

interface FormData {
  bodyType: string
  sex: string
  diet: string
  showerFrequency: string
  heatingEnergy: string
  transport: string
  vehicleType: string
  socialActivity: string
  monthlyGroceryBill: number
  airTravelFrequency: string
  vehicleMonthlyKm: number
  wasteBagSize: string
  wasteBagWeeklyCount: number
  tvPcHoursDaily: number
  newClothesMonthly: number
  internetHoursDaily: number
  energyEfficiency: string
  recycling: string[]
  cookingWith: string[]
}

interface PredictionResult {
  emissionScore: number
  status: "Low" | "Moderate" | "High"
  recommendations: string[]
  error?: string
}

export default function Home() {
  const [results, setResults] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  const handleStartAssessment = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true)
    try {
      // Start both API call and a 3-second delay
      const [data] = await Promise.all([
        (async () => {
          const response = await fetch("/api/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          })
          return response.json()
        })(),
        new Promise((resolve) => setTimeout(resolve, 3000)) // 3-second delay
      ])

      setResults(data)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecalculate = () => {
    setResults(null)
    formRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navbar />
      {isLoading && <EarthLoader />}

      {/* Hero Section */}
      <section className="flex-1 pt-20 pb-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
              <p className="text-sm font-semibold text-primary">AI-Powered Sustainability</p>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">
            EnviroMeter – Carbon Footprint <span className="text-primary">Predictor</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            AI-powered carbon footprint insights & sustainability recommendations
          </p>

          <button
            onClick={handleStartAssessment}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow-smooth hover:shadow-smooth-lg inline-block"
          >
            Start Assessment
          </button>
        </div>
      </section>

      {/* Results Section */}
      {results && (
        <section className="py-12 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            {results && !results.error && (
              <ResultCard result={results} onRecalculate={handleRecalculate} />
            )}
          </div>
        </section>
      )}

      {/* Form Section */}
      <section ref={formRef} className="py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">Carbon Assessment</h2>
          <p className="text-center text-muted-foreground mb-8">
            Tell us about your lifestyle so we can calculate your carbon footprint
          </p>
          <CarbonForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
