import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './../../../components/WithLanguageSwitcher/LanguageSwitcher'
import styles from './Lang.module.css'

function SettingsPage() {
	const { t } = useTranslation()
	return (
		<div className={styles['container']}>
			<p className={styles['tipoH1']}>{t('LangChange')}</p>
			<div className={styles['container-lang']}>
				<LanguageSwitcher />
			</div>
		</div>
	)
}

export default SettingsPage
