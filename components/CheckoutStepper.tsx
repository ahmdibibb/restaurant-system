'use client'

import { Check } from 'lucide-react'

interface Step {
    number: number
    label: string
    status: 'completed' | 'current' | 'upcoming'
}

interface CheckoutStepperProps {
    steps: Step[]
}

export default function CheckoutStepper({ steps }: CheckoutStepperProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-center">
                {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                        {/* Step Circle */}
                        <div className="flex flex-col items-center">
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${step.status === 'completed'
                                        ? 'border-green-500 bg-green-500 text-white'
                                        : step.status === 'current'
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-gray-300 bg-white text-gray-400'
                                    }`}
                            >
                                {step.status === 'completed' ? (
                                    <Check size={20} />
                                ) : (
                                    <span className="font-semibold">{step.number}</span>
                                )}
                            </div>
                            <span
                                className={`mt-2 text-sm font-medium ${step.status === 'completed' || step.status === 'current'
                                        ? 'text-gray-900'
                                        : 'text-gray-400'
                                    }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`mx-4 h-0.5 w-16 sm:w-24 ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
