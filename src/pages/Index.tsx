import { useState } from "react"
import { TerminalHeader } from "@/components/TerminalHeader"
import { HeroTerminal } from "@/components/HeroTerminal"
import { CodeRain } from "@/components/CodeRain"
import { TerminalFooter } from "@/components/TerminalFooter"

export default function HomePage() {
  const [showHeaderFooter, setShowHeaderFooter] = useState(true)

  return (
    <main className="relative">
      <CodeRain />

      <div className="relative z-10">
        <TerminalHeader isVisible={showHeaderFooter} />
        <HeroTerminal onExitTriggered={(v) => setShowHeaderFooter(!v)} />
      </div>

      <TerminalFooter isVisible={showHeaderFooter} />
    </main>
  )
}