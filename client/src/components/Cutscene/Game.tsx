import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import DescriptionStep from '../DescriptionStep/DescriptionStep'
import styles from './Game.module.css'

interface GameProps {
	allReady: boolean
	isReady: boolean
	handlePlayerReady: () => void
	readyPlayers: number
	totalPlayers: number
}

interface IDescription {
	text: string
	emoji: string
}

function Game({allReady, isReady, handlePlayerReady, readyPlayers, totalPlayers}: GameProps) {
	const [currentStep, setCurrentStep] = useState<number>(0)
	const { t } = useTranslation()

	const handleNextStep = (): void => {
		setCurrentStep(prev => (prev + 1) % descriptions.length)
	}

	const descriptions: IDescription[] = [
		{ text: `${t('PartyTxt1')}`, emoji: '🧠' },
		{ text: `${t('PartyTxt2')}`, emoji: '🎯' },
		{ text: `${t('PartyTxt3')}`, emoji: '📑' },
		{ text: `${t('PartyTxt4')}`, emoji: '🏆' }
	]
	return (
		<motion.div
			className={styles['Game']}
			initial={{ opacity: 1 }}
			animate={{ opacity: allReady ? 0 : 1, zIndex: allReady ? -1 : 10 }}
			transition={{ duration: 1 }}
		>
			{!allReady ? (
				<motion.div
					className={styles['cutscene-container']}
					initial={{ opacity: 0 }}
					animate={{ opacity: isReady ? 0 : 1 }}
					transition={{ duration: 0.5 }}
				>
					<DescriptionStep
						text={descriptions[currentStep].text}
						emoji={descriptions[currentStep].emoji}
						onNext={handleNextStep}
						showNextButton={currentStep < descriptions.length - 1}
					/>
					{!isReady && (
						<button
							onClick={handlePlayerReady}
							className={styles['ready-button']}
						>
							{t('ImReady')}
						</button>
					)}
					<p className={styles['total']}>
						{readyPlayers}/{totalPlayers} {t('Ready')}
					</p>
				</motion.div>
			) : (
				<div className={styles['game-start']}>{t('GameStart')}</div>
			)}
		</motion.div>
	)
}

export default Game