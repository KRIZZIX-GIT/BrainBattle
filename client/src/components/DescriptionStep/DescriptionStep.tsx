import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import AnimatedText from '../AnimatedText/AnimatedText'

interface DescriptionStepProps {
	text: string
	emoji: string
	onNext: () => void
	showNextButton: boolean
}

const DescriptionStep = ({ text, emoji, onNext, showNextButton }: DescriptionStepProps) => {
	const { t } = useTranslation() 

	return (
		<div style={{ textAlign: "center", color: "white", padding: "20px" }}>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
			<AnimatedText key={text} text={text} />
			</motion.div>
			<motion.div
				style={{ fontSize: "100px", marginTop: "20px" }}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.8 }}
			>
			{emoji}
			</motion.div>
			{showNextButton && (
			<button
				onClick={onNext}
				style={{
				marginTop: "20px",
				padding: "10px 20px",
				fontSize: "30px",
				border: "none",
				borderRadius: "5px",
				background: "#007bff",
				color: "white",
				cursor: "pointer",
				width: "160px",
				height: "60px",
				fontWeight: "bold",
				}}
			>
				{t('Next')}
			</button>
			)}
		</div>
	)
}


export default DescriptionStep