import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaLongArrowAltLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import Snowfall from 'react-snowfall'
import { useSettingsStore } from '../../../store/settingsStore'
import { useUserStore } from '../../../store/userStore'
import discordlogo from '../../assets/discord-logo.png'
import logo from '../../assets/logo.png'
import Header from '../../components/Header/Header'
import WhenIsTheError from '../../components/WhenIsTheError/WhenIsTheError'
import styles from './App.module.css'
import { IUser } from '../../../interfaces/IUser-model'

function App() {
	const [userData, setUserData] = useState<IUser | null>(null)
	const { t } = useTranslation()
	const { user, checkAuth } = useUserStore()
	const { theme } = useSettingsStore()
	const navigate = useNavigate()
	function redirect1(): void {
		navigate('/registration')
	}

	function redirect2(): void {
		navigate('/main')
	}

	useEffect(() => {
		if (user) {
			setUserData(user)
		} else if (userData != null && userData.isActivated != true) {
		} else {
			checkAuth()
		}
	}, [user])

	return (
		<div
			className={theme === 'dark' ? styles['main-dark'] : styles['main-light']}
		>
			<Snowfall style={{position: "fixed"}}/>
			<Header />
			<WhenIsTheError/>

			<div className={styles['container1']}>
				<div className={styles['content1']}>
					<div className={styles['text-box']}>
						<p className={styles['txt1']}>
							{t('Create')} <br /> {t('PlayTogether')} <br /> {t('Win')}
						</p>
						<p className={styles['txt2']}>{t('MainTxt1')}</p>
					</div>
					<img src={logo} alt='logo' className={styles['logo-img']} />
				</div>
				{userData ? (
					<button onClick={redirect2} className={styles['btn3']}>
						{t('Play')}
					</button>
				) : (
					<button onClick={redirect1} className={styles['btn3']}>
						{t('Register')}
					</button>
				)}
			</div>

			<div className={styles['container2']}>
				<div className={styles['content2-1']}>
					<div className={styles['text-box-2']}>
						<p className={styles['tipoH1']}>{t('editor')}</p>
						<p className={styles['text']}>{t('MainTxt2')}</p>
					</div>
				</div>
				<div className={styles['content2-2']}>
					<div className={styles['text-box-2']}>
						<p className={styles['tipoH1']}>{t('PlayWFriends')}</p>
						<p className={styles['text']}>{t('MainTxt3')}</p>
					</div>
				</div>
				<div className={styles['content2-3']}>
					<div className={styles['text-box-2']}>
						<p className={styles['tipoH1']}>{t('BecameSmarter')}</p>
						<p className={styles['text']}>{t('MainTxt4')}</p>
					</div>
				</div>
			</div>
			<div className={styles['container3']}>
				<div className={styles['content3']}>
					<p className={styles['logo-2']}>BrainBattle</p>
					<img src={logo} alt='logo' className={styles['logo-img-2']} />
				</div>
				<div className={styles['text-box-3']}>
					<p className={styles['text']}>{t('Creators')}</p>
					<p className={styles['text']}>{t('MainTxt5')}</p>
					<p className={styles['text']}>{t('MainTxt6')}</p>

					<div className={styles['dis']}>
						<a href='https://discordapp.com/users/936329312137785376'>
							<img
								src={discordlogo}
								alt='discord'
								className={styles['discord']}
							/>
						</a>
						<FaLongArrowAltLeft />
						<p className={styles['tipoH1']}>{t('Discord')}</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App