import React from 'react'
import ReactDOM from 'react-dom/client'
import { FacebookProvider } from './hooks/useFacebookSDK.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import '../helpers/i18n'
import ProtectedRoute from '../helpers/NotAuthForRoute.tsx'
import ActivatedRoute from './../helpers/ActivatedRoute.tsx'
import RegRoute from './../helpers/ProtectedRoute.tsx'
import { LanguageProvider } from './../languageProvider/LanguageContext.tsx'
import QuizEdit from './components/Quiz-editing/QuizEdit.tsx'
import './index.css'
import Loginpage from './pages/Auth/Login/LoginPage.tsx'
import Registrationpage from './pages/Auth/Registration/RegistrationPage.tsx'
import App from './pages/Home/App.tsx'
import Mainpage from './pages/Main/Main.tsx'
import Party from './pages/Party/Party.tsx'
import QuizPage from './pages/Quiz/Quiz.tsx'
import Settingspage from './pages/Settings/Setting.tsx'
import ResetPassword from './pages/Auth/ResetPassword/ResetPassword.tsx'

const routes = [
	{
		path: '/', 
		element: <App />
	},
	{
		path: '/registration',
		element: (
			<FacebookProvider appId="533997126116043">
				<ProtectedRoute>
						<Registrationpage />
				</ProtectedRoute>
			</FacebookProvider>
		)
	},
	{
		path: '/login',
		element: (
			<FacebookProvider appId="533997126116043">
				<ProtectedRoute>
					<Loginpage />
				</ProtectedRoute>
			</FacebookProvider>
		)
	},
	{
		path: '/settings',
		element: (
			<RegRoute>
				<Settingspage />
			</RegRoute>
		)
	},
	{
		path: '/main',
		element: (
			<RegRoute>
				<Mainpage />
			</RegRoute>
		)
	},
	{
		path: '/quiz/:quizId',
		element: <QuizPage />
	},
	{
		path: '/edit',
		element: (
			<ActivatedRoute>
				<QuizEdit />
			</ActivatedRoute>
		)
	},
	{
		path: '/party',
		element: (
			<ActivatedRoute>
				<Party />
			</ActivatedRoute>
		)
	},
  {
		path: 'resetPassword',
		element: <ResetPassword />
	}
]

const router = createBrowserRouter(routes)

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<LanguageProvider>
			<FacebookProvider appId="533997126116043">
				<RouterProvider router={router} />
			</FacebookProvider>
		</LanguageProvider>
	</React.StrictMode>
)