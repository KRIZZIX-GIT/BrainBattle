import axios from 'axios'
import { motion } from 'framer-motion'
import he from 'he'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoMdClose } from 'react-icons/io'
import { MdGTranslate } from 'react-icons/md'
import styles from './QuestionContainer.module.css'
import { PREFIX } from '../../config/api.config'
import { useUserStore } from '../../../store/userStore'

interface IQuistion {
	question: string
	answers: string[]
}

interface QuestionContainerProps {
	showResults: boolean
	question: IQuistion | null
	youChoose: boolean
	timerActive: boolean
	timer: number
	handleAnswer: (answer: string) => void
}

function QuestionContainer({showResults,question,youChoose,timerActive,timer,handleAnswer}: QuestionContainerProps) {
	const { t } = useTranslation()
	const { setError } = useUserStore()
	const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({})
	const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({})

	const handleTranslate = async (e: React.MouseEvent<HTMLButtonElement>,quizName: string): Promise<void> => {
		e.stopPropagation()
		if (!translatedTexts[quizName]) {
			try {
				const response = await axios.post(
					`${PREFIX}/api/translate`,
					{ text: quizName }
				)
				setTranslatedTexts(prev => ({ ...prev, [quizName]: response.data }))
			} catch (error) {
				setError(t('TranslateErr'))
			}
		}
	}

	const toggleText = (e: React.MouseEvent<HTMLButtonElement>,quizName: string): void => {
		e.stopPropagation()
		setShowOriginal(prev => ({
			...prev,
			[quizName]: !prev[quizName]
		}))
	}

	return (
		<>
			{!showResults && question && !youChoose && (
				<div className={styles['question-container']}>
					{timerActive && (
						<div className={styles['timer-container']}>
							<motion.svg
								initial={{ opacity: 0, y: -100 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								className={styles['timer-circle']}
								width='100'
								height='100'
								viewBox='0 0 100 100'
							>
								<motion.circle
									cx='50'
									cy='50'
									r='45'
									stroke='white'
									strokeWidth='5'
									fill='none'
									strokeDasharray='283' 
									animate={{ strokeDashoffset: 283 * (1 - timer / 40) }}
									transition={{ duration: 1, ease: 'linear' }}
								/>
							</motion.svg>
							<motion.span
								initial={{ opacity: 0, y: -100 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
								className={styles['timer-text']}
								style={{ color: 'white' }}
							>
								{timer}s
							</motion.span>
						</div>
					)}
					<motion.h3
						initial={{ opacity: 0, y: -100 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{!translatedTexts[he.decode(question.question)] && (
							<button
								onClick={e => handleTranslate(e, he.decode(question.question))}
								className={styles['translate-button']}
							>
								<MdGTranslate />
							</button>
						)}
						{translatedTexts[he.decode(question.question)] && (
							<button
								onClick={e => toggleText(e, he.decode(question.question))}
								className={styles['translate-button']}
							>
								{showOriginal[he.decode(question.question)] ? (
									<MdGTranslate />
								) : (
									<IoMdClose />
								)}
							</button>
						)}
						{showOriginal[he.decode(question.question)]
							? he.decode(question.question)
							: translatedTexts[he.decode(question.question)] ||
							  he.decode(question.question)}
					</motion.h3>
					<motion.div
						className={styles['answers-container']}
						initial={{ opacity: 0, y: 100 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						{question.answers.map((answer: string, idx: number) => (
							<div
								key={idx}
								onClick={() => handleAnswer(answer)}
								className={styles['answerButton']}
							>
								{!translatedTexts[he.decode(answer)] && (
									<button
										onClick={e => handleTranslate(e, he.decode(answer))}
										className={styles['translate-button']}
									>
										<MdGTranslate />
									</button>
								)}
								{translatedTexts[he.decode(answer)] && (
									<button
										onClick={e => toggleText(e, he.decode(answer))}
										className={styles['translate-button']}
									>
										{showOriginal[he.decode(answer)] ? (
											<MdGTranslate />
										) : (
											<IoMdClose />
										)}
									</button>
								)}
								{showOriginal[he.decode(answer)]
									? he.decode(answer)
									: translatedTexts[he.decode(answer)] || he.decode(answer)}
							</div>
						))}
					</motion.div>
				</div>
			)}

			{!showResults && question && youChoose && (
				<div className={styles['question-container']}>
					{timerActive && (
						<div className={styles['timer-container']}>
							<motion.svg
								className={styles['timer-circle']}
								width='100'
								height='100'
								viewBox='0 0 100 100'
							>
								<motion.circle
									cx='50'
									cy='50'
									r='45'
									stroke='white'
									strokeWidth='5'
									fill='none'
									strokeDasharray='283' // Длина окружности (2 * π * радиус)
									animate={{ strokeDashoffset: 283 * (1 - timer / 40) }}
									transition={{ duration: 1, ease: 'linear' }}
								/>
							</motion.svg>
							<span
								className={styles['timer-text']}
								style={{ color: timer <= 10 ? 'red' : 'white' }}
							>
								{timer}s
							</span>
						</div>
					)}
					<p className={styles['total']}>{t('Wait')}...</p>
				</div>
			)}
		</>
	)
}

export default QuestionContainer