import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Snowfall from 'react-snowfall'
import { useSettingsStore } from '../../../store/settingsStore'
import Header from '../../components/Header/Header'
import WhenIsTheError from '../../components/WhenIsTheError/WhenIsTheError'
import styles from './Main.module.css'
import Quizes from './Quizes/Quizes'

function Main() {
	const { theme } = useSettingsStore()
	const { t } = useTranslation()
	const [inputValues, setInputValues] = useState<string[]>([
		'',
		'',
		'',
		'',
		'',
		''
	])
	const nav = useNavigate()

	const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number): void => {
		const target = e.target as HTMLInputElement
		const newValues = [...inputValues]
		newValues[index] = target.value.toUpperCase()
		setInputValues(newValues)

		const inputs = document.querySelectorAll<HTMLInputElement>(
			`.${styles['code-container']} input`
		)

		if (target.value && index < inputs.length - 1) {
			inputs[index + 1].focus()
		} else if (!target.value && index > 0) {
			inputs[index - 1].focus()
		}
	}

	const toParty = (): void => {
		const code = inputValues.join('')
		nav(`/party?code=${code}`)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
		const inputs = document.querySelectorAll<HTMLInputElement>(
			`.${styles['code-container']} input`
		)

		if (e.key === 'ArrowRight' && index < inputs.length - 1) {
			inputs[index + 1].focus()
		} else if (e.key === 'ArrowLeft' && index > 0) {
			inputs[index - 1].focus()
		}
	}

	return (
		<div
			className={theme === 'light' ? styles['container-light'] : styles['container-dark']}
		>
			<WhenIsTheError />
			<Header />
			<Snowfall style={{ position: 'fixed' }} />
			<div className={styles['title-cont']}>
				<div className={styles['code-container']}>
					<div className={styles['input-cont']}>
						{[...Array(6)].map((_, i) => (
							<input
								key={i}
								type='text'
								maxLength={1}
								onInput={e => handleInput(e, i)}
								onKeyDown={e => handleKeyDown(e, i)}
								className={styles['inputik']}
							/>
						))}
					</div>
					<p className={styles['text']}>{t('Code')}</p>
				</div>
				<button className={styles['submitCode']} onClick={toParty}>
					{t('Join')}
				</button>
				<Quizes />
			</div>
		</div>
	)
}

export default Main