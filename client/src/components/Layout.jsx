// client/src/components/Layout.jsx
// App shell: header, brand, navigation, actions

import { NavLink, Outlet } from "react-router-dom";
import RoleSwitcher from "./RoleSwitcher";
import SyncButton from "./SyncButton";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/field", label: "Field Worker" },
  { to: "/coordinator", label: "Coordinator" },
  { to: "/offline-test", label: "Debug" },
];

export default function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-inner">
          {/* Brand */}
          <NavLink to="/" className="app-brand">
            <span className="app-brand-logo">F</span>
            <span className="app-brand-name">Field Issue Tracker</span>
          </NavLink>

          {/* Navigation */}
          <nav className="app-nav">
            <div className="app-nav-links">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Actions: sync + role */}
            <div className="app-nav-actions">
              <SyncButton />
              <RoleSwitcher />
            </div>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
