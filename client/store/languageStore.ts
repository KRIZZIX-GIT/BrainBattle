// stores/languageStore.ts
import { create } from 'zustand'
import i18n from '../helpers/i18n'

interface LanguageState {
	language: string
	changeLanguage: (language: string) => void
}

const useLanguageStore = create<LanguageState>(set => ({
	language: localStorage.getItem('language') || 'ru', 
	changeLanguage: (language: string) => {
		i18n.changeLanguage(language)
		localStorage.setItem('language', language) 
		set({ language })
	}
}))

export default useLanguageStore
