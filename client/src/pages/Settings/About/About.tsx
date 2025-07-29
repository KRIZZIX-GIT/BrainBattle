import { useTranslation } from 'react-i18next'
import ava1 from '../../../assets/ava1.webp'
import ava2 from '../../../assets/ava2.webp'
import ava3 from '../../../assets/ava3.webp'
import styles from './About.module.css'

export default function About() {
	const { t } = useTranslation()
	return (
		<div className={styles['container']}>
			<p className={styles['tipoH1']}>{t('ProjAbt')}</p>
			<div className={styles['content-1']}>
				<p className={styles['tipoH1-2']}>{t('Devs')}</p>
				<div className={styles['content-1-1']}>
					<div className={styles['content-1-1-1']}>
						<p className={styles['tipoH1-2']}>ManWitHammer</p>
						<img className={styles['ava1']} src={ava1} alt='' />
					</div>
					<div className={styles['content-1-1-2']}>
						<p className={styles['tipoH1-2']}>Memmix</p>
						<img className={styles['ava2']} src={ava2} alt='' />
					</div>
					<div className={styles['content-1-1-3']}>
						<p className={styles['tipoH1-2']}>KRIZZIX</p>
						<img className={styles['ava3']} src={ava3} alt='' />
					</div>
				</div>
			</div>
			<div className={styles['content-2']}>
				<p className={styles['tipoH1-2']}>{t('ProjDesc')}</p>
				<p className={styles['tipoH1-3']}>{t('ProjTxt')}</p>
			</div>
		</div>
	)
}
