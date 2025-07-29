import cn from 'classnames'
import { ChangeEvent, DragEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../../../../store/userStore'
import styles from './Profile.module.css'
import notFoundImg from "../../../assets/avatar.png"
// icons
import { AiOutlineSave } from 'react-icons/ai'
import { FaRegSave } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { LuPencil } from 'react-icons/lu'
import { IUser, ILeaderboard } from '../../../../interfaces/IUser-model'
import logo from '../../../assets/logo.png'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import WhenIsTheError from '../../../components/WhenIsTheError/WhenIsTheError'

export default function Profile() {
	const navigate = useNavigate()
	const [userInf, setUserInf] = useState<IUser | null>(null)

	const checkAuth = useUserStore(state => state.checkAuth)
	const { user, setAvatar, setError } = useUserStore()
	const { t } = useTranslation()

	useEffect(() => {
		async function checkAuthFunc(): Promise<void> {
			try {
				await checkAuth()
			} catch (error) {
				console.log(error)
			}
		}
		checkAuthFunc()
	}, [])

	useEffect(() => {
		if (user) {
			setUserInf(user)
			if (userInf) {
				setUserNick(userInf.username)
				setUserName(userInf.name)
				setUserSurname(userInf.surname)
			}
		}
	}, [user])

	const [userNickChange, setUserNickChange] = useState(false)
	const [userNick, setUserNick] = useState('')

	const nicknameChange = useUserStore(state => state.nicknameChange)
	async function nickNameChangeSave(nickname: string, userId: string): Promise<void> {
		if (userInf) {
			try {
				await nicknameChange(nickname, userId)
				setUserInf({ ...userInf, username: nickname })
				setUserNickChange(false)
			} catch (error) {
				console.log(error)
			}
		}
	}

	const surnameChange = useUserStore(state => state.surnameChange)

	const [userSurnameChange, setUserSurnameChange] = useState<boolean>(false)
	const [userSurname, setUserSurname] = useState<string>('')
	async function surnameChangeSave(userSurname: string, userId: string): Promise<void> {
		if (userInf) {
			try {
				await surnameChange(userSurname, userId)
				setUserInf({ ...userInf, surname: userSurname })
				setUserSurnameChange(false)
			} catch (error) {
				console.log(error)
			}
		}
	}
	const nameChange = useUserStore(state => state.nameChange)

	const [userNameChange, setUserNameChange] = useState(false)
	const [userName, setUserName] = useState('')
	async function nameChangeSave(userName: string, userId: string) {
		if (userInf) {
			try {
				await nameChange(userName, userId)
				setUserInf({ ...userInf, name: userName })
				setUserNameChange(false)
			} catch (error) {
				console.log(error)
			}
		}
	}

	const fileRef = useRef<HTMLInputElement>(null)
	const [fileURL, setFileURL] = useState<string | null>(null)
	const [dragging, setDragging] = useState<boolean>(false)
	const [saveSvg, setSaveSvg] = useState<boolean>(false)
	const [fileInput, setFileInput] = useState<File | null>(null)

	const handleDragOver = (e: DragEvent) => {
		e.preventDefault()
		setDragging(true)
	}

	const handleDragLeave = () => {
		setDragging(false)
	}

	const handleDrop = (e: DragEvent) => {
		e.preventDefault()
		setDragging(false)
		const file = e.dataTransfer.files[0]
		handleFileUpload(file)
	}

	const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files && files.length > 0) {
			const file = files[0]
			handleFileUpload(file)
		}
	}

	const handleFileUpload = (file: File) => {
		if (file.size > 1024 * 1024 * 4) {
			setError(`${t('filesize')}`)
			return
		}
		if (
			[
				'image/png',
				'image/jpeg',
				'image/jpg',
				'image/gif',
				'image/webp'
			].includes(file.type)
		) {
			setFileInput(file)
			setFileURL(URL.createObjectURL(file))
		} else {
			setError(`${t('filetype')}`)
		}
	}

	const handleFileLabelClick = () => {
		if (fileRef.current && !saveSvg) {
			fileRef.current.click()
		}
	}

	const [save, setSave] = useState(false)
	const handleSaveImg = async () => {
		const formData = new FormData()
		if (fileInput) {
			formData.append('avatar', fileInput)
			try {
				if (saveSvg) {
					return
				}
				await setAvatar(formData)
				setSave(true)
				setSaveSvg(true)
				setTimeout(() => {
					setSaveSvg(false)
					setSave(false)
				}, 2000)
			} catch (error) {
				console.log(error)
			}
		} else {
			setError(`${t('savefile')}`)
		}
	}

	const logout = useUserStore(state => state.logout)
	async function Logout() {
		try {
			await logout()
			window.location.href = '/'
		} catch (error) {
			console.log(error)
		}
	}
	const DeleteUser = useUserStore(state => state.deleteUser)
	async function deleteUser() {
		try {
			await DeleteUser()
			window.location.href = '/registration'
		} catch (error) {
			console.log(error)
		}
	}
    const [showPassword, setShowPassword] = useState(false)
	const [showPassword2, setShowPassword2] = useState(false)
	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [passwordError1, setPasswordError1] = useState(false)
	const [passwordError2, setPasswordError2] = useState(false)
	const [allDone, setAllDone] = useState(false)
	const [changePasswordState, setChangePasswordState] = useState(false)
	const newPasswordStore = useUserStore(state => state.newPassword)
	function changePassword() {
		setChangePasswordState(true)
	}
     async function handleResetPassword() {
		if (userInf) {
			try{
				const email = userInf.email
				await newPasswordStore(oldPassword, newPassword, email)
				setAllDone(true)
				setTimeout(() => {
					setChangePasswordState(false)
					setOldPassword('')
					setNewPassword('')
					setPasswordError1(false)
					setPasswordError2(false)
					setAllDone(false)
				}, 1500)
				
			}catch(error: any) {
				if (error.message === 'Неверный пароль') {
					setPasswordError1(true)
				}else if (error.message === 'Новый пароль должен содержать минимум 6 символов, максимум 20' || error.message === 'Новый пароль содержать буквы (английские или русские), и цифры') {
					setPasswordError2(true)
				}else{
					console.log(error)
				}
				setTimeout(() => {
					setPasswordError1(false)
					setPasswordError2(false)
				}, 3000)
	
			}
		}
	}

	return (
        <>
		  <WhenIsTheError />
        <div className={changePasswordState ? styles['change-password-container'] : styles['change-password-container-desabled']}>


		<div className={!allDone ? styles['content'] : styles['content-done']}>
         <img src={logo} alt='Logo' className={styles['logo']} />
          <h1 className={styles['title']}>{t("ChangePassword")}</h1>
          <div className={styles['input-container']}>
        <p className={styles['penis']}>{t("OldPassword")}:</p>
        <div className={styles['pass-container']}>
          <input
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={!passwordError1 ? styles['input-password'] : styles['input-password-error']}
            type={showPassword ? 'text' : 'password'}
            placeholder={t("EnterOldPassword")}
          />
          <button
	className={styles['eye-btn']}
	onClick={() => setShowPassword(!showPassword)}
>
	{' '}
	{showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
</button>
        </div>
          	<p className={styles['penis']}>{t("NewPassword")}:</p>
          	<div className={styles['pass-container']}>
          	<input
				value={newPassword}
				onChange={(e) => setNewPassword(e.target.value)}
				className={!passwordError2 ? styles['input-password'] : styles['input-password-error']}
				type={showPassword2 ? 'text' : 'password'}
				placeholder={t("EnterNewPassword")}
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
            {t("SaveNewPassword")}
          </button>
		  <button className={styles['btn1']} onClick={() => setChangePasswordState(false)}>{t("Cancel")}</button>
        </div>


		</div>


		<div className={styles['settings-selected-item']}>
			<p className={styles['tipoH1']}>{t('Profile')}</p>
			<div className={styles['profile-content']}>
				<div className={styles['content-item-1']}>
					<div className={styles['image-wrapper']}>
						<div className={styles['avatar']}>
							<img
								src={fileURL ? fileURL : userInf?.avatar ? userInf?.avatar : notFoundImg}
								className={
									!save ? styles['profile-img'] : styles['profile-img-saved']
								}
							/>
							<button
								className={styles['profile-circle-btn']}
								onClick={handleSaveImg}
							>
								<FaRegSave />
							</button>
							<div
								className={cn(styles['darkAvatar'], {
									[styles['is-active']]: dragging
								})}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDrop={handleDrop}
								onClick={handleFileLabelClick}
							>
								{t('Photo')}
								<input
									ref={fileRef}
									name='avatar'
									type='file'
									accept='image/jpeg, image/png, image/jpg, image/gif, image/webp'
									className={styles['file-input']}
									onChange={handleFileInputChange}
								/>
							</div>
						</div>
					</div>
					{userInf && (
						<>
							{userNickChange ? (
								<input
									className={styles['profile-nick-input']}
									value={userNick}
									onChange={e => setUserNick(e.target.value)}
									type='text'
								/>
							) : (
								<p className={styles['profile-nick']}>
									{userInf.username.length > 10
										? userInf.username.substring(0, 10) + '...'
										: userInf.username}
								</p>
							)}
							{!userNickChange ? (
								<button
									className={styles['profile-btn-1']}
									onClick={() => setUserNickChange(true)}
								>
									<LuPencil /> {t('Change')}
								</button>
							) : (
								<div className={styles['profile-content-1']}>
									<button
										className={styles['profile-btn-1-save']}
										onClick={() => nickNameChangeSave(userNick, userInf.id)}
									>
										<AiOutlineSave /> {t('Save')}
									</button>
									<button
										className={styles['profile-btn-1-cancel']}
										onClick={() => setUserNickChange(false)}
									>
										<IoMdClose /> {t('Cancel')}
									</button>
								</div>
							)}
						</>
					)}
				</div>
				<div className={styles['content-item-2']}>
					{userInf && (
						<>
							<div className={styles['profile-name-div']}>
								<div className={styles['profile-name-content']}>
									<p className={styles['profile-name-text']}>{t('Name')}</p>
									{userNameChange ? (
										<input
											className={styles['profile-name-input']}
											value={userName}
											onChange={e => setUserName(e.target.value)}
											type='text'
										/>
									) : (
										<p className={styles['profile-name']}>{userInf.name.length > 12
											? userInf.name.substring(0, 12) + '...'
											: userInf.name}</p>
									)}
								</div>
								{!userNameChange ? (
									<button
										className={styles['profile-btn-2']}
										onClick={() => setUserNameChange(true)}
									>
										<LuPencil /> {t('Change')}
									</button>
								) : (
									<div className={styles['profile-btn-2-div']}>
										<button
											className={styles['profile-btn-2-save']}
											onClick={() => {
												nameChangeSave(userName, userInf.id)
											}}
										>
											<AiOutlineSave /> {t('Save')}
										</button>
										<button
											className={styles['profile-btn-2-cancel']}
											onClick={() => {
												setUserName(userInf.name)
												setUserNameChange(false)
											}}
										>
											<IoMdClose /> {t('Cancel')}
										</button>
									</div>
								)}
							</div>
							<div className={styles['profile-surname-div']}>
								<div className={styles['profile-surname-content']}>
									<p className={styles['profile-surname-text']}>{t('Surname')}</p>
									{userSurnameChange ? (
										<input
											className={styles['profile-surname-input']}
											value={userSurname}
											onChange={e => setUserSurname(e.target.value)}
											type='text'
										/>
									) : (
										<p className={styles['profile-surname']}>{userInf.surname.length > 12
											? userInf.surname.substring(0, 12) + '...'
											: userInf.surname}</p>
									)}
								</div>
								{!userSurnameChange ? (
									<button
										className={styles['profile-btn-2']}
										onClick={() => setUserSurnameChange(true)}
									>
										<LuPencil /> {t('Change')}
									</button>
								) : (
									<div className={styles['profile-btn-2-div']}>
										<button
											className={styles['profile-btn-2-save']}
											onClick={() => {
												surnameChangeSave(userSurname, userInf.id)
											}}
										>
											<AiOutlineSave /> {t('Save')}
										</button>
										<button
											className={styles['profile-btn-2-cancel']}
											onClick={() => {
												setUserSurname(userInf.surname)
												setUserSurnameChange(false)
											}}
										>
											<IoMdClose /> {t('Cancel')}
										</button>
									</div>
								)}
							</div>	
						</>
					)}
					<div className={styles['profile-email-div']}>
						<div className={styles['profile-email-content']}>
							<p className={styles['profile-email-text']}>{t('Email')}</p>
							<p className={styles['profile-email']}>{userInf?.email}</p>
						</div>
					</div>
					<div className={styles['profile-password-div']}>
						<div className={styles['profile-password-content']}>
							<p className={styles['profile-password-text']}>{t("Password")}</p>
					</div>
					<button 
					className={styles['profile-btn-2']}
					onClick={changePassword}
					><LuPencil /> {t("Change")}</button>
					
					</div>


				</div>
			</div>

			<p className={styles['tipoH1']}>{t('QuizInf')}</p>
			{userInf && userInf.leaderboard && userInf.leaderboard.length > 0 ? (
				<div className={styles['profile-content-2']}>
					{userInf.leaderboard.map((quiz: ILeaderboard) => (
						<div className={styles['quiz-bubub']} key={quiz.quizId}>
							<div className={styles['pointsAndOther']}>
							<p className={styles['quiz-name-bubub']}>{quiz.quiz_name}</p>
								<p className={styles['points-bubub']}>{t('Points')} {quiz.score}</p>
							</div>
							<button
									className={styles['findQuiz']}
									onClick={() => navigate(`/quiz/${quiz.quizId}`)}
								>
									{' '}
									{t('ToQuiz')}
								</button>
						</div>
					))}
				</div>
			): <h3 style={{color: "white"}}>Их нет</h3>}

			<p className={styles['tipoH1']}>{t('Exit/Delete')}</p>
			<div className={styles['profile-content-3']}>
				<button className={styles['profile-btn-delete']} onClick={deleteUser}>
					{t('DeleteProf')}
				</button>
				<button className={styles['profile-btn-logout']} onClick={Logout}>
					{t('Exit')}
				</button>
			</div>
		</div>
		</>
	)
}