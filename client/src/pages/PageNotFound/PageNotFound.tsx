import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Snowfall from 'react-snowfall'
import { useSettingsStore } from '../../../store/settingsStore'
import Header from '../../components/Header/Header'
import styles from './PageNotFound.module.css'

function PageNotFound() {
	const { theme } = useSettingsStore()
	const navigate = useNavigate()
	const { t } = useTranslation()
	return (
		<div
			className={
				theme === 'dark' ? styles['container-dark'] : styles['container-light']
			}
		>
			<Snowfall style={{ position: 'fixed' }} />
			<Header />
			<div className={styles['content']}>
				<div className={styles['content-title']}>404 :(</div>
				<p className={styles['content-text']}>{t('404Err')}</p>
				<button
					className={styles['content-button']}
					onClick={() => navigate('/')}
				>
					{t('ToMain')}
				</button>
			</div>
		</div>
	)
}
export default PageNotFound
