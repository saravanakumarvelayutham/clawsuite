import { create } from 'zustand'
import { STORAGE_KEY, ONBOARDING_STEPS } from '@/components/onboarding/onboarding-steps'

type OnboardingState = {
  isOpen: boolean
  currentStep: number
  totalSteps: number
  /** Check localStorage and open wizard if not completed */
  initialize: () => void
  /** Go to next step */
  nextStep: () => void
  /** Go to previous step */
  prevStep: () => void
  /** Go to specific step */
  goToStep: (step: number) => void
  /** Complete onboarding, set flag, and close */
  complete: () => void
  /** Skip onboarding immediately */
  skip: () => void
  /** Reset onboarding (for testing) */
  reset: () => void
}

// Check completion once at module load so the store never flickers open
const isCompleted = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true'

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isOpen: !isCompleted,
  currentStep: 0,
  totalSteps: ONBOARDING_STEPS.length,

  initialize: () => {
    // No-op: hydrated from localStorage at module load.
    // Kept for API compat — remove callers over time.
  },

  nextStep: () => {
    const { currentStep, totalSteps } = get()
    if (currentStep < totalSteps - 1) {
      set({ currentStep: currentStep + 1 })
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 })
    }
  },

  goToStep: (step: number) => {
    const { totalSteps } = get()
    if (step >= 0 && step < totalSteps) {
      set({ currentStep: step })
    }
  },

  complete: () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    set({ isOpen: false })
  },

  skip: () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    set({ isOpen: false })
  },

  reset: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ isOpen: true, currentStep: 0 })
  },
}))
