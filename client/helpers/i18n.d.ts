// types/i18n.d.ts
import 'i18next'

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: 'translation'
		resources: {
			en: typeof import('./../transate/en.json')
			ru: typeof import('./../transate/ru.json')
			fr: typeof import('./../transate/fr.json')
			de: typeof import('./../transate/de.json')
			cn: typeof import('./../transate/cn.json')
		}
	}
}
