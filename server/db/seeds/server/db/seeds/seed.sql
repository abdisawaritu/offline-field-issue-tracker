-- Seed data for demonstration

INSERT INTO reports (
    id, client_id, category, description, location,
    priority, status, created_by, reported_at,
    client_updated_at, sync_version
) VALUES (
    UUID(),
    '11111111-1111-4111-8111-111111111111',
    'Broken Water Point',
    'Hand pump at the village well is broken and not producing water',
    'Gode, Somali Region',
    'HIGH',
    'SUBMITTED',
    'field-worker-1',
    NOW() - INTERVAL 2 DAY,
    NOW() - INTERVAL 2 DAY,
    1
);

INSERT INTO reports (
    id, client_id, category, description, location,
    priority, status, created_by, assigned_to, reported_at,
    client_updated_at, sync_version
) VALUES (
    UUID(),
    '22222222-2222-4222-8222-222222222222',
    'Damaged Equipment',
    'Solar panel damaged by storm, battery not charging',
    'Hawassa Health Center',
    'MEDIUM',
    'ASSIGNED',
    'field-worker-2',
    'coordinator-1',
    NOW() - INTERVAL 1 DAY,
    NOW() - INTERVAL 1 DAY,
    1
);

INSERT INTO reports (
    id, client_id, category, description, location,
    priority, status, created_by, assigned_to, reported_at,
    client_updated_at, sync_version
) VALUES (
    UUID(),
    '33333333-3333-4333-8333-333333333333',
    'Safety Concern',
    'Exposed electrical wiring near the primary school playground',
    'Adama Primary School',
    'HIGH',
    'IN_PROGRESS',
    'field-worker-1',
    'coordinator-1',
    NOW() - INTERVAL 6 HOUR,
    NOW() - INTERVAL 6 HOUR,
    1
);