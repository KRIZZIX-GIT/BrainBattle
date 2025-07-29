import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import { NavLink } from 'react-router-dom'
import Snowfall from 'react-snowfall'
import { useSettingsStore } from '../../../../store/settingsStore'
import { useUserStore } from '../../../../store/userStore'
import logo from '../../../assets/logo.png'
import WhenIsTheError from '../../../components/WhenIsTheError/WhenIsTheError'
import styles from './ResetPassword.module.css'
function ResetPassword() {
	const theme = useSettingsStore(state => state.theme)
	const veryfyResetCode = useUserStore(state => state.veryfyResetCode)
	const { t } = useTranslation()
	const [code, setCode] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const [step, setStep] = useState(1)

	const [codeError, setCodeError] = useState(false)
	const [loginError, setLoginError] = useState(false)
	const [passwordError, setPasswordError] = useState(false)

	async function handleVerifyCode() {
		try {
			await veryfyResetCode(email, code)
			setStep(2)
		} catch (err: any) {
			if (err.message === `${t('IncorrectCode')}`) {
				setCodeError(true)
			} else if (err.message === `${t('UserNotFound')}`) {
				setLoginError(true)
			}
			setTimeout(() => {
				setCodeError(false)
				setLoginError(false)
			}, 3000)
		}
	}

	const changePassword = useUserStore(state => state.changePassword)
	async function handleResetPassword() {
		try {
			if (password !== confirmPassword) {
				setPasswordError(true)
				setTimeout(() => {
					setPasswordError(false)
				}, 3000)
				return
			}
			changePassword(password, email)
		} catch (err: any) {
			console.log(err)
		}
	}

	const [showPassword, setShowPassword] = useState(false)
	const [showPassword2, setShowPassword2] = useState(false)

	return (
		<div
			className={
				theme === 'dark' ? styles['container-dark'] : styles['container-light']
			}
		>
			<WhenIsTheError />
			<Snowfall />

			{step === 1 ? (
				<div className={styles['content']}>
					<img src={logo} alt='Logo' className={styles['logo']} />
					<h1 className={styles['title']}>{t('EnterResetCode')}</h1>
					<div className={styles['input-container']}>
						<p className={styles['penis']}>{t('Email')}</p>
						<input
							value={email}
							onChange={e => setEmail(e.target.value)}
							className={
								!loginError
									? styles['input-login']
									: styles['input-login-error']
							}
							type='text'
							placeholder='Email'
						/>
						<p className={styles['penis']}>{t('CheckingCode')}</p>
						<input
							value={code}
							onChange={e => setCode(e.target.value)}
							className={
								!codeError ? styles['input-code'] : styles['input-code-error']
							}
							type='text'
							placeholder={t('CheckingCode')}
						/>
					</div>
					<button className={styles['btn1']} onClick={handleVerifyCode}>
						{t('CheckCode')}
					</button>

					<p className={styles['paragraf']}>
						{t('SuddenlyThere')}
						<NavLink to='/main'>На главную</NavLink>
					</p>
				</div>
			) : (
				<div className={styles['content']}>
					<img src={logo} alt='Logo' className={styles['logo']} />
					<h1 className={styles['title']}>{t('ResetPassword')}</h1>
					<div className={styles['input-container']}>
						<p className={styles['penis']}>{t('NewPassword')}</p>
						<div className={styles['pass-container']}>
							<input
								value={password}
								onChange={e => setPassword(e.target.value)}
								className={styles['input-password']}
								type={showPassword ? 'text' : 'password'}
								placeholder={t('EnterNewPassword')}
							/>
							<button
								className={styles['eye-btn']}
								onClick={() => setShowPassword(!showPassword)}
							>
								{' '}
								{showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
							</button>
						</div>
						<p className={styles['penis']}>{t('AgainPassword')}</p>
						<div className={styles['pass-container']}>
							<input
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								className={
									!passwordError
										? styles['input-password-2']
										: styles['input-password-2-error']
								}
								type={showPassword2 ? 'text' : 'password'}
								placeholder={t('AgainPassword')}
							/>
							<button
								className={styles['eye-btn']}
								onClick={() => setShowPassword2(!showPassword2)}
							>
								{' '}
								{showPassword2 ? <FaRegEyeSlash /> : <FaRegEye />}
							</button>
						</div>
					</div>
					<button className={styles['btn1']} onClick={handleResetPassword}>
						{t('SaveNewPassword')}
					</button>
					<p className={styles['paragraf']}>{t('PasswordTxt')}</p>
				</div>
			)}
		</div>
	)
}

export default ResetPassword
