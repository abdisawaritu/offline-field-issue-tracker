// client/src/App.jsx

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import OfflineTest from "./pages/OfflineTest";

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ marginRight: 16 }}>
          Home
        </Link>
        <Link to="/offline-test">Offline Storage Test</Link>
      </nav>

      <Routes>
        <Route
          path="/"
          element={
            <div style={{ padding: 24 }}>
              <h1>Offline Field Issue Tracker</h1>
              <p>
                Go to the <Link to="/offline-test">Offline Storage Test</Link>{" "}
                page to verify IndexedDB persistence.
              </p>
            </div>
          }
        />
        <Route path="/offline-test" element={<OfflineTest />} />
      </Routes>
    </BrowserRouter>
  );
}
