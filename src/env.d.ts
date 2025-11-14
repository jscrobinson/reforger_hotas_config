/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Global build-time constants injected by Vite
declare const __GIT_HASH__: string

// Google AdSense
interface Window {
  adsbygoogle: any[]
}
