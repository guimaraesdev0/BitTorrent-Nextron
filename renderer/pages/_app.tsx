import React from 'react'
import type { AppProps } from 'next/app'

import "./styles/globals.css"

function SteamVerde({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default SteamVerde