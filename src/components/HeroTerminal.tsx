import type React from "react"
import { useState, useEffect, useRef } from "react"

interface HeroTerminalProps {
  onExitTriggered?: (isExiting: boolean) => void
  btcBalance: number
  boostMultiplier: number
  onTap: () => void
  tapAnimations: TapAnimation[]
}

export interface TapAnimation {
  id: number
  x: number
  y: number
  value: string
}

const BTC_PER_TAP = 0.00000000000001

export function HeroTerminal({ btcBalance, boostMultiplier, onTap, tapAnimations }: HeroTerminalProps) {
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isBooting, setIsBooting] = useState(true)
  const [isInteractive, setIsInteractive] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [showInputCursor, setShowInputCursor] = useState(true)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [coinPressed, setCoinPressed] = useState(false)
  const [displayText, setDisplayText] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const FULL_TEXT = "майнер биткоина"

  const bootLines = [
    '<span class="text-yellow-400">⚡ BITCOIN MINER v2.1.0 — инициализация...</span>',
    '<span class="text-gray-400">$ загрузка блокчейн-протокола...</span>',
    '<span class="text-green-300">✓ SHA-256 алгоритм: <span class="text-cyan-400">АКТИВЕН</span></span>',
    '<span class="text-green-300">✓ Wallet подключён: <span class="text-cyan-400">0xBTC...M1NER</span></span>',
    '<span class="text-green-300">✓ Сеть Bitcoin: <span class="text-cyan-400">ОНЛАЙН</span></span>',
    "",
    '<span class="text-yellow-400 font-bold">⛏ ГОТОВ К МАЙНИНГУ! Нажимай на монету!</span>',
    '<span class="text-gray-400">Введи <span class="text-yellow-300">помощь</span> для списка команд</span>',
  ]

  const processCommand = (command: string): string[] => {
    const cmd = command.toLowerCase().trim()
    setTerminalLines([])

    switch (cmd) {
      case "help":
      case "помощь":
        return [
          '<span class="text-cyan-400 font-bold">Доступные команды:</span>',
          '  <span class="text-yellow-400">баланс</span>       — <span class="text-gray-400">Показать текущий баланс BTC</span>',
          '  <span class="text-yellow-400">буст</span>         — <span class="text-gray-400">Информация о бустах</span>',
          '  <span class="text-yellow-400">скорость</span>     — <span class="text-gray-400">Текущая скорость майнинга</span>',
          '  <span class="text-yellow-400">очистить</span>     — <span class="text-gray-400">Очистить терминал</span>',
          '  <span class="text-yellow-400">время</span>        — <span class="text-gray-400">Текущее время</span>',
        ]

      case "clear":
      case "очистить":
        return ["CLEAR_SCREEN"]

      case "balance":
      case "баланс":
        return [
          `<span class="text-green-400">💰 Баланс:</span> <span class="text-yellow-300 font-bold">${btcBalance.toFixed(14)} BTC</span>`,
          `<span class="text-gray-400">≈ ${(btcBalance * 96000).toFixed(8)} USD</span>`,
        ]

      case "буст":
      case "boost":
        return [
          '<span class="text-cyan-400 font-bold">⚡ СИСТЕМА БУСТОВ:</span>',
          `<span class="text-green-400">Активный множитель:</span> <span class="text-yellow-300">x${boostMultiplier.toFixed(2)}</span>`,
          `<span class="text-green-400">За клик сейчас:</span> <span class="text-cyan-300">${(BTC_PER_TAP * boostMultiplier).toExponential(2)} BTC</span>`,
          '<span class="text-gray-400">Купи буст через кнопку ниже — +1% к добыче за 1000₽</span>',
        ]

      case "скорость":
      case "speed":
        return [
          `<span class="text-cyan-400">⛏ Добыча за тап:</span> <span class="text-yellow-300">${(BTC_PER_TAP * boostMultiplier).toExponential(2)} BTC</span>`,
          `<span class="text-cyan-400">Множитель буста:</span> <span class="text-green-300">x${boostMultiplier.toFixed(2)}</span>`,
        ]

      case "time":
      case "время": {
        const now = new Date()
        return [`<span class="text-cyan-400">${now.toLocaleString("ru-RU")}</span>`]
      }

      default:
        return ['<span class="text-red-400">[ОШИБКА]</span> <span class="text-gray-400">Неизвестная команда. Введи <span class="text-yellow-300">помощь</span></span>']
    }
  }

  // Typewriter для заголовка
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i <= FULL_TEXT.length) {
        setDisplayText(FULL_TEXT.slice(0, i))
        i++
      } else {
        clearInterval(interval)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  // Boot sequence
  useEffect(() => {
    let lineIndex = 0
    const showNextLine = () => {
      if (lineIndex < bootLines.length) {
        setTerminalLines((prev) => [...prev, bootLines[lineIndex]])
        lineIndex++
        setTimeout(showNextLine, 200)
      } else {
        setIsBooting(false)
        setIsInteractive(true)
      }
    }
    setTimeout(showNextLine, 300)
  }, [])

  // Input cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowInputCursor((v) => !v), 500)
    return () => clearInterval(interval)
  }, [])

  // Scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalLines])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && userInput.trim()) {
      const cmd = userInput.trim()
      setCommandHistory((prev) => [cmd, ...prev])
      setHistoryIndex(-1)

      const result = processCommand(cmd)
      if (result[0] === "CLEAR_SCREEN") {
        setTerminalLines([])
      } else {
        setTerminalLines((prev) => [
          ...prev,
          `<span class="text-green-400">miner@btc:~$</span> <span class="text-white">${cmd}</span>`,
          ...result,
        ])
      }
      setUserInput("")
    } else if (e.key === "ArrowUp") {
      const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1)
      setHistoryIndex(newIndex)
      setUserInput(commandHistory[newIndex] ?? "")
    } else if (e.key === "ArrowDown") {
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      setUserInput(commandHistory[newIndex] ?? "")
    }
  }

  const handleCoinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCoinPressed(true)
    setTimeout(() => setCoinPressed(false), 120)
    onTap()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 font-mono">
      {/* Title */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-green-400 uppercase tracking-widest">
          {displayText}
          <span className="animate-pulse text-green-300">_</span>
        </h1>
        <p className="text-gray-500 text-xs mt-1 tracking-widest">BLOCKCHAIN MINING SIMULATOR</p>
      </div>

      {/* BTC Balance Display */}
      <div className="mb-6 border border-green-800 bg-black/80 backdrop-blur px-6 py-3 rounded text-center">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Баланс</div>
        <div className="text-yellow-400 font-bold text-lg md:text-2xl tabular-nums">
          ₿ {btcBalance.toFixed(14)}
        </div>
        <div className="text-gray-600 text-xs mt-1">
          x{boostMultiplier.toFixed(2)} буст · {(BTC_PER_TAP * boostMultiplier).toExponential(2)} за клик
        </div>
      </div>

      {/* Bitcoin Coin Button */}
      <div className="relative mb-8">
        {tapAnimations.map((anim) => (
          <div
            key={anim.id}
            className="absolute pointer-events-none text-yellow-300 font-bold text-sm animate-bounce z-20"
            style={{
              left: anim.x - 40,
              top: anim.y - 80,
              animation: "tapFloat 0.8s ease-out forwards",
            }}
          >
            +{anim.value} BTC
          </div>
        ))}

        <button
          onClick={handleCoinClick}
          className={`relative w-40 h-40 md:w-52 md:h-52 rounded-full border-4 border-yellow-500 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-700 shadow-2xl shadow-yellow-500/40 transition-all duration-100 select-none cursor-pointer hover:shadow-yellow-400/60 active:scale-95 focus:outline-none ${
            coinPressed ? "scale-90 shadow-yellow-300/80" : "scale-100 hover:scale-105"
          }`}
          aria-label="Майнить биткоин"
        >
          {/* Glow ring */}
          <div className={`absolute inset-0 rounded-full border-2 border-yellow-300/50 transition-all ${coinPressed ? "opacity-100 scale-110" : "opacity-0"}`} />

          {/* Bitcoin symbol */}
          <span className="text-6xl md:text-8xl select-none drop-shadow-lg" role="img" aria-label="bitcoin">
            ₿
          </span>

          {/* Shine effect */}
          <div className="absolute top-4 left-6 w-8 h-4 bg-white/20 rounded-full rotate-[-30deg]" />
        </button>
      </div>

      {/* Boost Button */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <button
          className="border border-cyan-600 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-300 font-bold px-8 py-3 rounded transition-all duration-200 hover:scale-105 active:scale-95 text-sm uppercase tracking-widest"
          onClick={() => {
            setTerminalLines((prev) => [
              ...prev,
              '<span class="text-cyan-400">⚡ BOOST — оплата через Telegram. Напиши администратору: </span><a href="https://t.me/your_bot" class="text-yellow-300 underline">@your_bot</a>',
              '<span class="text-gray-400">Стоимость: от 1000₽ · Эффект: +1% к добыче за каждый буст</span>',
            ])
          }}
        >
          ⚡ КУПИТЬ БУСТ — от 1000₽
        </button>
        <div className="text-gray-600 text-xs">+1% к скорости добычи за каждый буст</div>
      </div>

      {/* Terminal Window */}
      <div className="w-full max-w-2xl border border-green-800 bg-black/90 backdrop-blur rounded overflow-hidden">
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-green-950/50 border-b border-green-900">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-green-600 text-xs">miner@btc:~$</span>
        </div>

        {/* Terminal output */}
        <div
          ref={terminalRef}
          className="p-4 h-40 overflow-y-auto text-sm text-green-300 space-y-1 scroll-smooth"
        >
          {terminalLines.map((line, i) => (
            <div
              key={i}
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }}
            />
          ))}
        </div>

        {/* Input */}
        {isInteractive && (
          <div
            className="flex items-center gap-2 px-4 py-3 border-t border-green-900/50"
            onClick={() => inputRef.current?.focus()}
          >
            <span className="text-green-400 shrink-0">miner@btc:~$</span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-green-300 outline-none caret-transparent text-sm"
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <span
                className="absolute top-0 text-green-400 pointer-events-none"
                style={{ left: `${userInput.length}ch` }}
              >
                {showInputCursor ? "█" : " "}
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes tapFloat {
          0% { opacity: 1; transform: translateY(0) scale(1.2); }
          100% { opacity: 0; transform: translateY(-60px) scale(0.8); }
        }
      `}</style>
    </div>
  )
}