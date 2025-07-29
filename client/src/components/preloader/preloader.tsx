import styles from './preloader.module.css'
import cn from "classnames"

interface preloaderProps {
    text?: string
    isLoad: boolean
}

export default function Preloader({text, isLoad}: preloaderProps) {
    return (
        <div className={cn(styles['container'], {
            [styles["load"]]: !isLoad
        }
        )}>
            <div className={styles['preloader']}>
                <div className={styles['cube']}><div className={styles["cube__inner"]}></div></div>
                <div className={styles['cube']}><div className={styles["cube__inner"]}></div></div>
                <div className={styles['cube']}><div className={styles["cube__inner"]}></div></div>
            </div>
            {text && <p className={styles["prompt"]}>{text}</p>}
        </div>
    )
}