import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Snowfall from 'react-snowfall'
import Preloader from '../src/components/preloader/preloader'
import { useSettingsStore } from '../store/settingsStore'
import { useUserStore } from '../store/userStore'
import styles from './NotAuth.module.css'

interface NotAuthForRouteProps {
	children: React.ReactNode
}

function ProtectedRoute({ children }: NotAuthForRouteProps) {
	const { t } = useTranslation()
	const nav = useNavigate()
	const [loading, setLoading] = useState<boolean>(true)
	const [isAuth, setIsAuth] = useState<boolean>(false)
	const { theme } = useSettingsStore()

	const { checkAuth, setError } = useUserStore()

	useEffect(() => {
		const verifyAuth = async () => {
			const authenticated = await checkAuth()
			setIsAuth(authenticated)
			setLoading(false)
		}

		verifyAuth()
	}, [checkAuth])

	useEffect(() => {
		if (!loading && isAuth) {
			setError(`${t('ActAcc')}`)
			nav('/')
		}
	}, [loading, isAuth, setError, nav])

	if (loading) {
		return (
			<div
				className={
					theme === 'dark'
						? styles['container-dark']
						: styles['container-light']
				}
			>
				<Snowfall />
				<Preloader isLoad={loading} text={t('CheckAuth')} />
			</div>
		)
	}

	return children
}

export default ProtectedRoute