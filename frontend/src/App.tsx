import { ThemeProvider } from './context/ThemeContext'
import { AppRoutes } from './routes'

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}