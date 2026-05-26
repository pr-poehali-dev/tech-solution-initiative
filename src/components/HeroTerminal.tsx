import type React from "react"
import { useState, useEffect, useRef } from "react"

export interface TapAnimation {
  id: number
  value: string
}

interface HeroTerminalProps {
  onExitTriggered?: (isExiting: boolean) => void
  ptcBalance: number
  onTap: () => void
  tapAnimations: TapAnimation[]
}

const FULL_TEXT = "potok mainer"
const PTC_PER_TAP = 0.00000001

const fetchIPInfo = async (): Promise<string> => {
  const isLikelyBlocked = navigator.doNotTrack === "1"
  if (isLikelyBlocked) return "IP_СКРЫТ | ЛОКАЦИЯ_ЗАШИФРОВАНА | СЕТЬ_ЗАЩИЩЕНА"
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    const response = await fetch("https://ipapi.co/json/", {
      signal: controller.signal,
      mode: "cors",
      credentials: "omit",
      cache: "no-cache",
    })
    clearTimeout(timeoutId)
    if (!response.ok) throw new Error()
    const data = await response.json()
    return `${data.ip} | ${data.city}, ${data.region} | Провайдер: ${data.org}`
  } catch {
    return "IP_СКРЫТ | ЛОКАЦИЯ_ЗАШИФРОВАНА | СЕТЬ_ЗАЩИЩЕНА"
  }
}

