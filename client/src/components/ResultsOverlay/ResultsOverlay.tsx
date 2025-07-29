import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Socket } from 'socket.io-client'
import notFoundImg from '../../assets/avatar.png'
import styles from './ResultsOverlay.module.css'

interface IScores {
    [userId: string]: number; // или другой тип, если score не является boolean
}

interface IResults {
    [userId: string]: boolean; // или другой тип, если score не является boolean
}

interface IUser {
	id: string
	username: string
	avatar: string
	socketId: string | undefined
}

interface ResultsOverlayProps {
	showResults: boolean
	results: IResults | null
	countQuestions: number
	passedQuestions: number
	scores: IScores | null
	getPlayerDetails: (userId: string) => IUser | undefined
	socket: Socket | null
	gameOver: boolean
}

function ResultsOverlay({
	showResults,
	results,
	countQuestions,
	passedQuestions,
	scores,
	getPlayerDetails,
	socket,
	gameOver
}: ResultsOverlayProps) {
	const { t } = useTranslation()
	return (
		<>
			{showResults && (
				<motion.div
					className={styles['results']}
					initial={{ opacity: 0 }}
					animate={{ opacity: gameOver ? 0 : 1 }}
					transition={{ duration: 0.5 }}
				>
					<motion.h4
						initial={{ opacity: 0, x: 100 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className={styles['results-title']}
					>
						{passedQuestions}/{countQuestions} {t('QuestionEnd')}
					</motion.h4>
					<motion.div
						initial={{ opacity: 0, x: 100 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
						className={styles['results-bar']}
					>
						<motion.div
							initial={{ opacity: 0, x: 100, width: 0 }}
							animate={{
								opacity: 1,
								x: 0,
								width: `${(passedQuestions / countQuestions) * 100}%`
							}}
							transition={{ duration: 0.5 }}
							style={{
								height: '100%',
								background: 'linear-gradient(90deg, #4caf50, #81c784)',
								borderRadius: '5px'
							}}
						/>
					</motion.div>
					<motion.div
						className={styles['results-container']}
						initial={{ opacity: 0, x: 100 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5 }}
					>
						{results && typeof results === 'object' ? (
							Object.entries(results)
								.filter(([userId]) => userId == socket?.id)
								.map(([userId1, score]) => {
									userId1
									return (
										<p className={styles['nenavizuCss']}>
											{t('UAnswer')}{': '}
											{score ? `${t('Correct')}` : `${t('Wrong')}:(`}
										</p>
									)
								})
						) : (
							<p>{t('NoResult')}</p>
						)}
						<h3>{t('CurrPoints')}:</h3>
						{scores && typeof scores === 'object' ? (
							Object.entries(scores).map(([userId, answer], idx) => {
								const player = getPlayerDetails(userId)
								return (
									<div key={idx} className={styles['result-item']}>
										<img
											src={player?.avatar ? player?.avatar : notFoundImg}
											alt={player?.username}
										/>
										<div className={styles['usernameAndOther']}>
											{player?.username && player.username.length > 10
												? player.username.substring(0, 10) + '...'
												: player?.username}
											<p>Засчитано: {answer}</p>
										</div>
									</div>
								)
							})
						) : (
							<p>{t('NoResult')}</p>
						)}
					</motion.div>
				</motion.div>
			)}
		</>
	)
}

export default ResultsOverlay