-- SCHRITT 1: Führe NUR dieses Skript aus
-- Dies fügt die Rolle zur Datenbank hinzu.
-- Wenn Sie "Success" sehen, löschen Sie den Editor und machen Sie weiter mit Schritt 2.
ALTER TYPE employee_role ADD VALUE IF NOT EXISTS 'regional_manager';