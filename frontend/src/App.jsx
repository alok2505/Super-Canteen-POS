import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import POS from "./pages/POS";
import Bills from "./pages/Bills";
import Products from "./pages/Products";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Navigate to="/pos" />}
          />

          <Route
            path="/pos"
            element={<POS />}
          />

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/bills"
            element={<Bills />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;