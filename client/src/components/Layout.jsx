// client/src/components/Layout.jsx

import { NavLink, Outlet } from "react-router-dom";
import RoleSwitcher from "./RoleSwitcher";
import SyncButton from "./SyncButton";

export default function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1>Offline Field Issue Tracker</h1>
        <nav className="app-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/field">Field Worker</NavLink>
          <NavLink to="/coordinator">Coordinator</NavLink>
          <NavLink to="/offline-test">Debug</NavLink>
          <SyncButton />
          <RoleSwitcher />
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
