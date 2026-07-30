import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { App as AntApp, ConfigProvider, Spin } from 'antd'
import { store, persistor } from './redux/store'
import GlobalErrorBoundary from './components/common/GlobalErrorBoundary'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <Provider store={store}>
        {/* PersistGate delays rendering until persisted state is rehydrated */}
        <PersistGate loading={<Spin fullscreen />} persistor={persistor}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FF5B03',
                fontFamily: 'Inter, system-ui, sans-serif',
              },
            }}
          >
            <AntApp>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AntApp>
          </ConfigProvider>
        </PersistGate>
      </Provider>
    </GlobalErrorBoundary>
  </StrictMode>,
)
