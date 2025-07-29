import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Snowfall from 'react-snowfall'
import Preloader from '../src/components/preloader/preloader'
import { useUserStore } from '../store/userStore'

interface NotAuthForRouteProps {
	children: React.ReactNode
}

function ActivatedRoute({ children }: NotAuthForRouteProps) {
	const [loading, setLoading] = useState<boolean>(true)
	const [isAuth, setIsAuth] = useState<boolean>(false)
	const [isActivated, setIsActivated] = useState<boolean>(false)
	const { t } = useTranslation()
	const checkAuth = useUserStore(state => state.checkAuth)
	const user = useUserStore(state => state.user) 

	useEffect(() => {
		const verifyAuth = async () => {
			const authenticated = await checkAuth() 

			if (authenticated && user?.isActivated) {
				setIsAuth(true)
				setIsActivated(true)
			} else {
				setIsAuth(false)
				setIsActivated(false)
			}

			setLoading(false)
		}

		verifyAuth()
	}, [checkAuth])

	if (loading) {
		return (
			<div>
				<Snowfall />
				<Preloader isLoad={loading} text={t('CheckAuth')} />
			</div>
		)
	}

	if (!isAuth && !isActivated) {
		return <Navigate to='/' />
	}

	return children
}

export default ActivatedRoute
