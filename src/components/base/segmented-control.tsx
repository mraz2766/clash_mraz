import { ToggleButton, ToggleButtonGroup, type SxProps } from '@mui/material'
import { m } from 'motion/react'
import { type ReactNode, useId } from 'react'

import { springs } from '@/lib/motion'

interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
}

interface Props<T extends string> {
  value: T | null | undefined
  options: readonly SegmentedOption<T>[]
  onChange: (value: T) => void
  ariaLabel?: string
  disabled?: boolean
  sx?: SxProps
}

// Windows-style segmented control: a single surface "thumb" glides to the
// selected option, so switching modes reads as one continuous motion.
export const SegmentedControl = <T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  sx,
}: Props<T>) => {
  const thumbId = useId()
  return (
    <ToggleButtonGroup
      className="workspace-segmented"
      exclusive
      size="small"
      value={value ?? null}
      disabled={disabled}
      aria-label={ariaLabel}
      sx={sx}
      onChange={(_, next: T | null) => {
        if (next) onChange(next)
      }}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          {option.value === value && (
            <m.span
              layoutId={thumbId}
              className="segmented-thumb"
              transition={springs.snappy}
              aria-hidden="true"
            />
          )}
          <span className="segmented-label">{option.label}</span>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
