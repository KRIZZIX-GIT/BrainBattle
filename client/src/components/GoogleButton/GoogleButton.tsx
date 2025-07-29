import styles from "./GoogleButton.module.css"
import { useGoogleLogin, TokenResponse } from '@react-oauth/google'
import { useUserStore } from '../../../store/userStore'
import axios from 'axios'

function CustomGoogleLoginButton() {
    const { setGoogleData } = useUserStore()
    const handleLoginSuccess = async (tokenResponse: TokenResponse): Promise<void> => {
        const token = tokenResponse.access_token

        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        setGoogleData({email: response.data.email, name: response.data.given_name, surname: response.data.family_name, avatar: response.data.picture, sub: response.data.sub})
    }

    const login = useGoogleLogin({
        onSuccess: handleLoginSuccess
    })

    return (
        <div>
            <button onClick={() => login()} className={styles['btn-login-google']}>
                Google
            </button>
        </div>
    )
}

export default CustomGoogleLoginButton