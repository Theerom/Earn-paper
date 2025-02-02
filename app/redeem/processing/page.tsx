"use client"

import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navigation from '@/components/shared/Navigation'

function ProcessingContent() {
  const searchParams = useSearchParams()
  const amount = searchParams.get('amount')
  const method = searchParams.get('method')

  return (
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
      <h1 className="text-2xl font-bold text-green-800">Your cashout is being processed</h1>
      <p className="text-lg text-green-600">
        Amount: ${amount} via {method}
      </p>
      <p className="text-lg text-green-600">You will receive your payment in 20 days.</p>
    </div>
  )
}

export default function CashoutProcessingPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <Suspense fallback={
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <h1 className="text-2xl font-bold text-green-800">Loading...</h1>
          </div>
        }>
          <ProcessingContent />
        </Suspense>
        <Link href="/dashboard" className="mt-8">
          <Button className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </>
  )
}
