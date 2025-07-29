import cn from 'classnames'
import { ChangeEvent, DragEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoMdOpen } from 'react-icons/io'
import { MdDelete, MdEdit } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import Snowfall from 'react-snowfall'
import { useSettingsStore } from '../../../store/settingsStore'
import { useUserStore } from '../../../store/userStore'
import WhenIsTheError from '../WhenIsTheError/WhenIsTheError'
import { Question } from './../../../interfaces/question-interface'
import { useQuizStore } from './../../../store/questionsStore'
import { quizzesStore } from '../../../store/quizzesStore'
import styles from './QuizEdit.module.css'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface IQuestion {
	title: string
	correctAnswer: string
	incorrectAnswers: string[]
}

function QuizEdit() {
	const { t } = useTranslation()
	const codeString: string = `
  {
    "title": "${t('QuizName')}",
    "questions": [
      {
        "title": "${t('Question')} 1",
        "correctAnswer": "${t('CorrAnswer')}",
        "incorrectAnswers": ["${t('InCorrAnswer')} 1", "${t(
		'InCorrAnswer'
	)} 2", "${t('InCorrAnswer')} 3"]
      },
      {
        "title": "${t('Question')} 2",
        "correctAnswer": "${t('CorrAnswer')}",
        "incorrectAnswers": ["${t('InCorrAnswer')} 1", "${t(
		'InCorrAnswer'
	)} 2", "${t('InCorrAnswer')} 3"]
      },
      {
        "title": "${t('Question')} 3",
        "correctAnswer": "${t('CorrAnswer')}",
        "incorrectAnswers": ["${t('InCorrAnswer')} 1", "${t(
		'InCorrAnswer'
	)} 2", "${t('InCorrAnswer')} 3"]
      }
    ]
  }
   `
	const nav = useNavigate()
	const setQuiz = useQuizStore(state => state.setQuiz)
	const { setError } = useUserStore()
	const { theme } = useSettingsStore()
	const [questions, setQuestions] = useState<Question[]>([])
	const [currentQuestion, setCurrentQuestion] = useState<string>('')
	const [currentAnswer, setCurrentAnswer] = useState<string>('')
	const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null)
	const [showQuestionInput, setShowQuestionInput] = useState<boolean>(false)
	const [showAnswerInput, setShowAnswerInput] = useState<boolean>(false)
	const [editingAnswerIndex, setEditingAnswerIndex] = useState<number | null>(null)
	const { addQuiz } = quizzesStore()
	const [showPublishForm, setShowPublishForm] = useState<boolean>(false)
	const [quizName, setQuizName] = useState<string>('')
	const [quizImage, setQuizImage] = useState<string>('')
	const fileRef = useRef<HTMLInputElement>(null)
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const [fileURL, setFileURL] = useState<string | null>(null)
	const [dragging, setDragging] = useState<boolean>(false)
	const [fileInput, setFileInput] = useState<File | null>(null)
	const [isLoad, setLoad] = useState<boolean>(false)

	const handleDragOver = (e: DragEvent): void => {
		e.preventDefault()
		setDragging(true)
	}

	const handleDragLeave = () => {
		setDragging(false)
	}

	const handleDrop = (e: DragEvent): void => {
		e.preventDefault()
		setDragging(false)
		const file = e.dataTransfer.files[0]
		handleFileUpload(file)
	}

	const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
		const files = e.target.files
		if (files && files.length > 0) {
			const file = files[0]
			handleFileUpload(file)
		}
	}

	const handleFileUpload = (file: File): void => {
		if (file.size > 1024 * 1024 * 4) {
			setError(`${t('filesize')}`)
			return
		}

		if (
			['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)
		) {
			setFileInput(file)
			setFileURL(URL.createObjectURL(file))
		} else {
			setError(`${t('filetype')}`)
		}
	}

	const handleFileLabelClick = (): void => {
		if (fileRef.current) {
			fileRef.current.click()
		}
	}

	const saveQuiz = async (quizData: {title: string, image: string, questions: Question[]}): Promise<void> => {
		const formData = new FormData()
		if (fileInput) {
			formData.append('avatar', fileInput)
			formData.append('title', quizData.title)
			formData.append('questions', JSON.stringify(quizData.questions))

			try {
				const response = await addQuiz(formData, t('SaveQuizErr'))

				if (response._id) {
					nav(`/main`)
				}
			} catch (error) {
				setError(`${t('SaveQuizErr')}`)
				console.error('Error saving quiz:', error)
			}
		}
	}

	const handleSaveQuiz = (): void => {
		if (questions.length < 3) {
			setError(`${t('QuestionsCount')}`)
			return
		}

		const allRight = questions.map((el: Question) => {
			if (!el.correctAnswer && !el.title) {
				return false
			}
			if (el.incorrectAnswers.length == 0) {
				return false
			}
			return true
		})

		if (allRight.includes(false)) {
			setError(t("FillAllQuestions"))
			return
		}

		setShowPublishForm(true)
	}

	const handlePublishQuiz = async (): Promise<void> => {
		if (!quizName.trim() || !fileInput) {
			setError(t("EnterTitleOrImage"))
			return
		}
		if (!isLoad) {
			setLoad(true)
			const quizData = {
				title: quizName,
				image: quizImage,
				questions
			}
	
			try {
				await saveQuiz(quizData)
	
				setShowPublishForm(false)
	
				setQuizName('')
				setQuizImage('')
				setQuestions([])
				setQuiz([])
			} catch (error) {
				console.error('Error publishing quiz:', error)
				setError(t("FailedToSendQuiz"))
			} finally {
				setLoad(false)
			}
		}
	}

	const addQuestion = (): void => {
		if (!currentQuestion.trim()) {
			setError(t('QuestionName'))
			return
		}
		setQuestions([
			...questions,
			{
				title: currentQuestion,

				correctAnswer: '',
				incorrectAnswers: []
			}
		])
		selectQuestion(questions.length)
		setCurrentQuestion('')
		setShowQuestionInput(false)
	}

	const addAnswer = (): void => {
		if (selectedQuestionIndex === null || !currentAnswer.trim()) {
			setError(t('SelectQuestion'))
			return
		}

		if (questions[selectedQuestionIndex].incorrectAnswers.length >= 3) {
			setError(t('OnlyOneCorrectAnswerAndOneIncorrect'))
			return
		}

		const updatedQuestions = [...questions]
		if (questions[selectedQuestionIndex].correctAnswer === '') {
			updatedQuestions[selectedQuestionIndex].correctAnswer = currentAnswer
		} else {
			updatedQuestions[selectedQuestionIndex].incorrectAnswers.push(
				currentAnswer
			)
		}
		setQuestions(updatedQuestions)
		setCurrentAnswer('')
		setShowAnswerInput(false)
	}

	const selectQuestion = (index: number): void => {
		setSelectedQuestionIndex(
			index === selectedQuestionIndex ? selectedQuestionIndex : index
		)
		setShowAnswerInput(false)
		setShowQuestionInput(false)
		setEditingAnswerIndex(null)
	}

	const deleteAnswer = (answerIndex: number): void => {
		if (selectedQuestionIndex === null) return

		const updatedQuestions = [...questions]
		if (answerIndex === 0) {
			updatedQuestions[selectedQuestionIndex].correctAnswer = ''
		} else {
			updatedQuestions[selectedQuestionIndex].incorrectAnswers.splice(
				answerIndex - 1,
				1
			)
		}
		setQuestions(updatedQuestions)
	}

	const editAnswer = (answerIndex: number): void => {
		if (selectedQuestionIndex === null) return

		setEditingAnswerIndex(answerIndex)
		const answerToEdit =
			answerIndex === 0
				? questions[selectedQuestionIndex].correctAnswer
				: questions[selectedQuestionIndex].incorrectAnswers[answerIndex - 1]
		setCurrentAnswer(answerToEdit)
		setShowAnswerInput(true)
	}

	const saveEditedAnswer = (): void => {
		if (selectedQuestionIndex === null || editingAnswerIndex === null) return

		const updatedQuestions = [...questions]
		if (editingAnswerIndex === 0) {
			updatedQuestions[selectedQuestionIndex].correctAnswer = currentAnswer
		} else {
			updatedQuestions[selectedQuestionIndex].incorrectAnswers[
				editingAnswerIndex - 1
			] = currentAnswer
		}

		setQuestions(updatedQuestions)
		setCurrentAnswer('')
		setShowAnswerInput(false)
		setEditingAnswerIndex(null)
	}

	const clearAll = (): void => {
		setQuestions([])
		setCurrentQuestion('')
		setCurrentAnswer('')
		setSelectedQuestionIndex(null)
		setShowQuestionInput(false)
		setShowAnswerInput(false)
		setEditingAnswerIndex(null)
	}

	const [isImporting, setIsImporting] = useState<boolean>(false)

	const importJson = (): void => {
		setIsImporting(false)
		const fileInput = document.createElement('input')
		fileInput.type = 'file'
		fileInput.accept = 'application/json'

		fileInput.onchange = event => {
			const file = (event.target as HTMLInputElement).files?.[0]
			if (file) {
				const reader = new FileReader()
				reader.onload = e => {
					try {
						const jsonData = JSON.parse(e.target?.result as string)

						if (
							jsonData &&
							jsonData.title &&
							Array.isArray(jsonData.questions) &&
							jsonData.questions.every(
								(q: IQuestion) =>
									q.title &&
									typeof q.title === 'string' &&
									q.correctAnswer &&
									typeof q.correctAnswer === 'string' &&
									Array.isArray(q.incorrectAnswers)
							)
						) {
							setQuizName(jsonData.title)
							setQuizImage(jsonData.image || '')
							setQuestions(jsonData.questions)
						} else {
							setError(`${t('InCorrectJson')}`)
						}
					} catch (error) {
						console.error('Не удалось загрузить JSON:', error)
						setError(`${t('JsonLoadErr')}`)
					}
				}
				reader.readAsText(file)
			}
		}
		fileInput.click()
	}

	return (
		<div
			className={
				theme === 'dark' ? styles['container-dark'] : styles['container-light']
			}
		>
			<div
				className={
					isImporting ? styles['import-alert'] : styles['import-alert-false']
				}
			>
				<div className={styles['import-alert-content']}>
					<p className={styles['tipoH1-2']}>{t('JsonFile')}</p>
					<SyntaxHighlighter
						language='javascript'
						className={styles['json-example']}
						customStyle={{ fontSize: '15px' }}
						style={vscDarkPlus}
					>
						{codeString}
					</SyntaxHighlighter>

					<div className={styles['import-alert-buttons']}>
						<button
							className={styles['open-import-button']}
							onClick={importJson}
						>
							{t('ImportJSON')}
						</button>
						<button
							className={styles['close-import-button']}
							onClick={() => setIsImporting(!isImporting)}
						>
							{t('Cancel')}
						</button>
					</div>
				</div>
			</div>

			<div className={styles['header']}>
				<div className={styles['header-content-1']}>
					<button className={styles['publish']} onClick={handleSaveQuiz}>
						{t('Publish')}
					</button>
					<button
						className={styles['import']}
						onClick={() => setIsImporting(!isImporting)}
					>
						{t('ImportJSON')}
					</button>
				</div>
				<div className={styles['header-content-2']}>
					<button className={styles['delete']} onClick={clearAll}>
						{t('DeleteAll')}
					</button>
					<button className={styles['leave']} onClick={() => nav('/main')}>
						{t('Exit')}
					</button>
				</div>
			</div>
			<Snowfall style={{ position: 'fixed' }} />
			<WhenIsTheError />

			<div className={styles['block']}>
				<ul
					className={`${styles['question-list']} ${
						isOpen
							? styles['question-list-open']
							: styles['question-list-closed']
					}`}
				>
					{questions.length > 0 ? (
						questions.map((question, index) => (
							<li
								key={index}
								className={`${styles['question-item']} ${
									selectedQuestionIndex === index ? styles['selected'] : ''
								}`}
								onClick={() => selectQuestion(index)}
							>
								{question.title.length > 25
									? `${question.title.substring(0, 25)}...`
									: question.title}
							</li>
						))
					) : (
						<li className={styles['no-questions']}>{t('NoQuestions')}</li>
					)}
				</ul>

				<div className={styles['editing']}>
					{showQuestionInput ? (
						<div className={styles['input-section']}>
							{showQuestionInput && (
								<p className={styles['tipoH1']}>{t('QuestionName')}</p>
							)}
							<input
								type='text'
								value={currentQuestion}
								onChange={e => setCurrentQuestion(e.target.value)}
								className={styles['question-input']}
								placeholder={t('QuestionEnter')}
								maxLength={100}
							/>
							<div className={styles['buttons-section']}>
								<button
									className={styles['confirm-btn1']}
									onClick={addQuestion}
								>
									{t('Comfirm')}
								</button>
								<button
									className={styles['cancel-btn1']}
									onClick={() => {
										setShowQuestionInput(false)
										selectQuestion(questions.length - 1)
									}}
								>
									{t('Cancel')}
								</button>
							</div>
						</div>
					) : (
						<div className={styles['sex2']}>
							<button
								className={styles['addQuestion']}
								onClick={() => {
									if (!showAnswerInput) {
										setSelectedQuestionIndex(null)
										setShowQuestionInput(true)
									}
								}}
							>
								{t('AddQuestion')}
							</button>

							<button
								className={styles['openListBtn']}
								onClick={() => setIsOpen(!isOpen)}
							>
								<IoMdOpen />
							</button>
						</div>
					)}

					{selectedQuestionIndex !== null && (
						<div className={styles['answers-block']}>
							<p className={styles['tipoH1']}>
								{questions[selectedQuestionIndex]?.title}
							</p>
							{questions[selectedQuestionIndex]?.correctAnswer && (
								<p>{t('Answers')}</p>
							)}
							<ul className={styles['answers']}>
								{questions[selectedQuestionIndex]?.correctAnswer && (
									<li className={styles['answer-item']}>
										<p className={styles['answer-text']}>
											{questions[selectedQuestionIndex]?.correctAnswer.length >
											30
												? `${questions[
														selectedQuestionIndex
												  ].correctAnswer.substring(0, 30)}...`
												: questions[selectedQuestionIndex].correctAnswer}
										</p>
										<div className={styles['answerButtons']}>
											<button className={styles['answer-toggle']}>
												{t('CorrAnswer')}
											</button>
											<div className={styles['sex']}>
												<button
													className={styles['edit-answer']}
													onClick={() => editAnswer(0)}
												>
													<MdEdit />
												</button>
												<button
													className={styles['delete-answer']}
													onClick={() => deleteAnswer(0)}
												>
													<MdDelete />
												</button>
											</div>
										</div>
									</li>
								)}
								{questions[selectedQuestionIndex]?.incorrectAnswers.map(
									(answer, idx) => (
										<li key={idx} className={styles['answer-item']}>
											<p className={styles['answer-text']}>
												{answer.length > 30
													? `${answer.substring(0, 30)}...`
													: answer}
											</p>
											<div className={styles['answerButtons']}>
												<button className={styles['answer-toggle']}>
													{t('InCorrAnswer')}
												</button>
												<div className={styles['sex']}>
													<button
														className={styles['edit-answer']}
														onClick={() => editAnswer(idx + 1)}
													>
														<MdEdit />
													</button>
													<button
														className={styles['delete-answer']}
														onClick={() => deleteAnswer(idx + 1)}
													>
														<MdDelete />
													</button>
												</div>
											</div>
										</li>
									)
								)}
							</ul>
						</div>
					)}

					{selectedQuestionIndex !== null &&
						!showAnswerInput &&
						questions[selectedQuestionIndex]?.incorrectAnswers.length < 3 && (
							<button
								className={styles['addAnswer']}
								onClick={() => setShowAnswerInput(true)}
							>
								{t('AddAnswer')}
							</button>
						)}

					{showAnswerInput && (
						<div className={styles['input-section']}>
							<input
								type='text'
								value={currentAnswer}
								onChange={e => setCurrentAnswer(e.target.value)}
								className={styles['answer-input']}
								placeholder={t('AnswerEnter')}
								maxLength={100}
							/>
							<div className={styles['buttons-section']}>
								<button
									className={styles['confirm-btn1']}
									onClick={
										editingAnswerIndex !== null ? saveEditedAnswer : addAnswer
									}
								>
									{editingAnswerIndex !== null
										? t('Save')
										: t('Comfirm')}
								</button>
								<button
									className={styles['cancel-btn1']}
									onClick={() => setShowAnswerInput(false)}
								>
									{t('Cancel')}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{showPublishForm && (
				<div className={styles['sigma']}>
					<div className={styles['publish-form']}>
						<p className={styles['tipoH1']}>{t('SendQuiz')}</p>
						<input
							className={styles['input-text']}
							type='text'
							placeholder={t('QuizNameE')}
							value={quizName}
							onChange={e => setQuizName(e.target.value)}
						/>
						<div className={styles['image-wrapper']}>
							<div className={styles['avatar']}>
								<img
									src={
										fileURL
											? fileURL
											: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png'
									}
									className={styles['profile-img']}
								/>
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
						<div className={styles['btn-wrapper']}>
							<button
								className={styles['form-btn1']}
								onClick={handlePublishQuiz}
							>
								{isLoad ? (
									<div className={styles["preloader"]}>
										<div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
										<div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
										<div className={styles["cube"]}><div className={styles["cube__inner"]}></div></div>
									</div>
								) : (
									t('Send')
								)}
							</button>
							<button
								className={styles['form-btn2']}
								onClick={() => !isLoad && setShowPublishForm(false)}
							>
								{t('Cancel')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default QuizEdit