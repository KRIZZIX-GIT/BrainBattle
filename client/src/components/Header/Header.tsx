import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate } from 'react-router-dom'
import { quizzesStore } from '../../../store/quizzesStore' 
import { useUserStore } from '../../../store/userStore'
import unknownAvatar from '../../assets/avatar.png'
import styles from './Header.module.css'
import { IQuizzes } from "../../../interfaces/IQuizzez-model"
import { IUser } from "../../../interfaces/IUser-model"
import cn from "classnames"

function Header() {
	const [userData, setUserData] = useState<IUser | null>(null)
	const [searchPrompt, setSearchPrompt] = useState<string>('')
	const [searchResults, setSearchResults] = useState<IQuizzes[]>([]) 
	const { user, checkAuth } = useUserStore()
	const { searchQuizzes } = quizzesStore() 
	const navigate = useNavigate()
	const { t } = useTranslation()

	function redirect2(): void {
		navigate('/login')
	}

	useEffect(() => {
		if (user) {
			setUserData(user)
		} else {
			checkAuth()
		}
	}, [user])

	const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		const value = e.target.value
		setSearchPrompt(value)

		if (value) {
			const res = await searchQuizzes(value)
			setSearchResults(res) 
		} else {
			setSearchResults([])
		}
	}

	return (
		<>
			<div className={styles['header']}>
				<p className={styles['logo']}>BrainBattle</p>
				<p className={styles['devider']}>|</p>
				<div className={styles['search']}>
					<input
						type='text'
						className={styles['search-bar']}
						placeholder={t('Search')}
						value={searchPrompt}
						onChange={handleSearchChange}
					/>
					{searchPrompt ? (
						<div className={styles['quizzes']}>
							{searchPrompt && searchResults.length > 0 && (
								<ul className={styles['quiz-list']}>
									{searchResults.map(quiz => (
									   <li key={quiz._id} className={styles['quiz-item']}>
										<NavLink
											to={`/quiz/${quiz._id}`}
											key={quiz._id}
											className={styles['quiz-item-nikitalox']}
										>
											<p className={styles['quiz-title']}>
												{quiz.quiz_name}
											</p>
											<p className={styles['user']}>
												{['OpenTDB', 'quizapi', 'the-trivia-api'].includes(
													quiz.TYPE
												)
													? 'из базы данных: ' + quiz.TYPE
													: 'пользователя: asdasd'}
											</p>
										</NavLink>
										</li>
									))}
								</ul>
							)}
						</div>
					) : (
						''
					)}
				</div>
				<p className={styles['devider']}>|</p>
				<div className={styles['btn-cont']}>
					<div className={styles['btn-cont-2']}>
						<NavLink 
							to='/edit' 
							className={cn(styles['btn'], {
								[styles['notActive']]:!user || user && !user.isActivated,
							})}
							onClick={(e) => {
								if (!user || user && !user.isActivated) { 
									e.preventDefault()
								}
							}}>
							{t('Create')}
						</NavLink>
						<NavLink 
							to='/main' 
							className={cn(styles['btn'], {
								[styles['notActive']]:!user,
							})}
							onClick={(e) => {
								if (!user) { 
									e.preventDefault()
								}
							}}>
							{t('Play')}
						</NavLink>
					</div>
					{userData ? (
						<div className={styles['user']}>
							<NavLink to='/settings' className={styles['user']}>
								<img
									src={userData.avatar ? userData.avatar : unknownAvatar}
									alt='User Avatar'
								/>
								<div className={styles['nameAndUsername']}>
									<p className={styles['username']}>
										{userData.username.length > 10
											? userData.username.substring(0, 10) + '...'
											: userData.username}
									</p>
									<span className={styles['nameAndSurname']}>
										{userData.name.length > 15
											? userData.name.substring(0, 15) + '...'
											: userData.name}{' '}
										{userData.surname.length > 15
											? userData.surname.substring(0, 15) + '...'
											: userData.surname}
									</span>
								</div>
							</NavLink>
						</div>
					) : (
						<button onClick={redirect2} className={styles['btn2']}>
							{t("Enter")}
						</button>
					)}
				</div>
			</div>
			{!userData?.isActivated && userData ? (
				<div className={styles['confirmEmail']}>
					<p>
						Подтвердите указанную почту <b>{userData ? userData.email : ''}</b>
					</p>
				</div>
			) : (
				''
			)}
		</>
	)
}

export default Header