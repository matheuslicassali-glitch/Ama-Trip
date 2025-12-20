import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Trip from './pages/Trip';
import History from './pages/History';
import Fuel from './pages/Fuel';
import Registry from './pages/Registry';
import Login from './pages/Login';
import Reports from './pages/Reports';
import ServiceOrder from './pages/ServiceOrder';

function App() {
  return (
    <Router>
      <AppProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trip" element={<Trip />} />
            <Route path="/history" element={<History />} />
            <Route path="/fuel" element={<Fuel />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/service-order" element={<ServiceOrder />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </AppProvider>
    </Router>
  );
}

export default App;
