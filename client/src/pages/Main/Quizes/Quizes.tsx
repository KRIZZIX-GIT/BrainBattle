import axios from 'axios'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronLeft, FaChevronRight, FaFilter, FaRegComment, FaRegHeart} from 'react-icons/fa'
import { FaSort } from 'react-icons/fa6'
import { IoMdClose } from 'react-icons/io'
import { MdGTranslate, MdOutlineLeaderboard } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useLobbyStore } from '../../../../store/lobbyStore'
import { quizzesStore } from '../../../../store/quizzesStore'
import { useUserStore } from '../../../../store/userStore'
import Preloader from '../../../components/preloader/preloader'
import styles from './Quizes.module.css'
import { IQuizzes } from '../../../../interfaces/IQuizzez-model'
import { PREFIX } from '../../../config/api.config'

function Quizes() {
	const [quizzes, setQuizzes] = useState<IQuizzes[]>([])
	const [currentPage, setCurrentPage] = useState<number>(1)
	const [totalPages, setTotalPages] = useState<number>(1)
	const { user, setError } = useUserStore()
	const { getQuizzes, addLike } = quizzesStore()
	const { setChoosedQuiz } = useLobbyStore()
	const nav = useNavigate()
	const { t } = useTranslation()
	const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({})
	const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})

	const [openSort, setOpenSort] = useState(false)
	const [openFilter, setOpenFilter] = useState(false)
	const [sortType, setSortType] = useState<string>('classic')
	const [selectedType, setSelectedType] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchQuizzes = async (): Promise<void> => {
			try {
				const pageSize = 20
				const data = await getQuizzes(
					currentPage,
					pageSize,
					sortType,
					selectedType ?? undefined
				)
				setQuizzes(data.quizzes)
				setTotalPages(data.totalPages)
				if (user) {
					setQuizzes(prevQuizzes =>
						prevQuizzes.map(quiz => ({
							...quiz,
							isLiked: quiz.likes.includes(user.id)
						}))
					)
				}
			} catch (error) {
				setError('Ошибка при загрузке викторин')
			} finally {
				setLoading(false)
			}
		}
	
			fetchQuizzes()
	}, [currentPage, sortType, user, selectedType])

	const handleTranslate = async (quizName: string): Promise<void> => {
		if (!translatedTexts[quizName]) {
			try {
				const response = await axios.post(
					`${PREFIX}/api/translate`,
					{ text: quizName }
				)
				setTranslatedTexts(prev => ({ ...prev, [quizName]: response.data }))
			} catch (error) {
				setError('Ошибка перевода')
			}
		}
	}

	const toggleText = (quizName: string): void => {
		setShowOriginal(prev => ({
			...prev,
			[quizName]: !prev[quizName]
		}))
	}

	const handleLikeClick = async (quizId: string): Promise<void> => {
		try {
			if (!user?.isActivated) {
				setError('подтвердите почту для доступа к лайкам')
				return
			}
			const response = await addLike(quizId)
			setQuizzes(prevQuizzes =>
				prevQuizzes.map(quiz =>
					quiz._id === quizId
						? {
								...quiz,
								likes:
									response.msg === 'like'
										? [...quiz.likes, response.userId]
										: quiz.likes.filter(like => like !== response.userId),
								isLiked: !quiz.isLiked
						  }
						: quiz
				)
			)
		} catch (error) {
			setError('Ошибка при добавлении/удалении лайка')
		}
	}

	const goToNextPage = (): void => {
		if (currentPage < totalPages) {
			setCurrentPage(prev => prev + 1)
		}
	}

	const handleFilterByType = (type: string | null): void => {
		setSelectedType(type)
		setCurrentPage(1)
	}
	function truncateText(text: string, maxLength: number): string {
		if (!text) return ''
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
	}
	const goToPreviousPage = (): void => {
		if (currentPage > 1) {
			setCurrentPage(prev => prev - 1)
		}
	}

	const handleCreateLobby = (quiz: IQuizzes): void => {
		setChoosedQuiz(quiz)
		nav('/party')
	}

	return (
		<div className={styles['block']}>
			<Preloader isLoad={loading} text={t('QuizzesLoad')} />
			<div className={styles['title-content']}>
				{quizzes.length > 0 && (
					<div
						onClick={() => setOpenSort(!openSort)}
						className={
							!openSort ? styles['sort-block'] : styles['sort-block-open']
						}
					>
						{!openSort ? (
							<>
								<FaSort /> {t('Sorting')}
							</>
						) : (
							<ul className={styles['sort-list']}>
								<li
									className={styles['sort-item']}
									onClick={() => setSortType('classic')}
								>
									{t('Default')}
								</li>
								<li
									className={styles['sort-item']}
									onClick={() => setSortType('date')}
								>
									{t('SortNew')}
								</li>
								<li
									className={styles['sort-item']}
									onClick={() => setSortType('comments')}
								>
									{t('SortComm')}
								</li>
								<li
									className={styles['sort-item']}
									onClick={() => setSortType('likes')}
								>
									{t('SortLikes')}
								</li>
							</ul>
						)}
					</div>
				)}
				<h1 className={styles['title']}>{t('QuizList')}</h1>

				{quizzes.length > 0 && (
					<div
						onClick={() => setOpenFilter(!openFilter)}
						className={
							!openFilter ? styles['filter-block'] : styles['filter-block-open']
						}
					>
						{!openFilter ? (
							<>
								<FaFilter /> {t('Filter')}
							</>
						) : (
							<ul className={styles['filter-list']}>
								<li
									className={styles['filter-item']}
									onClick={() => handleFilterByType(null)}
								>
									{t('NoFilter')}
								</li>
								<li
									className={cn(styles['filter-item'], {
										[styles['active']]: selectedType === 'OpenTDB'
									})}
									onClick={() => handleFilterByType('OpenTDB')}
								>
									OpenTDB
								</li>
								<li
									className={cn(styles['filter-item'], {
										[styles['active']]: selectedType === 'the-trivia-api'
									})}
									onClick={() => handleFilterByType('the-trivia-api')}
								>
									the-trivia-api
								</li>
								<li
									className={cn(styles['filter-item'], {
										[styles['active']]: selectedType === 'quizapi'
									})}
									onClick={() => handleFilterByType('quizapi')}
								>
									quizapi
								</li>
								<li
									className={cn(styles['filter-item'], {
										[styles['active']]: selectedType === 'Workshop'
									})}
									onClick={() => handleFilterByType('Workshop')}
								>
									Workshop
								</li>
							</ul>
						)}
					</div>
				)}
			</div>

			<div className={styles['quizGrid']}>
				{quizzes.length > 0 ? (
					quizzes.map(quiz => (
						<div key={quiz._id} className={styles['Quiz-block']}>
							{!translatedTexts[quiz.quiz_name] && (
								<button
									onClick={() => handleTranslate(quiz.quiz_name)}
									className={styles['translate-button']}
								>
									<MdGTranslate />
								</button>
							)}
							{translatedTexts[quiz.quiz_name] && (
								<button
									onClick={() => toggleText(quiz.quiz_name)}
									className={styles['translate-button']}
								>
									{showOriginal[quiz.quiz_name] ? (
										<MdGTranslate />
									) : (
										<IoMdClose />
									)}
								</button>
							)}
							<div className={styles['quiz-text-container']}>
								<h2 className={styles['textAndTranslate']}>
									{showOriginal[quiz.quiz_name]
										? truncateText(quiz.quiz_name, 30)
										: truncateText(
												translatedTexts[quiz.quiz_name] || quiz.quiz_name,
												30
										  )}
								</h2>
							</div>

							<span className={styles['user']}>
								{`${t('FromDb')}: ` + quiz.TYPE}
							</span>
							<img
								src={quiz.image}
								alt={quiz.quiz_name}
								className={styles['imageCategory']}
							/>

							<div className={styles['footer']}>
								<p
									className={cn(styles['likes'], {
										[styles['liked']]: quiz.isLiked
									})}
									onClick={() => handleLikeClick(quiz._id)}
								>
									<FaRegHeart /> {quiz.likes.length}
								</p>
								{quiz.leaderboard && quiz.leaderboard.length > 0 && (
									<p
										className={styles['comments']}
										onClick={() => nav(`/quiz/${quiz._id}`)}
									>
										<MdOutlineLeaderboard /> {quiz.leaderboard.length}
									</p>
								)}
								<p
									className={styles['comments']}
									onClick={() => nav(`/quiz/${quiz._id}`)}
								>
									<FaRegComment /> {quiz.comments.length}
								</p>
							</div>
							<button
								className={styles['create-lobby']}
								onClick={() => handleCreateLobby(quiz)}
							>
								{t('CreateLobby')}
							</button>
						</div>
					))
				) : (
					<p className={styles['notFound']}>{t('NoQuiz')}</p>
				)}
			</div>

			<div className={styles['pagination']}>
				<button
					onClick={goToPreviousPage}
					disabled={currentPage === 1}
					className={styles['pagination-button']}
				>
					<FaChevronLeft />
				</button>
				<span className={styles['page-info']}>
					{t('Page')} {currentPage} {t('Of')} {totalPages}
				</span>
				<button
					onClick={goToNextPage}
					disabled={currentPage === totalPages} 
					className={styles['pagination-button']}
				>
					<FaChevronRight />
				</button>
			</div>
		</div>
	)
}

export default Quizes