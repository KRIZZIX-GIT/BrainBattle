import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './../transate/en.json'
import ru from './../transate/ru.json'
import fr from './../transate/fr.json'
import de from './../transate/de.json'
import cn from './../transate/cn.json'

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		ru: { translation: ru },
		fr: { translation: fr },
		de: { translation: de },
		cn: { translation: cn }
	},
	lng: localStorage.getItem('language') || 'ru',
	fallbackLng: 'ru',
	interpolation: {
		escapeValue: false
	}
})

export default i18n
