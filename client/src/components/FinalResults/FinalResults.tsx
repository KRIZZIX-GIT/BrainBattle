import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import notFoundImg from "../../assets/avatar.png"
import styles from './FinalResults.module.css'

interface FinalResultsProps {
	scores: { [playerId: string]: number } | null
	players: { id: string; username: string; avatar: string; socketId: string | undefined }[]
}

interface PlayerWithScore {
	id: string
	username: string
	avatar: string
	socketId: string | undefined
	score: number
}

const FinalResults: React.FC<FinalResultsProps> = ({ scores, players }) => {
	const [currentStep, setCurrentStep] = useState<number>(0)
	const [sortedPlayers, setSortedPlayers] = useState<PlayerWithScore[]>([])
	const nav = useNavigate()
	const { t } = useTranslation()
	const onClose = () => {
		nav('/main')
	}

  useEffect(() => {
    const sorted = Object.entries(scores || {})
      .map(([playerId, score]) => {
        const player = players.find((p) => p.id === playerId);
        if (player) {
          return { ...player, score };
        }
        return null; 
      })
      .filter((player): player is PlayerWithScore => player !== null) 
      .sort((a, b) => b.score - a.score);

		setSortedPlayers(sorted)
	}, [scores, players])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (sortedPlayers.length === 2) {
      timers.push(setTimeout(() => setCurrentStep(1), 1000))
      timers.push(setTimeout(() => setCurrentStep(2), 3000))
    } else if (sortedPlayers.length >= 3) {
      timers.push(setTimeout(() => setCurrentStep(1), 1000))
      timers.push(setTimeout(() => setCurrentStep(2), 3000))
      timers.push(setTimeout(() => setCurrentStep(3), 5000))
    }
    return () => timers.forEach(clearTimeout);
  }, [sortedPlayers]);

  return (
    <motion.div 
    className={styles.overlay}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className={styles.container}>
      {sortedPlayers.length >= 3 && (
        <>
          <div
            className={styles.thirdPlace}
          >
            <img src={sortedPlayers[2].avatar ? sortedPlayers[2].avatar : notFoundImg} alt={sortedPlayers[2].username} className={styles.avatar} />
            <p className={styles.name}>{sortedPlayers[2].username}</p>
            <p className={styles.score}>{sortedPlayers[2].score} {t('Points')}</p>
            <p className={styles.position}>🥉 {t('Place3')}</p>
          </div>
  
          <div
            className={styles.firstPlace}
          >
            <img src={sortedPlayers[0].avatar ? sortedPlayers[0].avatar : notFoundImg} alt={sortedPlayers[0].username} className={styles.avatar} />
            <p className={styles.name}>{sortedPlayers[0].username}</p>
            <p className={styles.score}>{sortedPlayers[0].score} {t('Points')}</p>
            <p className={styles.position}>🥇 {t('Place1')}</p>
          </div>
          <div
            className={styles.secondPlace}
          >
            <img src={sortedPlayers[1].avatar ? sortedPlayers[1].avatar : notFoundImg} alt={sortedPlayers[1].username} className={styles.avatar} />
            <p className={styles.name}>{sortedPlayers[1].username}</p>
            <p className={styles.score}>{sortedPlayers[1].score} {t('Points')}</p>
            <p className={styles.position}>🥈 {t('Place2')}</p>
          </div>
        </>
      )}
  
      {sortedPlayers.length === 2 && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: currentStep >= 1 ? 1 : 0 }}
            transition={{ duration: 1 }}
            className={styles.secondPlace}
          >
            <img src={sortedPlayers[1].avatar ? sortedPlayers[1].avatar : notFoundImg} alt={sortedPlayers[1].username} className={styles.avatar} />
            <p className={styles.name}>{sortedPlayers[1].username}</p>
            <p className={styles.score}>{sortedPlayers[1].score} {t('Points')}</p>
            <p className={styles.position}>🥈 {t('Place2')}</p>
          </motion.div>
  
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: currentStep >= 2 ? 1 : 0 }}
            transition={{ duration: 1 }}
            className={styles.firstPlace}
          >
            <img src={sortedPlayers[0].avatar ? sortedPlayers[0].avatar : notFoundImg} alt={sortedPlayers[0].username} className={styles.avatar} />
            <p className={styles.name}>{sortedPlayers[0].username}</p>
            <p className={styles.score}>{sortedPlayers[0].score} {t('Points')}</p>
            <p className={styles.position}>🥇 {t('Place1')}</p>
          </motion.div>
        </>
      )}
  
      {sortedPlayers.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className={styles.onlyPlayer}
        >
          <img src={sortedPlayers[0].avatar ? sortedPlayers[0].avatar : notFoundImg} alt={sortedPlayers[0].username} className={styles.avatar} />
          <p className={styles.name}>{sortedPlayers[0].username}</p>
          <p className={styles.score}>{sortedPlayers[0].score} {t('Points')}</p>
          <p className={styles.position}>👏 {t('Lider')}!</p>
        </motion.div>
      )}
    </div>
    <button onClick={onClose} className={styles.closeButton}>
      {t("ToMenu")}
    </button>
  </motion.div>
  )
}

export default FinalResults