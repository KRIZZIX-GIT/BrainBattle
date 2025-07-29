import { useTranslation } from 'react-i18next'
import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md'
import { useSettingsStore } from '../../../../store/settingsStore'
import styles from './Theme.module.css'

export default function Theme() {
	const { theme, setTheme } = useSettingsStore()
	const { t } = useTranslation()
	function toggleTheme(): void {
		setTheme(theme === 'light' ? 'dark' : 'light')
	}

	return (
		<div className={styles['container']}>
			<p className={styles['tipoH1']}>{t('Theme')}</p>
			<p className={styles['tipoP']}>{t('ThemeTxt')}</p>
			<div className={styles['container-theme']}>
				<p className={styles['tipoP']}>{theme}</p>
				<div onClick={toggleTheme} className={styles['theme-swicher']}>
					<div
						className={
							theme === 'light'
								? styles['theme-swicher-button-light']
								: styles['theme-swicher-button-dark']
						}
					>
						{theme === 'light' ? (
							<MdOutlineLightMode />
						) : (
							<MdOutlineDarkMode color='grey' />
						)}
					</div>
				</div>
			</div>
		</div>
	)
}