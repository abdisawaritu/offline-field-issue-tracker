// client/src/pages/Home.jsx

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <div className="card">
        <h2>Welcome</h2>
        <p>
          This application helps field workers report infrastructure issues even
          when they are offline. Reports are saved locally and synchronized
          automatically when connectivity returns.
        </p>
      </div>

      <div className="card">
        <h3>Field Worker</h3>
        <p>Create new reports, view your reports, and see sync status.</p>
        <Link className="btn" to="/field">
          Go to Field Worker view
        </Link>
      </div>

      <div className="card">
        <h3>Coordinator</h3>
        <p>
          Review submitted reports, assign work, update status, and view
          history.
        </p>
        <Link className="btn" to="/coordinator">
          Go to Coordinator view
        </Link>
      </div>

      <div className="card">
        <h3>Debug</h3>
        <p>Verify IndexedDB persistence and sync queue.</p>
        <Link className="btn btn-secondary" to="/offline-test">
          Open debug page
        </Link>
      </div>
    </div>
  );
}
