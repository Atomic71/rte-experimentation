import { useEffect, useMemo, useState } from 'react'

import { debounce } from 'lodash'

/**
 * Generic hook for debouncing any value
 * Returns both the immediate value and the debounced value
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Object containing the immediate and debounced values
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number = 300,
): {
  value: T
  debouncedValue: T
} {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  const debouncedUpdate = useMemo(
    () =>
      debounce((newValue: T) => {
        setDebouncedValue(newValue)
      }, delay),
    [delay],
  )

  useEffect(() => {
    debouncedUpdate(value)
    return debouncedUpdate.cancel
  }, [value, debouncedUpdate])

  return {
    value,
    debouncedValue,
  }
}