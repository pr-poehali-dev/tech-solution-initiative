import { useState, useCallback } from "react"
import { TerminalHeader } from "@/components/TerminalHeader"
import { HeroTerminal, TapAnimation } from "@/components/HeroTerminal"
import { CodeRain } from "@/components/CodeRain"
import { TerminalFooter } from "@/components/TerminalFooter"

const BTC_PER_TAP = 0.00000000000001

export default function HomePage() {
  const [btcBalance, setBtcBalance] = useState(0)
  const [boostLevel, setBoostLevel] = useState(0)
  const [tapAnimations, setTapAnimations] = useState<TapAnimation[]>([])
  const [tapIdCounter, setTapIdCounter] = useState(0)

  const boostMultiplier = 1 + boostLevel * 0.01

  const handleTap = useCallback(() => {
    const earned = BTC_PER_TAP * boostMultiplier
    setBtcBalance((prev) => prev + earned)

    const id = tapIdCounter + 1
    setTapIdCounter(id)
    const anim: TapAnimation = {
      id,
      x: 80 + Math.random() * 40,
      y: 60 + Math.random() * 30,
      value: earned.toExponential(2),
    }
    setTapAnimations((prev) => [...prev, anim])
    setTimeout(() => {
      setTapAnimations((prev) => prev.filter((a) => a.id !== id))
    }, 900)
  }, [boostMultiplier, tapIdCounter])

  return (
    <main className="relative">
      <CodeRain />

      <div className="relative z-10">
        <TerminalHeader isVisible={true} />
        <HeroTerminal
          btcBalance={btcBalance}
          boostMultiplier={boostMultiplier}
          onTap={handleTap}
          tapAnimations={tapAnimations}
          onExitTriggered={() => {}}
        />
      </div>

      <TerminalFooter isVisible={true} />
    </main>
  )
}
