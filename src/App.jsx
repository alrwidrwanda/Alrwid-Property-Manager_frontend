import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from '@/layout/Layout'
import Dashboard from '@/pages/Pages/Dashboard'
import Apartments from '@/pages/Pages/Apartments'
import Clients from '@/pages/Pages/Clients'
import ClientProfile from '@/pages/Pages/ClientProfile'
import Contracts from '@/pages/Pages/Contracts'
import SalesAndPayments from '@/pages/Pages/SalesAndPayments'
import Reports from '@/pages/Pages/Reports'
import Home from '@/pages/Pages/Home'
import './App.css'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/Dashboard" replace />} />
            <Route path="Dashboard" element={<Dashboard />} />
            <Route path="Apartments" element={<Apartments />} />
            <Route path="Clients" element={<Clients />} />
            <Route path="ClientProfile" element={<ClientProfile />} />
            <Route path="Contracts" element={<Contracts />} />
            <Route path="SalesAndPayments" element={<SalesAndPayments />} />
            <Route path="Reports" element={<Reports />} />
            <Route path="Home" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
