'use client';

import Dashboard from '../modules/dashboard';
import { ProtectedRoute } from '../components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
