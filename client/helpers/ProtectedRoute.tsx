import React, { useEffect, useState } from 'react' 
import { Navigate } from 'react-router-dom' 
import { useTranslation } from 'react-i18next'
import Snowfall from 'react-snowfall' 
import Preloader from '../src/components/preloader/preloader' 
import { useUserStore } from '../store/userStore'

interface ProtectedRouteProps {
	children: React.ReactNode
}

const RegRoute = ({ children }: ProtectedRouteProps) => {
	const [loading, setLoading] = useState<boolean>(true)
	const [isAuth, setIsAuth] = useState<boolean>(false)
	const { t } = useTranslation()

	const checkAuth = useUserStore(state => state.checkAuth) 

	useEffect(() => {
		const verifyAuth = async () => {
			const authenticated = await checkAuth() 
			setIsAuth(authenticated) 
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

	if (!isAuth) {
		return <Navigate to='/login' />
	}

	return children
}

export default RegRoute