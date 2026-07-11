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
  ('immigration','Immigration',90),
  ('legal','Legal Services',100),
  ('social','Social Issues',110),
  ('lgbtq','LGBTQ / Pride',120),
  ('accessibility','Accessibility',130),
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
