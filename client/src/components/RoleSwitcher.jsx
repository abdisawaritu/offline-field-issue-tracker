// client/src/components/RoleSwitcher.jsx
// Simulated auth: pill-style role switcher

import { useRole } from "../store/useRole";

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  function handleChange(e) {
    setRole(e.target.value);
  }

  const initials = role === "coordinator" ? "CO" : "FW";
  const label = role === "coordinator" ? "Coordinator" : "Field Worker";

  return (
    <label className="role-switcher">
      <span className="role-switcher-avatar">{initials}</span>
      <select
        className="role-switcher-select"
        value={role}
        onChange={handleChange}
        aria-label="Switch role"
      >
        <option value="field-worker">Field Worker</option>
        <option value="coordinator">Coordinator</option>
      </select>
      <span className="role-switcher-chevron" aria-hidden="true">
        ▾
      </span>
      <span className="role-switcher-label">{label}</span>
    </label>
  );
}
