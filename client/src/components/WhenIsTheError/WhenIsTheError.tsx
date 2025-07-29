import cn from 'classnames'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { quizzesStore } from '../../../store/quizzesStore'
import { useUserStore } from '../../../store/userStore'
import logo from '../../assets/logo.png'
import styles from './WhenIsTheError.module.css'

function WhenIsTheError() {
	const { errorText } = useUserStore()
	const errorQuiz = quizzesStore(state => state.errorText)
	const [errorTextFromStore, setErrorText] = useState<string>('')
	const [isError, setIsError] = useState<boolean>(false)
	const [animateIn, setAnimateIn] = useState<boolean>(false) 
	const { t } = useTranslation()
	useEffect(() => {
		if (errorText) {
			setErrorText(errorText)
			setIsError(true)
			setAnimateIn(true) 

			setTimeout(() => {
				setAnimateIn(false)
				setTimeout(() => {
					setIsError(false) 
				}, 500) 
			}, 5000)
		}
		if (errorQuiz) {
			setErrorText(errorQuiz)
			setIsError(true)
			setAnimateIn(true) 
			setTimeout(() => {
				setAnimateIn(false) 
				setTimeout(() => {
					setIsError(false)
				}, 500) 
			}, 5000)
		}
	}, [errorText, errorQuiz])

	return (
		<div
			className={cn(styles['container'], {
				[styles['hide']]: !isError,
				[styles['animateIn']]: animateIn
			})}
		>
			{isError && (
				<>
					<div className={styles['uppercase']}>
						<div className={styles['logo-container']}>
							<img src={logo} className={styles['logo']} alt='Logo'></img>
							<h2>BrainBattle</h2>
						</div>
						<p>1s ago</p>
					</div>
					<h2>{t('Error')}:</h2>
					<p>{errorTextFromStore}</p>
				</>
			)}
		</div>
	)
}

export default WhenIsTheError