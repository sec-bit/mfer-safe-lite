import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Popup = lazy(() => import('@/views/Popup'));
const Transaction = lazy(() => import('@/views/Transaction'));

const AppRoutes = () => {
  return (
    <Suspense fallback="Loading...">
      <Routes>
        <Route path="/">
          <Route index element={<Popup />} />
          <Route path=":transactionId" element={<Transaction />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
