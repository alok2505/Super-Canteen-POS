import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import POS from "./pages/POS";
import Bills from "./pages/Bills";
import Products from "./pages/Products";
import BillDetails from "./pages/BillDetails";
import HoldBills from "./pages/HoldBills";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Franchises from "./pages/Franchises";
import Staff from "./pages/Staff";
import Catalog from "./pages/Catalog";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const StoreManagerRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user?.role === "StoreManager" ? children : <Navigate to="/products" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Navigate to="/pos" />} />
            <Route path="/pos" element={<StoreManagerRoute><POS /></StoreManagerRoute>} />
            <Route path="/products" element={<Products />} />
            <Route path="/bills" element={<Bills />} />
            <Route path="/bills/:id" element={<BillDetails />} />
            <Route path="/hold-bills" element={<HoldBills />} />
            <Route path="/franchises" element={<Franchises />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/catalog" element={<StoreManagerRoute><Catalog /></StoreManagerRoute>} />
          </Route>

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
