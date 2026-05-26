import { useState, useCallback } from "react"
import { TerminalHeader } from "@/components/TerminalHeader"
import { HeroTerminal, TapAnimation } from "@/components/HeroTerminal"
import { CodeRain } from "@/components/CodeRain"
import { TerminalFooter } from "@/components/TerminalFooter"

const PTC_PER_TAP = 0.00000001

export default function HomePage() {
  const [showHeaderFooter, setShowHeaderFooter] = useState(true)
  const [ptcBalance, setPtcBalance] = useState(0)
  const [tapAnimations, setTapAnimations] = useState<TapAnimation[]>([])
  const [tapIdCounter, setTapIdCounter] = useState(0)

  const handleTap = useCallback(() => {
    setPtcBalance((prev) => prev + PTC_PER_TAP)
    const id = tapIdCounter + 1
    setTapIdCounter(id)
    const anim: TapAnimation = { id, value: PTC_PER_TAP.toExponential(2) }
    setTapAnimations((prev) => [...prev, anim])
    setTimeout(() => setTapAnimations((prev) => prev.filter((a) => a.id !== id)), 900)
  }, [tapIdCounter])

  return (
    <main className="relative">
      <CodeRain />

      <div className="relative z-10">
        <TerminalHeader isVisible={showHeaderFooter} />
        <HeroTerminal
          onExitTriggered={(v) => setShowHeaderFooter(!v)}
          ptcBalance={ptcBalance}
          onTap={handleTap}
          tapAnimations={tapAnimations}
        />
      </div>

      <TerminalFooter isVisible={showHeaderFooter} />
    </main>
  )
}