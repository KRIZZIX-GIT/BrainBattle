import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next' // Hook for i18n
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../../store/settingsStore'
import { useUserStore } from '../../../store/userStore'
import styles from './Settings.module.css'

// Components
import Preloader from '../../components/preloader/preloader'
import WhenIsTheError from '../../components/WhenIsTheError/WhenIsTheError'
import About from './About/About'
import Lang from './Lang/Lang'
import Profile from './Profile/Profile'
import Theme from './Theme/Theme'

// Icons
import { CgDarkMode, CgProfile } from 'react-icons/cg'
import { FaInfo, FaLongArrowAltRight } from 'react-icons/fa'
import { GrLanguage } from 'react-icons/gr'
import { IoMdExit } from 'react-icons/io'
import Snowfall from 'react-snowfall'

export default function Settings() {
	const nav = useNavigate()
	const { theme } = useSettingsStore()
	const { t } = useTranslation() 
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [activeComponent, setActiveComponent] = useState<string>('profile')
	const [loading, setLoading] = useState<boolean>(true)
	const { user } = useUserStore()

	useEffect(() => {
		if (user) {
			setLoading(false)
		}
	}, [user])

	return (
		<div
			className={
				theme === 'dark' ? styles['container-dark'] : styles['container-light']
			}
		>
			<Preloader isLoad={loading} text={t('LoadProf')} />
			<WhenIsTheError />
			<Snowfall style={{ position: 'fixed' }} />
			<ul
				className={`${styles['settings-list']} ${
					isOpen ? styles['settings-list-open'] : styles['settings-list-closed']
				}`}
			>
				<button
					className={styles['openListBtn']}
					onClick={() => setIsOpen(!isOpen)}
				>
					<span
						className={!isOpen ? styles['arrow-right'] : styles['arrow-left']}
					>
						<FaLongArrowAltRight />
					</span>
				</button>
				<li
					className={`${styles['settings-item']} ${
						activeComponent === 'profile' ? styles['active'] : ''
					}`}
					onClick={() => {
						setActiveComponent('profile'), setIsOpen(false)
					}}
				>
					<CgProfile />
					<p>{t('Profile')}</p>
				</li>
				<li
					className={`${styles['settings-item']} ${
						activeComponent === 'theme' ? styles['active'] : ''
					}`}
					onClick={() => {
						setActiveComponent('theme'), setIsOpen(false)
					}}
				>
					<CgDarkMode />
					<p>{t('Theme')}</p>
				</li>
				<li
					className={`${styles['settings-item']} ${
						activeComponent === 'lang' ? styles['active'] : ''
					}`}
					onClick={() => {
						setActiveComponent('lang'), setIsOpen(false)
					}}
				>
					<GrLanguage />
					<p>{t('Language')}</p>
				</li>
				<li
					onClick={() => {
						setActiveComponent('about'), setIsOpen(false)
					}}
					className={styles['settings-item']}
				>
					<FaInfo />
					<p>{t('About')}</p>
				</li>
				<li
					className={styles['settings-item']}
					onClick={() => {
						nav('/')
					}}
				>
					<IoMdExit />
					<p>{t('Exit')}</p>
				</li>
			</ul>

			<div className={styles['settings-selected']}>
				{activeComponent === 'profile' && <Profile />}
				{activeComponent === 'theme' && <Theme />}
				{activeComponent === 'lang' && <Lang />}
				{activeComponent === 'about' && <About />}
			</div>
		</div>
	)
}