export function HeroTerminal({ onExitTriggered, ptcBalance, onTap, tapAnimations }: HeroTerminalProps) {
  const [displayText, setDisplayText] = useState("")
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [isInteractive, setIsInteractive] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [showInputCursor, setShowInputCursor] = useState(true)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [coinPressed, setCoinPressed] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const ipInfoRef = useRef("IP_СКРЫТ | ЛОКАЦИЯ_ЗАШИФРОВАНА | СЕТЬ_ЗАЩИЩЕНА")

  const bootLines = [
    '<span class="text-yellow-400">⚡ POTOK MAINER v1.0.0 — инициализация...</span>',
    '<span class="text-gray-400">$ загрузка майнинг-протокола...</span>',
    '<span class="text-green-300">✓ SHA-256 алгоритм: <span class="text-cyan-400">АКТИВЕН</span></span>',
    '<span class="text-green-300">✓ Монета: <span class="text-yellow-400">PTC (Potok Coin)</span></span>',
    '<span class="text-green-300">✓ Wallet подключён: <span class="text-cyan-400">0xPTC...M1NER</span></span>',
    "",
    '<span class="text-yellow-400 font-bold">⛏ ГОТОВ! Нажимай на монету для майнинга PTC!</span>',
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
          '  <span class="text-yellow-400">баланс</span>       — <span class="text-gray-400">Показать баланс PTC</span>',
          '  <span class="text-yellow-400">кто</span>          — <span class="text-gray-400">О проекте Potok Mainer</span>',
          '  <span class="text-yellow-400">майнинг</span>      — <span class="text-gray-400">Статус майнинга</span>',
          '  <span class="text-yellow-400">трассировка</span>  — <span class="text-gray-400">Запустить трассировку</span>',
          '  <span class="text-yellow-400">время</span>        — <span class="text-gray-400">Текущее время</span>',
          '  <span class="text-yellow-400">очистить</span>     — <span class="text-gray-400">Очистить терминал</span>',
        ]

      case "clear":
      case "очистить":
        return ["CLEAR_SCREEN"]

      case "balance":
      case "баланс":
        return [
          `<span class="text-green-400">💰 Баланс:</span> <span class="text-yellow-300 font-bold">${ptcBalance.toFixed(8)} PTC</span>`,
          `<span class="text-gray-400">Добыто кликами: ${Math.round(ptcBalance / PTC_PER_TAP)} тапов</span>`,
        ]

      case "whoami":
      case "кто":
        return [
          `<span class="text-green-400">Проект:</span> <span class="text-yellow-300">Potok Mainer</span>`,
          `<span class="text-green-400">Монета:</span> <span class="text-yellow-300">PTC — Potok Coin</span>`,
          `<span class="text-green-400">Алгоритм:</span> <span class="text-cyan-300">SHA-256</span>`,
          `<span class="text-green-400">Статус:</span> <span class="text-green-300">⛏ МАЙНИНГ АКТИВЕН</span>`,
        ]

      case "майнинг":
      case "mining":
        return [
          '<span class="text-cyan-400 font-bold">⛏ СТАТУС МАЙНИНГА:</span>',
          '<span class="text-green-300">Монета: <span class="text-yellow-300">PTC (Potok Coin)</span></span>',
          '<span class="text-green-300">Пул: <span class="text-cyan-300">potok.pool</span></span>',
          `<span class="text-green-300">За клик: <span class="text-yellow-300">${PTC_PER_TAP} PTC</span></span>`,
          '<span class="text-green-300">Статус: <span class="text-green-400 font-bold">АКТИВЕН ✓</span></span>',
        ]

      case "trace":
      case "трассировка":
        return [
          '<span class="text-cyan-400">$ traceroute potok.mainer</span>',
          '<span class="text-gray-400">трассировка до potok.mainer...</span>',
          ' <span class="text-yellow-400">1</span>  <span class="text-green-300">gateway</span>  <span class="text-white">1.2 мс</span>',
          ' <span class="text-yellow-400">2</span>  <span class="text-cyan-300">10.0.0.1</span>  <span class="text-white">12.3 мс</span>',
          ' <span class="text-yellow-400">3</span>  <span class="text-cyan-300">172.16.0.1</span>  <span class="text-white">23.4 мс</span>',
          ' <span class="text-yellow-400">4</span>  <span class="text-red-400">* * *</span>',
          ' <span class="text-yellow-400">5</span>  <span class="text-cyan-300">potok.mainer</span>  <span class="text-white">45.6 мс</span>',
          '<span class="text-green-400">трассировка завершена ✓</span>',
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

  // Typewriter
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

  // IP fetch
  useEffect(() => {
    fetchIPInfo().then((info) => { ipInfoRef.current = info })
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
        setIsInteractive(true)
        setTimeout(() => {
          setTerminalLines((prev) => [
            ...prev,
            `<span class="text-gray-500">Узел: ${ipInfoRef.current}</span>`,
          ])
        }, 400)
      }
    }
    setTimeout(showNextLine, 300)
  }, [])

  // Cursor blink
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
          `<span class="text-yellow-400">potok@mainer:~$</span> <span class="text-white">${cmd}</span>`,
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

  const handleCoinClick = () => {
    setCoinPressed(true)
    setTimeout(() => setCoinPressed(false), 120)
    onTap()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 font-mono">
      {/* Title */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-green-400 uppercase tracking-widest">
          {displayText}
          <span className="animate-pulse text-green-300">_</span>
        </h1>
        <p className="text-gray-500 text-xs mt-2 tracking-widest">BLOCKCHAIN MINING SYSTEM · PTC</p>
      </div>

      {/* PTC Balance */}
      <div className="mb-6 border border-green-800 bg-black/80 backdrop-blur px-8 py-3 rounded text-center">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Баланс</div>
        <div className="text-yellow-400 font-bold text-xl md:text-2xl tabular-nums">
          ⓟ {ptcBalance.toFixed(8)} PTC
        </div>
        <div className="text-gray-600 text-xs mt-1">{PTC_PER_TAP} PTC за клик</div>
      </div>

      {/* PTC Coin Button */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Tap animations */}
        {tapAnimations.map((anim) => (
          <div
            key={anim.id}
            className="absolute pointer-events-none text-yellow-300 font-bold text-sm z-20"
            style={{
              top: -60 - Math.random() * 20,
              left: -20 + Math.random() * 40,
              animation: "tapFloat 0.9s ease-out forwards",
            }}
          >
            +{anim.value} PTC
          </div>
        ))}

        <button
          onClick={handleCoinClick}
          className={`relative w-40 h-40 md:w-52 md:h-52 rounded-full border-4 border-green-500 bg-gradient-to-br from-green-400 via-green-500 to-green-800 shadow-2xl shadow-green-500/40 transition-all duration-100 select-none cursor-pointer hover:shadow-green-400/60 focus:outline-none ${
            coinPressed ? "scale-90 shadow-green-300/80" : "scale-100 hover:scale-105"
          }`}
          aria-label="Майнить PTC"
        >
          <div className={`absolute inset-0 rounded-full border-2 border-green-300/50 transition-all ${coinPressed ? "opacity-100 scale-110" : "opacity-0"}`} />
          <span className="text-5xl md:text-7xl font-black text-white drop-shadow-lg select-none">P</span>
          <div className="absolute bottom-6 left-0 right-0 text-center text-green-200 text-xs font-bold tracking-widest">PTC</div>
          <div className="absolute top-5 left-7 w-6 h-3 bg-white/20 rounded-full rotate-[-30deg]" />
        </button>
      </div>

      {/* Terminal Window */}
      <div className="w-full max-w-2xl border border-green-800 bg-black/90 backdrop-blur rounded overflow-hidden shadow-2xl shadow-green-900/20">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-950/50 border-b border-green-900">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-yellow-600 text-xs">potok@mainer:~$</span>
        </div>

        <div
          ref={terminalRef}
          className="p-4 h-48 overflow-y-auto text-sm text-green-300 space-y-1 scroll-smooth"
        >
          {terminalLines.map((line, i) => (
            <div key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: line || "&nbsp;" }} />
          ))}
        </div>

        {isInteractive && (
          <div
            className="flex items-center gap-2 px-4 py-3 border-t border-green-900/50 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <span className="text-yellow-400 shrink-0">potok@mainer:~$</span>
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
