import styles from './Registration.module.css'
import { useState, useEffect } from 'react'
import logo from '../../../assets/logo.png'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../../../store/userStore'
import { useTranslation } from 'react-i18next'
import cn from "classnames"
import WhenIsTheError from '../../../components/WhenIsTheError/WhenIsTheError'
import CustomGoogleLoginButton from '../../../components/GoogleButton/GoogleButton'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { LoginStatus } from 'react-facebook'
import { FaRegEye } from "react-icons/fa6"
import { FaRegEyeSlash } from "react-icons/fa6"
import { useSettingsStore } from '../../../../store/settingsStore'
import { useFacebook } from '../../../hooks/useFacebookSDK'
import Snowfall from 'react-snowfall'

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

export default function Registration() {
    const { t } = useTranslation()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { isFBReady, FB } = useFacebook()
    const [name, setName] = useState<string>('')
    const [surname, setSurname] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [nickname, setNickname] = useState<string>('')
    const [animate, setAnimate] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')
    const [avatar, setAvatar] = useState<string>('')
    const [sub, setSub] = useState<string>('')
    const [passError, setPassError] = useState<boolean>(false)
    const [nameError, setNameError] = useState<boolean>(false)
    const [surnameError, setSurnameError] = useState<boolean>(false)
    const [nickError, setNickError] = useState<boolean>(false)
    const [emailError, setEmailError] = useState<boolean>(false)
    const [startAnimate, setStartAnimate] = useState<boolean>(true)
    const navigate = useNavigate() 
    const [isRotated, setIsRotated] = useState<boolean>(false)
    const { registration, existenceUser, googleData, setGoogleData, setFacebookData } = useUserStore()
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const { theme } = useSettingsStore()

    const toggleRotation = (): void => {
        setIsRotated(true)
    }
    const getLoginAndPass = async (): Promise<void> => {
        try {
            if (!isLoading) {
                setIsLoading(true)
                await existenceUser(email, name, surname)
                toggleRotation()
            }
        } catch(err) {
            if (err instanceof Error) {
                if (err.message == 'Заполните все поля') {
                    setNameError(true)
                    setSurnameError(true)
                    setEmailError(true)
                } else if (err.message == 'Неверный формат email') {
                    setEmailError(true)
                } else if (err.message == 'Имя должно содержать минимум 2 символа, максимуи 20') {
                    setNameError(true)
                } else if (err.message == 'Фамилия должна содержать минимум 2 символа, максимуи 20') {
                    setSurnameError(true)
                } 
            }
            setTimeout(() => {
                setNameError(false)
                setSurnameError(false)
                setEmailError(false)
            }, 5000)
        } finally {
            setIsLoading(false)
        }
    }

    const setRegistration = async (): Promise<void> => {
        try {
            if (!isLoading) {
                setIsLoading(true)
                const res = await registration(name, surname, nickname, email, password, avatar, sub)
                if (res) {
                    navigate("../")
                }
            }
        } catch(err) {
            if (err instanceof Error) {
                if (err.message == 'Заполните все поля') {
                    setNickError(true)
                    setPassError(true)
                } else if (err.message == 'Пароль должен содержать минимум 6 символов, максимум 20' || err.message == 'Пароль должен содержать буквы(английские или русские), и цифры') {
                    setPassError(true)
                } else if (err.message == 'Никнейм должен содержать минимум 2 символа, максимуи 20') {
                    setNickError(true)
                }
            } 
            setTimeout(() => {
                setNickError(false)
                setPassError(false)
            }, 5000)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResponse = (response: LoginResponse): void => {
        if (response.status === LoginStatus.CONNECTED) {
            response.authResponse
            
            window.FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo: UserInfo) => {
                const userData: UserData = {
                    email: userInfo.email,
                    name: userInfo.name.split(' ')[0],
                    surname: userInfo.name.split(' ')[1] || '', 
                    avatar: userInfo.picture.data.url,
                    sub: userInfo.id,
                }
                setFacebookData(userData)
                setEmail(userData.email)
                setName(userData.name)
                setSurname(userData.surname)
                setAvatar(userData.avatar)
                setSub(userData.sub)
            })
        }
    }

    const handleRegisterClick = (): void => {
        setAnimate(true) 
        setIsRotated(false)
        setTimeout(() => {
            navigate("../login")
        }, 470)
    }

    useEffect((): void => {
        setTimeout(() => {
            setStartAnimate(false)
        }, 500)
    }, [])

    useEffect(() => {
        if (googleData) {
            setGoogleData(null)
        }
    }, [])

    useEffect(() => {
        if (googleData) {
            setName(googleData.name)
            setSurname(googleData.surname)
            setEmail(googleData.email)
            setAvatar(googleData.avatar)
            setSub(googleData.sub)
            if (name && surname && email) {
                getLoginAndPass()
            }
        }
    }, [googleData]) 

    useEffect(() => {
        if (name && surname && email) {
            getLoginAndPass()
        }
    }, [sub])
    
    return (
        <div className={theme === 'dark' ? styles['container-dark'] : styles['container-light']}>
            <Snowfall style={{position: "fixed"}}/>
            <WhenIsTheError/>
            <div className={cn(styles['login-container'], {
                [styles["rotate-second"]]: isRotated,
                [styles["rotate-first"]]: !isRotated, 
                [styles["animate"]]: animate,
                [styles["startAnimate"]]: startAnimate
            })}>
                <div className={cn(styles["firstPart"], styles["side"])}>
                    <img src={logo} alt="Logo" className={styles['logo']} />
                    <h1>{t("Registration")}</h1>
                    <div className={styles['input-container']}>
                        <div className={styles['name_surname']}>
                            <div className={styles['name']}>
                                <label className={cn(styles['penis'])}>{t("NameOfUser")}:</label>
                                <input 
                                    type="text" 
                                    placeholder={t("NameOfUser")}
                                    className={cn(styles['input-login'], {
                                        [styles['error']]: nameError
                                    })} 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value.replace(/\s/g, ''))} 
                                />
                            </div>
                            <div className={styles['surname']}>
                                <label className={styles['penis']}>{t("SurnameOfUser")}:</label>
                                <input 
                                    type="text" 
                                    placeholder={t("SurnameOfUser")}
                                    className={cn(styles['input-login'], {
                                        [styles['error']]: surnameError
                                    })} 
                                    value={surname} 
                                    onChange={(e) => setSurname(e.target.value.replace(/\s/g, ''))} 
                                />
                            </div>
                        </div>
                        <p className={styles['penis']}>{t("email")}:</p>
                        <input 
                            type="text" 
                            placeholder={t("email")}
                            className={cn(styles['input-password'], {
                                [styles['error']]: emailError
                            })} 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))} 
                        />
                    </div>

                    <div className={styles['btn-container']}>
                        <button className={styles['btn-login']} onClick={getLoginAndPass}>
                            {isLoading ? (
                                <div className={styles["preloader"]}>
                                <div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
                                <div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
                                <div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
                                </div>
                            ) : (
                                t("Next")
                            )}
                        </button>
                        <p className={styles['or']}>{t("OrCreateFrom")}</p>
                        <div className={styles['oauth-container']}>
                            <GoogleOAuthProvider clientId="960772813659-svboq11o6h7ljrsec1qlqs05tm7mm0l3.apps.googleusercontent.com">
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
                    <div className={styles['register']}>{t("YouRegistrated")} 
                        <span className={styles["forSpan"]} onClick={handleRegisterClick}>{t("Login")}</span>
                    </div>
                </div>

                <div className={cn(styles['secondPart'], styles["side"])}>
                    <img src={logo} alt="Logo" className={styles['logo']} />
                    <div className={styles['input-container']}>
                        <p className={styles['penis']}>{t("Username")}</p>
                        <input 
                            type="text" 
                            placeholder={t("Username")} 
                            className={cn(styles['input-nickname'], {
                                [styles['error']]: nickError
                            })} 
                            value={nickname} 
                            onChange={(e) => setNickname(e.target.value.replace(/\s/g, ''))} 
                        />
                        <p className={styles['penis']}>{t("Password")}:</p>

                        
                        <div className={styles['pass-container']}>
                    <input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t("Password")} 
                        className={cn(styles['input-password'], {
                            [styles['error']]: passError
                        })} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                   
                    <button className={styles['eye-btn']} onClick={() => setShowPassword(!showPassword)}> {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}</button>
                    </div>

                        
                    </div>
                    <div className={styles["checkboxAndText"]}>
                        <input className={styles["agreement"]} type='checkbox' /> 
                        <span className={styles['penis']}>{t("IAgreeWith")} <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">{t("TermsOfTheAgreement")}</a> {t("WeDoNotHaveIt")}</span>
                    </div>
                    <div className={styles['btn-container']}>
                        <button className={styles['btn-login']} onClick={setRegistration}>{isLoading ? (
						<div className={styles["preloader"]}>
						<div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
						<div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
						<div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
						</div>
					) : (
						'Зарегистрироваться'
					)}</button>
                    </div>
                    <img className={styles["ohman"]} src="https://community.fastly.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSIYhY_9XEDYOMNRBsMoGuuOgceXob50kaxV_PHjMO1MHaEqgQkrdOhuQmoEkryysPhrSAN7af9P_A7daLAVz_Elrkh4-I5HXDilkp_sG6Gz9avJWXXMFE9i_1otw/96fx96f?allow_animated=1"/>
                </div>
            </div>
        </div>
    )
}