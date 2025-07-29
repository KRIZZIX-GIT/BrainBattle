import React from 'react'
import useLanguageStore from './../../../store/languageStore'
import styles from './LanguageSwitcher.module.css'
import ruflag from './../../assets/ru-flag.png'
import enflag from './../../assets/en-flag.png'
import frflag from './../../assets/fr-flag.png'
import deflag from './../../assets/de-flag.png'
import cnflag from './../../assets/cn-flag.png'
const LanguageSwitcher: React.FC = () => {
	const { language, changeLanguage } = useLanguageStore()

	return (
	
			<ul className={styles['list']}>
				<li className={styles['item']} onClick={() => changeLanguage('ru')}>
					<div className={styles['content']}>
					<input type='radio' className={styles['checkbox']} checked={language === 'ru'} />
					<p className={styles['text']}>Русский</p>
					</div>
					<img  src={ruflag} alt='ruflag' className={styles['img']} />
				</li>
				<li className={styles['item']} onClick={() => changeLanguage('en')}>
					<div className={styles['content']}>
					<input type='radio' className={styles['checkbox']} checked={language === 'en'} />
					<p className={styles['text']}>English</p>
					</div>
					<img src={enflag} alt='enflag' className={styles['img']} />
				</li>
				<li className={styles['item']} onClick={() => changeLanguage('fr')}>
					<div className={styles['content']}>
					<input type='radio' className={styles['checkbox']} checked={language === 'fr'} />
					<p className={styles['text']}>Français</p>
					</div>
					<img src={frflag} alt='frflag' className={styles['img']} />
				</li>
				<li className={styles['item']} onClick={() => changeLanguage('de')}>
					<div className={styles['content']}>
					<input type='radio' className={styles['checkbox']} checked={language === 'de'} />
					<p className={styles['text']}>Deutsch</p>
					</div>
					<img src={deflag} alt='deflag' className={styles['img']} />
				</li>
				<li className={styles['item']} onClick={() => changeLanguage('cn')}>
					<div className={styles['content']}>
					<input type='radio' className={styles['checkbox']} checked={language === 'cn'} />
					<p className={styles['text']}>中国人</p>
					</div>
					<img src={cnflag} alt='cnflag' className={styles['img']} />
				</li>
			</ul>
		
	)
}

export default LanguageSwitcher