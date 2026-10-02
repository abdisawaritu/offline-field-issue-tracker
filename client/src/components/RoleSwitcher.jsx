// client/src/components/RoleSwitcher.jsx

import { useRole } from "../store/useRole";

export default function RoleSwitcher() {
  const { role, setRole } = useRole();

  function handleChange(e) {
    setRole(e.target.value);
  }

  return (
    <div className="flex-row">
      <span className="text-muted" style={{ fontSize: 13 }}>
        Acting as:
      </span>
      <select
        value={role}
        onChange={handleChange}
        style={{
          padding: "4px 8px",
          borderRadius: 6,
          border: "1px solid var(--color-border)",
          fontSize: 13,
        }}
      >
        <option value="field-worker">Field Worker</option>
        <option value="coordinator">Coordinator</option>
      </select>
    </div>
  );
}
