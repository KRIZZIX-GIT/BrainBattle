import React, { createContext, ReactNode, useContext, useState } from 'react'
import i18n from '../helpers/i18n'

type LanguageContextType = {
	language: string
	changeLanguage: (language: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined
)

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
	children
}) => {
	const [language, setLanguage] = useState(i18n.language)

	const changeLanguage = (newLanguage: string) => {
		i18n.changeLanguage(newLanguage)
		setLanguage(newLanguage)
	}

	return (
		<LanguageContext.Provider value={{ language, changeLanguage }}>
			{children}
		</LanguageContext.Provider>
	)
}

export const useLanguage = () => {
	const context = useContext(LanguageContext)
	if (!context) {
		throw new Error('useLanguage must be used within a LanguageProvider')
	}
	return context
}
export default LanguageContext
