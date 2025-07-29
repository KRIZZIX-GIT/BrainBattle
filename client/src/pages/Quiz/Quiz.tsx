import axios from 'axios'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaRegComment, FaRegHeart } from 'react-icons/fa'
import { IoSend } from 'react-icons/io5'
import { MdOutlineLeaderboard } from 'react-icons/md'
import { useNavigate, useParams } from 'react-router-dom'
import Snowfall from 'react-snowfall'
import { useLobbyStore } from '../../../store/lobbyStore'
import { quizzesStore } from '../../../store/quizzesStore'
import { useSettingsStore } from '../../../store/settingsStore'
import { useUserStore } from '../../../store/userStore'
import Header from '../../components/Header/Header'
import Preloader from '../../components/preloader/preloader'
import WhenIsTheError from '../../components/WhenIsTheError/WhenIsTheError'
import { PREFIX } from '../../config/api.config'
import styles from './Quiz.module.css'
import notFound from "../../assets/avatar.png"
import { IQuizzes } from '../../../interfaces/IQuizzez-model'
import notFoundImg from "../../assets/avatar.png"

function QuizPage() {
	const [quiz, setQuizInfo] = useState<IQuizzes | undefined>(undefined)
	const [isLoading, setIsLoading] = useState<boolean>(true)
	const [comment, setComment] = useState<string>('')
	const { setError } = useUserStore()
	const { quizId } = useParams<{ quizId: string }>()
	const { quizById, addLike, addComment } = quizzesStore()
	const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({})
	const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})
	const [activeTab, setActiveTab] = useState<'comments' | 'leaderboard'>(
		'comments'
	)
	const navigate = useNavigate()
	const { user } = useUserStore()
	const { setChoosedQuiz } = useLobbyStore()
	const { theme } = useSettingsStore()
	const { t } = useTranslation()

	useEffect(() => {
		const fetchQuizzes = async (): Promise<void> => {
			try {
				setIsLoading(true)
				if (quizId && user) {
					const res = await quizById(quizId)
					if (!res) {
						setQuizInfo(undefined)
					} else {
						setQuizInfo({
							...res, 
							isLiked: res.likes.includes(user.id)
						} as IQuizzes)
					}
				}
			} catch (error) {
				setQuizInfo(undefined)
			} finally {
				setIsLoading(false)
			}
		}
		fetchQuizzes()
	}, [quizId, user])

	const handleTranslate = async (quizName: string): Promise<void> => {
		if (!translatedTexts[quizName]) {
			try {
				const response = await axios.post(`${PREFIX}/api/translate`, {
					text: quizName
				})
				setTranslatedTexts(prev => ({ ...prev, [quizName]: response.data }))
			} catch (error) {
				setError(t('TranslateErr'))
			}
		}
	}

	const toggleText = (quizName: string):void => {
		setShowOriginal(prev => ({
			...prev,
			[quizName]: !prev[quizName]
		}))
	}

	const addCommentRight = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault()
		if (!user?.isActivated) {
			setError(`${t('ActEmailComm')}`)
			return
		}
		if (!quizId || !comment) return
		const userComment = comment
		setComment('')
		const res = await addComment(userComment, quizId)
		if (res) {
			setQuizInfo(prevQuiz => {
				if (!prevQuiz) return prevQuiz

				return {
					...prevQuiz,
					comments: [...prevQuiz.comments, res]
				}
			})
		}
	}

	const handleLikeClick = async (quizId: string): Promise<void> => {
		try {
			if (!user?.isActivated) {
				setError(`${t('ActEmailLike')}`)
				return
			}
			const response = await addLike(quizId)

			if (quiz) {
				setQuizInfo(prevQuiz => {
					if (!prevQuiz) return undefined

					const updatedQuiz: IQuizzes = {
						...prevQuiz,
						likes:
							response.msg === 'like'
								? [...prevQuiz.likes, response.userId]
								: prevQuiz.likes.filter(like => like !== response.userId),
						isLiked: !prevQuiz.isLiked
					}

					return updatedQuiz
				})
			}
		} catch (error) {
			setError(t('ChangeLikeErr'))
		}
	}

	const handleCreateLobby = (quiz: IQuizzes): void => {
		setChoosedQuiz(quiz)
		navigate('/party')
	}

	const handleTabChange = (tab: 'comments' | 'leaderboard'): void => {
		setActiveTab(tab)
	}
	function truncateText(text: string, maxLength: number): string {
		if (!text) return ''
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
	}

	return (
		<div
			className={
				theme === 'dark' ? styles['container-dark'] : styles['container-light']
			}
		>
			<WhenIsTheError />
			<Header />
			<Snowfall style={{ position: 'fixed' }} />

			<Preloader isLoad={isLoading} text={t('QuizLoad')} />
			{!isLoading && quiz ? (
				<div className={styles['Quiz-block']}>
					<div className={styles['content1']}>
						<img
							src={quiz.image}
							alt={quiz.quiz_name}
							className={styles['imageCategory']}
						/>
						<div className={styles['otherContent']}>
							<div className={styles['quizName']}>
								{showOriginal[quiz.quiz_name]
										? truncateText(quiz.quiz_name, 30) 
										: truncateText(translatedTexts[quiz.quiz_name] || quiz.quiz_name, 30)}
							</div>
							<div className={styles['quizInfo']}>
								<span className={styles['user']}>
									{`${t('FromDb')}: ` + quiz.TYPE}
								</span>
								{!translatedTexts[quiz.quiz_name] ? (
									<button
										onClick={() => handleTranslate(quiz.quiz_name)}
										className={styles['translate-button']}
									>
										{t('Translate')}
									</button>
								) : (
									<button
										onClick={() => toggleText(quiz.quiz_name)}
										className={styles['translate-button']}
									>
										{showOriginal[quiz.quiz_name]
											? `${t('Translate')}`
											: `${t('Original')}`}
									</button>
								)}
							</div>
							<div className={styles['footer']}>
								<span
									className={cn(styles['likes'], {
										[styles['liked']]: quiz.isLiked
									})}
									onClick={() => handleLikeClick(quiz._id)}
								>
									<FaRegHeart /> {quiz.likes.length}
								</span>
								<span className={styles['comments']}>
									<FaRegComment /> {quiz.comments.length}
								</span>
								{quiz.leaderboard && (
									<span className={styles['comments']}>
										<MdOutlineLeaderboard /> {quiz.leaderboard.length}
									</span>
								)}
							</div>
							<button
								className={styles['create-lobby']}
								onClick={() => handleCreateLobby(quiz)}
							>
								{t('LobbyCreate')}
							</button>
						</div>
					</div>
					{quiz && quiz.leaderboard && quiz.leaderboard.length > 0 && (
						<div className={styles['tabs']}>
							<button
								className={cn(styles['tab'], {
									[styles['active']]: activeTab === 'comments'
								})}
								onClick={() => handleTabChange('comments')}
							>
								{t('Comments')}
							</button>
							<button
								className={cn(styles['tab'], {
									[styles['active']]: activeTab === 'leaderboard'
								})}
								onClick={() => handleTabChange('leaderboard')}
							>
								{t('LeaderBoard')}
							</button>
						</div>
					)}
					<div className={styles['tab-content']}>
						{(quiz.leaderboard && quiz.leaderboard.length === 0) ||
						activeTab === 'comments' ? (
							<div className={styles['commentsContainer']}>
								<p className={styles['title']}>{t('Comments')}</p>
								<form
									onSubmit={addCommentRight}
									className={styles['addComment']}
								>
									<input
										className={styles['writeComment']}
										value={comment}
										onChange={e => setComment(e.target.value)}
										placeholder={t('CommentWrite')}
										maxLength={150}
									/>
									<button type='submit' className={styles['submitComment']}>
										<IoSend />
									</button>
								</form>
								{quiz.comments.length > 0 ? (
									[...quiz.comments].reverse().map(comment => (
										<div className={styles['comment']} key={comment._id}>
											<img src={comment.avatar ? comment.avatar : notFound} alt='User Avatar' />
											<div className={styles['NicknameAndComment']}>
												<p className={styles['comment-username']}>
													{comment.username}
												</p>
												<p className={styles['comment-comment']}>
													{comment.comment}
												</p>
											</div>
										</div>
									))
								) : (
									<p>{t('NoComments')} :(</p>
								)}
							</div>
						) : (
							<div className={styles['leaderboardContainer']}>
								<p className={styles['title']}>{t('LeaderBoard')}</p>
								{quiz.leaderboard && quiz.leaderboard.length > 0 ? (
									<ul className={styles['leaderboardList']}>
										{quiz.leaderboard
											.sort((a, b) => b.score - a.score)
											.map((entry, index) => (
												<li key={index} className={styles['leaderboard-entry']}>
													<span className={styles["usernameAndAvatar"]}>
														{index + 1}. <img src={entry.avatar ? entry.avatar : notFoundImg} />{' '}
														{entry.username}
													</span>
													<span>
														{entry.score} {t('Points')}
													</span>
												</li>
											))}
									</ul>
								) : (
									<p>{t('LeaderBoardEmpty')} :(</p>
								)}
							</div>
						)}
					</div>
				</div>
			) : !isLoading ? (
				<h1 style={{ color: 'white' }}>{t('NothingFound')}</h1>
			) : null}
		</div>
	)
}

export default QuizPage