import cn from 'classnames'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../../../store/settingsStore'
import { useUserStore } from '../../../../store/userStore'
import WhenIsTheError from '../../../components/WhenIsTheError/WhenIsTheError'
import { useFacebook } from '../../../hooks/useFacebookSDK'
import styles from './Login.module.css'
import { useTranslation } from 'react-i18next'
//pic
import { GoogleOAuthProvider } from '@react-oauth/google'
import { LoginStatus } from 'react-facebook'
import Snowfall from 'react-snowfall'
import logo from '../../../assets/logo.png'
import CustomGoogleLoginButton from '../../../components/GoogleButton/GoogleButton'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'

interface AuthResponse {
    userID: string
    accessToken: string
}

type LoginResponse = {
	status: LoginStatus.CONNECTED
	authResponse: AuthResponse
} | {
	status: Exclude<LoginStatus, LoginStatus.CONNECTED>
}

interface UserInfo {
    id: string
    name: string
    email: string
    picture: {
        data: {
            url: string
        }
    }
}

interface UserData {
    email: string
    name: string
    surname: string
    avatar: string
    sub: string
}

export default function Login() {
	const { t } = useTranslation()
	const { isFBReady, FB } = useFacebook()
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [login, setLogin] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [animate, setAnimate] = useState<boolean>(false)
	const [passError, setPassError] = useState<boolean>(false)
	const [loginError, setLoginError] = useState<boolean>(false)
	const navigate = useNavigate()
	const { theme } = useSettingsStore()
	const login2 = useUserStore(state => state.login)
	const { googleData, googleAuth, setFacebookData, facebookData, setError } = useUserStore()

	const getLoginAndPass = async (): Promise<void> => {
		const info = { login, password }
		if (!isLoading) {
			setIsLoading(true)
			try {
				await login2(info)
				navigate('../')
			} catch (error: any) {
				if (error.message === 'Неверный пароль') {
					setPassError(true)
				} else if (error.message === 'Пользователь не найден') {
					setLoginError(true)
				}
				setTimeout(() => {
					setPassError(false)
					setLoginError(false)
				}, 5000)
			} finally {
				setIsLoading(false)
			}
		}
	}

	const handleResponse = (response: LoginResponse): void => {
		if (response.status === LoginStatus.CONNECTED) {
		  window.FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo: UserInfo) => {
			const userData: UserData = {
			  email: userInfo.email,
			  name: userInfo.name.split(' ')[0], 
			  surname: userInfo.name.split(' ')[1] || '', 
			  avatar: userInfo.picture.data.url, 
			  sub: userInfo.id, 
			}
			setFacebookData(userData)
		  })
		} else {
		  console.error(`User is not authorized: ${response.status}`)
		}
	}

	const handleRegisterClick = (): void => {
		setAnimate(true)
		setTimeout(() => {
			navigate('../registration')
		}, 370)
	}

	const [showPassword, setShowPassword] = useState<boolean>(false)

	useEffect(() => {
		if (googleData) {
			const gooogle = async (): Promise<void> => {
				try {
					await googleAuth(googleData.email, googleData.sub)
					navigate('../')
				} catch (error: any) {
					if (error.message === 'Неверный пароль') {
						setPassError(true)
					} else if (error.message === 'Пользователь не найден') {
						setLoginError(true)
					}
					setTimeout(() => {
						setPassError(false)
						setLoginError(false)
					}, 5000)
				}
			}
			gooogle()
		}
	}, [googleData])

	useEffect(() => {
		if (facebookData) {
			const facebook = async (): Promise<void> => {
				try {
					await googleAuth(facebookData.email, facebookData.sub)
					navigate('../')
				} catch (error: any) {
					if (error.message === 'Неверный пароль') {
						setPassError(true)
					} else if (error.message === 'Пользователь не найден') {
						setLoginError(true)
					}
					setTimeout(() => {
						
						setPassError(false)
						setLoginError(false)
					}, 5000)
				}
			}
			facebook()
		}
	}, [facebookData])


	const StorePassChange = useUserStore(state => state.ForgotPassword)
	const [disabled, setDisabled] = useState(false)
	function ForgotPassword() {
		if (login) {
			StorePassChange(login)
			setDisabled(true)
			setError('Проверьте почту')
			setTimeout(() => {
				
			}, 2000)
		} else {
			setError('Введите email')
			setLoginError(true)
			setTimeout(() => {
				
				setLoginError(false)
			}, 2000)
		}
	}

	return (
		<div
			className={
				theme === 'dark' ? styles['container-dark'] : styles['container-light']
			}
		>
			<WhenIsTheError />
			<Snowfall style={{position: "fixed"}}/>
			<div
				className={cn(styles['login-container'], {
					[styles['animate']]: animate
				})}
			>
				<img src={logo} alt='Logo' className={styles['logo']} />
				<h1>{t("Login")}</h1>

				<div className={styles['input-container']}>
					<p className={styles['penis']}>{t("UsernameOrEmail")}:</p>
					<input
						type='text'
						placeholder={t("UsernameOrEmail")}
						className={
							!loginError ? styles['input-login'] : styles['input-login-error']
						}
						value={login}
						onChange={e => setLogin(e.target.value.replace(/\s/g, ''))}
					/>
					<p className={styles['penis']}>{t("Password")}:</p>
					<div className={styles['pass-container']}>
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder={t("Password")}
							className={
								!passError
									? styles['input-password']
									: styles['input-password-error']
							}
							value={password}
							onChange={e => setPassword(e.target.value)}
						/>

						<button
							className={styles['eye-btn']}
							onClick={() => setShowPassword(!showPassword)}
						>
							{' '}
							{showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
						</button>
					</div>
				</div>
				<div className={styles['forgot-pass']}>
					{t("ForgotPassword")}
					{
						disabled ? (
							<a>
						Отправлено
					       </a>
						) : (
					  		<a onClick={ForgotPassword} className={styles["forSpan"]}>
					       		{t("Restore")}
					       </a>
						)
					}
				</div>
				<div className={styles['btn-container']}>
				<button className={styles['btn-login']} onClick={getLoginAndPass} disabled={isLoading}>
					{isLoading ? (
						<div className={styles["preloader"]}>
						<div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
						<div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
						<div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
						</div>
					) : (
						t("Enter")
					)}
				</button>
					<p className={styles['or']}>{t("OrLoginFrom")}</p>
					<div className={styles['oauth-container']}>
						<GoogleOAuthProvider clientId='960772813659-svboq11o6h7ljrsec1qlqs05tm7mm0l3.apps.googleusercontent.com'>
							<CustomGoogleLoginButton/>
						</GoogleOAuthProvider>
						{isFBReady || FB ? (
							<button 
								className={styles['btn-login-facebook']} 
								onClick={() =>
							   		FB.login((response: LoginResponse) => {
									 	handleResponse(response)
							   		})
							 	}
						   >Facebook</button>
						) : ""}
					</div>
				</div>
				<div className={styles['register']} onClick={handleRegisterClick}>
					{t("FirstTime")}{' '}
					<span className={styles['forSpan']} onClick={handleRegisterClick}>
						{t("Register")}
					</span>
				</div>
			</div>
		</div>
	)
}