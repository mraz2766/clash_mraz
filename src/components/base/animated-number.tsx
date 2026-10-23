import { useMotionValueEvent, useReducedMotion, useSpring } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { springs } from '@/lib/motion'

const NUMERIC = /^-?\d+(\.\d+)?$/

interface Props {
  value: string | number | null | undefined
  /** Jump instead of tweening when this changes, e.g. the unit switching KB → MB. */
  resetKey?: string
}

// Eases a live number toward each new value. Frames write straight to the DOM,
// so a once-a-second stat update never re-renders React sixty times.
export const AnimatedNumber = ({ value, resetKey }: Props) => {
  const text = value === null || value === undefined ? '—' : String(value)
  const numeric = NUMERIC.test(text)
  const target = numeric ? Number.parseFloat(text) : 0
  const decimals = numeric ? (text.split('.')[1]?.length ?? 0) : 0

  const reduced = useReducedMotion()
  const spring = useSpring(target, springs.number)
  const ref = useRef<HTMLSpanElement>(null)
  const decimalsRef = useRef(decimals)
  const keyRef = useRef(resetKey)
  // React owns only the first paint; later updates go through the spring.
  const [initialText] = useState(text)

  useEffect(() => {
    decimalsRef.current = decimals
    if (!numeric) {
      if (ref.current) ref.current.textContent = text
      return
    }
    const showingNumber = NUMERIC.test(ref.current?.textContent ?? '')
    if (reduced || keyRef.current !== resetKey || !showingNumber) {
      keyRef.current = resetKey
      spring.jump(target)
      if (ref.current) ref.current.textContent = text
      return
    }
    spring.set(target)
  }, [numeric, target, text, decimals, resetKey, reduced, spring])

  useMotionValueEvent(spring, 'change', (latest) => {
    if (ref.current && NUMERIC.test(ref.current.textContent ?? '')) {
      ref.current.textContent = latest.toFixed(decimalsRef.current)
    }
  })

  return <span ref={ref}>{initialText}</span>
}
