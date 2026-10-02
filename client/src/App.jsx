// client/src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import FieldWorkerView from "./pages/FieldWorkerView";
import CoordinatorView from "./pages/CoordinatorView";
import ReportDetail from "./pages/ReportDetail";
import OfflineTest from "./pages/OfflineTest";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="field" element={<FieldWorkerView />} />
          <Route path="coordinator" element={<CoordinatorView />} />
          <Route path="report/:clientId" element={<ReportDetail />} />
          <Route path="offline-test" element={<OfflineTest />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
