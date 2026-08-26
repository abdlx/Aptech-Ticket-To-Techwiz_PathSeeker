import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const useQuizDraftStore = create(persist((set) => ({
  attemptId: null, questionIds: [], answersByQuestionId: {}, currentQuestionIndex: 0, startedAt: null,
  setDraft: (draft) => set(draft), clearDraft: () => set({ attemptId: null, questionIds: [], answersByQuestionId: {}, currentQuestionIndex: 0, startedAt: null }),
}), { name: 'pathseeker-quiz-draft', storage: createJSONStorage(() => sessionStorage) }))

export const useComparisonStore = create(persist((set) => ({
  selectedCareerIds: [], addCareer: (id) => set((state) => state.selectedCareerIds.includes(id) || state.selectedCareerIds.length >= 5 ? state : { selectedCareerIds: [...state.selectedCareerIds, id] }),
  removeCareer: (id) => set((state) => ({ selectedCareerIds: state.selectedCareerIds.filter((item) => item !== id) })), clear: () => set({ selectedCareerIds: [] }),
}), { name: 'pathseeker-comparison', storage: createJSONStorage(() => sessionStorage) }))

export const useAccessibilityStore = create(persist((set) => ({
  theme: 'system', fontScale: 1, reducedMotion: false, naviMuted: false, setTheme: (theme) => set({ theme }),
  setFontScale: (fontScale) => set({ fontScale: Math.min(1.3, Math.max(0.85, fontScale)) }), setReducedMotion: (reducedMotion) => set({ reducedMotion }), setNaviMuted: (naviMuted) => set({ naviMuted }),
}), { name: 'pathseeker-accessibility', storage: createJSONStorage(() => localStorage) }))

export const useOnboardingDraftStore = create(persist((set) => ({
  step: 1, fragments: {}, setStep: (step) => set({ step }), updateFragments: (fragment) => set((state) => ({ fragments: { ...state.fragments, ...fragment } })), clear: () => set({ step: 1, fragments: {} }),
}), { name: 'pathseeker-onboarding', storage: createJSONStorage(() => sessionStorage) }))
