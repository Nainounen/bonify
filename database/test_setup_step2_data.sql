-- SCHRITT 2: Führe dieses Skript NACH Schritt 1 aus
-- Löschen Sie vorher den Editor-Inhalt komplett!
-- 1. Tabelle für Regionen erstellen (falls nicht vorhanden)
CREATE TABLE
  IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW ()
  );

-- RLS für Regionen aktivieren (wichtig!)
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON regions FOR
SELECT
  USING (true);

-- 2. Test-Region erstellen
INSERT INTO
  regions (name)
VALUES
  ('Region Ostschweiz') ON CONFLICT (name) DO NOTHING;

-- 3. Test-Shop erstellen und der Region zuweisen
INSERT INTO
  shops (name)
VALUES
  ('Test Shop Zürich') ON CONFLICT DO NOTHING;

UPDATE shops
SET
  region_id = (
    SELECT
      id
    FROM
      regions
    WHERE
      name = 'Region Ostschweiz'
    LIMIT
      1
  )
WHERE
  name = 'Test Shop Zürich';

-- 4. Rolle zuweisen
-- WICHTIG: Ersetzen Sie 'your-email@example.com' unten mit Ihrer echten Email!
UPDATE employees
SET
  role = 'regional_manager',
  region_id = (
    SELECT
      id
    FROM
      regions
    WHERE
      name = 'Region Ostschweiz'
    LIMIT
      1
  ),
  shop_id = NULL
WHERE
  email = 'your-email@example.com';