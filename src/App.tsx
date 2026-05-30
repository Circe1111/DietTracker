import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import FoodLog from '@/pages/FoodLog'
import Exercise from '@/pages/Exercise'
import Settings from '@/pages/Settings'
import Setup from '@/pages/Setup'
import Circle from '@/pages/Circle'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/food" element={<FoodLog />} />
          <Route path="/exercise" element={<Exercise />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/circle" element={<Circle />} />
        </Route>
        <Route path="/setup" element={<Setup />} />
      </Routes>
    </ErrorBoundary>
  )
}
