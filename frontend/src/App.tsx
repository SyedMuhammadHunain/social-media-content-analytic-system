import DashboardTemplate from './app/dashboard/page'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background-body, #111111)', color: 'var(--color-text-primary, #FFFFFF)' }}>
      <DashboardTemplate />
    </div>
  )
}
