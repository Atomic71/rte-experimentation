import { WebViewMessage } from '../types'

const RN = (window as any).ReactNativeWebView

export const postMessage = (type: WebViewMessage['type'], payload?: any) => {
  try {
    RN?.postMessage?.(JSON.stringify({ type, payload }))
  } catch (error) {
    console.error('Failed to post message to React Native:', error)
  }
}

export const setupMessageListener = (
  onMessage: (message: WebViewMessage) => void
): (() => void) => {
  const handleMessage = (e: MessageEvent) => {
    try {
      const message = JSON.parse((e as any).data) as WebViewMessage
      onMessage(message)
    } catch (error) {
      console.warn('Failed to parse message from React Native:', error)
    }
  }

  window.addEventListener('message', handleMessage)
  document.addEventListener('message', handleMessage as any) // Android support

  return () => {
    window.removeEventListener('message', handleMessage)
    document.removeEventListener('message', handleMessage as any)
  }
}