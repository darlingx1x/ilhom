-- Базовый seed. Пароль admin123 → bcrypt будет вычислен на этапе API.
-- Для локального теста можно вставить заранее посчитанный хеш.

INSERT INTO categories (slug, name_ru, name_uz) VALUES
  ('newspapers', 'Газеты',     'Gazetalar'),
  ('magazines',  'Журналы',    'Jurnallar'),
  ('business',   'Бизнес',     'Biznes'),
  ('science',    'Наука',      'Fan'),
  ('culture',    'Культура',   'Madaniyat'),
  ('kids',       'Детские',    'Bolalar'),
  ('sport',      'Спорт',      'Sport')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO publications (slug, title_ru, title_uz, description_ru, description_uz, cover_url, category_id, type, price_per_month, is_published)
SELECT * FROM (VALUES
  ('khalq-suzi',     'Народное слово',          'Xalq so''zi',           'Главная общественно-политическая газета страны.', 'Mamlakatning bosh ijtimoiy-siyosiy gazetasi.',         '', 1, 'newspaper', 28000, TRUE),
  ('biznes-daily',   'Бизнес Daily',            'Biznes Daily',          'Деловые новости, аналитика рынков и финансов.',     'Biznes yangiliklari, bozor va moliyaviy tahlillar.',   '', 3, 'newspaper', 45000, TRUE),
  ('fan-va-turmush', 'Наука и жизнь Узбекистана','Fan va Turmush',       'Научно-популярный журнал, исследования и открытия.','Ilmiy-ommabop jurnal, tadqiqotlar va kashfiyotlar.',   '', 4, 'magazine',  38000, TRUE),
  ('sharq-yulduzi',  'Звезда Востока',          'Sharq Yulduzi',         'Литературно-художественный журнал, проза и поэзия.','Adabiy-badiiy jurnal, nasr va she''riyat.',           '', 5, 'magazine',  32000, TRUE),
  ('sport-pres',     'Спорт Пресс',             'Sport Press',           'Футбол, кураш, бокс. Турниры и обзоры матчей.',     'Futbol, kurash, boks. Turnirlar va o''yin sharhlari.', '', 7, 'newspaper', 22000, TRUE),
  ('gulkhan',        'Гулхан',                  'Gulxan',                'Журнал для детей и подростков, истории и игры.',    'Bolalar va o''smirlar uchun jurnal, hikoyalar va o''yinlar.', '', 6, 'magazine', 18000, TRUE),
  ('tashkent-times', 'Tashkent Times',          'Tashkent Times',        'Английская газета о жизни Ташкента и страны.',      'Toshkent va mamlakat hayoti haqida ingliz tilidagi gazeta.',  '', 1, 'newspaper', 52000, TRUE),
  ('uz-economy',     'Экономика Узбекистана',   'O''zbekiston Iqtisodiyoti','Ежемесячный экономический журнал, статистика и прогнозы.','Oylik iqtisodiy jurnal, statistika va prognozlar.',  '', 3, 'magazine',  65000, TRUE),
  ('madaniyat',      'Культура',                'Madaniyat',             'Театр, кино, выставки. Афиша и критика.',           'Teatr, kino, ko''rgazmalar. Afisha va tanqid.',        '', 5, 'newspaper', 24000, TRUE),
  ('yosh-kuchlari',  'Молодые силы',            'Yosh Kuchlari',         'Молодёжная газета, образование и карьера.',         'Yoshlar gazetasi, ta''lim va karyera.',                '', 1, 'newspaper', 19000, TRUE),
  ('tech-uz',        'Tech Uzbekistan',         'Tech Uzbekistan',       'Технологии, стартапы, цифровая экономика.',         'Texnologiyalar, startaplar, raqamli iqtisodiyot.',     '', 4, 'magazine',  48000, TRUE),
  ('saodat',         'Саодат',                  'Saodat',                'Журнал для женщин, дом, мода, психология.',         'Ayollar uchun jurnal, uy, moda, psixologiya.',         '', 2, 'magazine',  27000, TRUE)
) AS v(slug, title_ru, title_uz, description_ru, description_uz, cover_url, category_id, type, price_per_month, is_published)
ON CONFLICT (slug) DO NOTHING;
