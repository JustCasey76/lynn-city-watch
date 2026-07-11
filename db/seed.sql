-- Lynn City Watch — seed data (idempotent).
-- REAL data: councilors + issue categories. Safe to run on every boot.

-- ---------- issue categories ----------
INSERT INTO categories (slug, name, sort) VALUES
  ('public-safety','Public Safety',10),
  ('police','Police',20),
  ('fire','Fire',30),
  ('schools','Schools',40),
  ('taxes','Taxes',50),
  ('budget','Budget & Spending',60),
  ('housing','Housing',70),
  ('zoning','Zoning & Development',80),
  ('immigration','Immigration-related',90),
  ('legal','Legal Services',100),
  ('social','Social policy',110),
  ('lgbtq','LGBTQ-related policy',120),
  ('accessibility','Accessibility-related policy',130),
  ('infrastructure','Infrastructure',140),
  ('public-works','Public Works',150),
  ('city-services','City Services',160),
  ('transparency','Transparency',170),
  ('ethics','Ethics',180),
  ('appointments','Appointments',190),
  ('grants','Grants',200)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, sort = EXCLUDED.sort;

-- ---------- current council (real; source: lynnma.gov, 2026) ----------
INSERT INTO councilors (id, name, seat, seat_type, ward_number, title, phone, source_url) VALUES
  ('meaney',  'Dr. Peter D. Meaney',            'Ward 1',  'ward', 1, '',                       '617-304-5791', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('matul',   'Obed A. Matul',                  'Ward 2',  'ward', 2, '',                       '781-632-1270', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('alinsug', 'Constantino "Coco" Alinsug',     'Ward 3',  'ward', 3, 'Council President',      '781-913-3747', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('maddrey', 'Natasha S. Megie-Maddrey, Esq.', 'Ward 4',  'ward', 4, '',                       '781-910-3992', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('paez',    'Cardeliz Paez',                  'Ward 5',  'ward', 5, '',                       '781-200-4982', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('hogan',   'Frederick "Fred" W. Hogan',      'Ward 6',  'ward', 6, 'Council Vice President', '781-910-3891', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('avery',   'Jordan T. Avery',                'Ward 7',  'ward', 7, '',                       '781-200-4984', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('lapierre','Brian P. LaPierre',              'At-Large','atlarge', NULL, '',                 '617-974-1243', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('net',     'Hong L. Net',                    'At-Large','atlarge', NULL, '',                 '781-910-4906', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('field',   'Brian M. Field',                 'At-Large','atlarge', NULL, '',                 '781-953-4841', 'https://www.lynnma.gov/city_government/citycouncil/councilors'),
  ('mcclain', 'Nicole D. McClain',              'At-Large','atlarge', NULL, '',                 '781-261-0786', 'https://www.lynnma.gov/city_government/citycouncil/councilors')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, seat = EXCLUDED.seat, seat_type = EXCLUDED.seat_type,
  ward_number = EXCLUDED.ward_number, title = EXCLUDED.title, phone = EXCLUDED.phone,
  source_url = EXCLUDED.source_url;

-- ---------- historical councilors (prior 2024-2025 term; not on the current council) ----------
-- Wards 5 and 7 changed hands for the 2026-2027 term (Chakoutis->Paez, Walsh->Avery).
-- Kept for the 2024-2025 voting record; active=false so they do not appear in the current roster.
INSERT INTO councilors (id, name, seat, seat_type, ward_number, active, term_start, term_end, source_url) VALUES
  ('walsh',     'John M. Walsh, Jr.',    'Ward 7', 'ward', 7, FALSE, '2024-01-01', '2026-01-05', 'https://www.lynnma.gov/city_government/citycouncil/meeting'),
  ('chakoutis', 'Dianna M. Chakoutis',   'Ward 5', 'ward', 5, FALSE, '2024-01-01', '2026-01-05', 'https://www.lynnma.gov/city_government/citycouncil/meeting')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, seat = EXCLUDED.seat, ward_number = EXCLUDED.ward_number, active = EXCLUDED.active;

-- ---------- unaccounted / unclear funds: verified records-gap entries ----------
INSERT INTO unaccounted_funds
  (fiscal_year, item, amount, what_records_show, what_records_do_not_show, records_reviewed, source_url, confidence, status)
VALUES
  (2025,
   'Intergovernmental revenue not itemized by source',
   325066934,
   'The FY2025 audited General Fund reports $325,066,934 in intergovernmental revenue (budgetary comparison schedule, p.83) — about 62% of total General Fund revenue of $523,450,373.',
   'The audit presents intergovernmental revenue as a single line and does not break it into state versus federal sources or by program, so the exact state/federal split cannot be determined from this document.',
   'City of Lynn audited financial statements, FY2025 (General Fund budgetary comparison schedule, p.83).',
   'https://www.lynnma.gov/city_government/departments/comptrollers/financial_statements',
   'high', 'open')
ON CONFLICT (fiscal_year, item) DO NOTHING;
