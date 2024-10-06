import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { BrowserRouter } from 'react-router-dom'

import { WagmiProvider } from 'wagmi'
// import { config } from "./config.ts"
import { wagmiAdapter } from "./config.ts"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast';
// import "./mockEnv.ts"

const queryClient = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <>
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Theme>
          <App />
        </Theme>
      </QueryClientProvider>
    </WagmiProvider>
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{ zIndex: 2147483647 }}
      toastOptions={{
        // Define default options
        className: "",
        duration: 5000,
        style: {
          border: '5px solid #713200',
          padding: '16px',
          color: '#713200',
          fontWeight: 'bold',
        },
      }} />
  </>
)
