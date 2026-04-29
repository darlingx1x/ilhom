/* Полное наполнение БД: расширенный каталог + номера + читатели + подписки + платежи */
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { config as loadEnv } from "dotenv"

loadEnv({ path: ".env.local" })

const SAMPLE_PDF = "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"

interface PublicationDef {
  slug: string
  title_ru: string
  title_uz: string
  description_ru: string
  description_uz: string
  category_slug: string
  type: "newspaper" | "magazine"
  price_per_month: number
  founded: number
  cadence: "daily" | "weekly" | "monthly" | "quarterly"
}

const publications: PublicationDef[] = [
  {
    slug: "khalq-suzi",
    title_ru: "Народное слово",
    title_uz: "Xalq so'zi",
    description_ru:
      "Главная общественно-политическая газета Узбекистана. Освещает решения парламента, реформы исполнительной власти, экономическую политику и социальные инициативы. Выходит шесть раз в неделю на двух языках, аудитория — государственные служащие, руководители предприятий, юристы, академические специалисты.",
    description_uz:
      "O'zbekistonning bosh ijtimoiy-siyosiy gazetasi. Parlament qarorlari, ijro hokimiyati islohotlari, iqtisodiy siyosat va ijtimoiy tashabbuslarni yoritadi. Haftada olti marta ikki tilda chiqadi, auditoriya — davlat xizmatchilari, korxona rahbarlari, yuristlar, akademik mutaxassislar.",
    category_slug: "newspapers",
    type: "newspaper",
    price_per_month: 28000,
    founded: 1991,
    cadence: "daily",
  },
  {
    slug: "biznes-daily",
    title_ru: "Бизнес Daily",
    title_uz: "Biznes Daily",
    description_ru:
      "Ежедневная деловая газета для предпринимателей и финансистов. Курсы валют, индексы Tashkent Stock Exchange, отчёты крупных компаний, аналитика экспорта и инвестиций, интервью с собственниками. Подписчики получают утренние брифинги в шесть тридцать.",
    description_uz:
      "Tadbirkorlar va moliyachilar uchun kundalik biznes gazetasi. Valyuta kurslari, Toshkent fond birjasi indekslari, yirik kompaniyalar hisobotlari, eksport va investitsiyalar tahlili, egalari bilan intervyular. Obunachilar har kuni ertalab oltidan o'ttizda brifinglar oladilar.",
    category_slug: "business",
    type: "newspaper",
    price_per_month: 45000,
    founded: 2008,
    cadence: "daily",
  },
  {
    slug: "fan-va-turmush",
    title_ru: "Наука и жизнь Узбекистана",
    title_uz: "Fan va Turmush",
    description_ru:
      "Научно-популярный журнал с шестидесятилетней историей. Расшифровки экспедиций Академии наук, материалы Института ядерной физики, разборы свежих публикаций в Nature и Science на русском языке, биографии узбекских учёных. Каждый номер — приложение для школьных факультативов.",
    description_uz:
      "Oltmish yillik tarixga ega ilmiy-ommabop jurnal. Fanlar akademiyasi ekspeditsiyalari hisobotlari, Yadro fizikasi instituti materiallari, Nature va Science jurnallaridagi yangi maqolalar tahlili, o'zbek olimlari biografiyasi. Har bir son maktab to'garaklari uchun ilova hisoblanadi.",
    category_slug: "science",
    type: "magazine",
    price_per_month: 38000,
    founded: 1962,
    cadence: "monthly",
  },
  {
    slug: "sharq-yulduzi",
    title_ru: "Звезда Востока",
    title_uz: "Sharq Yulduzi",
    description_ru:
      "Литературно-художественный журнал, публикующий новую узбекскую прозу и поэзию, переводы Памука, Эко, Боланьо, литературоведческие исследования. Автор первой публикации — кафедральная редколлегия Союза писателей. Журнал ведёт ежегодную премию для дебютантов.",
    description_uz:
      "Yangi o'zbek nasri va she'riyatini, Pamuk, Eko, Bolanyo tarjimalarini, adabiyotshunoslik tadqiqotlarini chop etadigan adabiy-badiiy jurnal. Birinchi nashr muallifi — Yozuvchilar uyushmasining kafedra tahririyati. Jurnal har yili debyutantlar uchun mukofot o'tkazadi.",
    category_slug: "culture",
    type: "magazine",
    price_per_month: 32000,
    founded: 1933,
    cadence: "monthly",
  },
  {
    slug: "sport-pres",
    title_ru: "Спорт Пресс",
    title_uz: "Sport Press",
    description_ru:
      "Спортивная газета о футболе, кураше, боксе, тхэквондо. Турнирные таблицы Суперлиги, репортажи с олимпийских и азиатских игр, интервью с тренерами сборной, медицинская колонка по реабилитации после травм. Включает приложение «Юный спортсмен» для детских секций.",
    description_uz:
      "Futbol, kurash, boks, taekvondo haqida sport gazetasi. Superliga jadvallari, Olimpiya va Osiyo o'yinlari hisobotlari, terma jamoa murabbiylari bilan intervyular, jarohatlardan keyin reabilitatsiya bo'yicha tibbiy ustun. Bolalar to'garaklari uchun \"Yosh sportchi\" ilovasini o'z ichiga oladi.",
    category_slug: "sport",
    type: "newspaper",
    price_per_month: 22000,
    founded: 1995,
    cadence: "weekly",
  },
  {
    slug: "gulkhan",
    title_ru: "Гулхан",
    title_uz: "Gulxan",
    description_ru:
      "Журнал для детей и подростков от десяти до пятнадцати лет. Приключенческие повести, головоломки, конкурсы рисунков, материалы о научных кружках при вузах, советы по выбору профессии. Главред — лауреат Государственной премии в области детской литературы.",
    description_uz:
      "O'n yoshdan o'n besh yoshgacha bo'lgan bolalar va o'smirlar uchun jurnal. Sarguzasht qissalari, boshqotirmalar, rasm tanlovlari, oliy o'quv yurtlaridagi ilmiy to'garaklar haqida materiallar, kasb tanlash bo'yicha maslahatlar. Bosh muharrir — bolalar adabiyoti sohasida Davlat mukofoti laureati.",
    category_slug: "kids",
    type: "magazine",
    price_per_month: 18000,
    founded: 1962,
    cadence: "monthly",
  },
  {
    slug: "tashkent-times",
    title_ru: "Tashkent Times",
    title_uz: "Tashkent Times",
    description_ru:
      "Англоязычная газета о жизни Ташкента и регионов. Аудитория — иностранные специалисты, дипломатические миссии, выпускники зарубежных вузов. Аналитика реформ, обзоры визовых политик, культурная афиша, интервью с резидентами IT Park.",
    description_uz:
      "Toshkent va viloyatlar hayoti haqida ingliz tilidagi gazeta. Auditoriya — chet ellik mutaxassislar, diplomatik vakolatxonalar, xorijiy oliy o'quv yurtlari bitiruvchilari. Islohotlar tahlili, viza siyosati sharhlari, madaniy afisha, IT Park rezidentlari bilan intervyular.",
    category_slug: "newspapers",
    type: "newspaper",
    price_per_month: 52000,
    founded: 1999,
    cadence: "weekly",
  },
  {
    slug: "uz-economy",
    title_ru: "Экономика Узбекистана",
    title_uz: "O'zbekiston Iqtisodiyoti",
    description_ru:
      "Ежемесячный экономический журнал Министерства экономики и финансов. Макроэкономические индикаторы, отчёты о бюджете, обзоры приватизации, прогнозы Центрального банка, методические материалы для региональных хокимиятов и налоговых инспекций.",
    description_uz:
      "Iqtisodiyot va moliya vazirligining oylik iqtisodiy jurnali. Makroiqtisodiy ko'rsatkichlar, byudjet hisobotlari, xususiylashtirish sharhlari, Markaziy bankning prognozlari, hududiy hokimliklar va soliq inspeksiyalari uchun uslubiy materiallar.",
    category_slug: "business",
    type: "magazine",
    price_per_month: 65000,
    founded: 2002,
    cadence: "monthly",
  },
  {
    slug: "madaniyat",
    title_ru: "Культура",
    title_uz: "Madaniyat",
    description_ru:
      "Театр, кино, выставки, фестивали. Афиша Большого театра имени Алишера Навои, программа кинофестиваля «Жемчужины Шёлкового пути», обзоры выставок в Музее искусств. Постоянные авторы — критики Союза театральных деятелей и кинокритики Госфильмофонда.",
    description_uz:
      "Teatr, kino, ko'rgazmalar, festivallar. Alisher Navoiy nomidagi Katta teatr afishasi, \"Ipak yo'li gavharlari\" kinofestivali dasturi, San'at muzeyidagi ko'rgazmalar sharhlari. Doimiy mualliflar — Teatr arboblari uyushmasi tanqidchilari va Davlat kinofotoarxivi kinotanqidchilari.",
    category_slug: "culture",
    type: "newspaper",
    price_per_month: 24000,
    founded: 1953,
    cadence: "weekly",
  },
  {
    slug: "yosh-kuchlari",
    title_ru: "Молодые силы",
    title_uz: "Yosh Kuchlari",
    description_ru:
      "Молодёжная газета о высшем образовании, стажировках, грантовых программах. Карты бюджетных мест на 2026 год, отчёты выпускников программ El-Yurt Umidi, обзоры зарубежных университетов с признанными узбекскими дипломами, истории резидентов Astrum IT Academy.",
    description_uz:
      "Oliy ta'lim, stajirovkalar, grant dasturlari haqida yoshlar gazetasi. 2026-yil byudjet o'rinlari xaritalari, El-Yurt Umidi dasturlari bitiruvchilari hisobotlari, o'zbek diplomlari tan olingan xorijiy universitetlar sharhlari, Astrum IT Academy rezidentlari hikoyalari.",
    category_slug: "newspapers",
    type: "newspaper",
    price_per_month: 19000,
    founded: 1925,
    cadence: "weekly",
  },
  {
    slug: "tech-uz",
    title_ru: "Tech Uzbekistan",
    title_uz: "Tech Uzbekistan",
    description_ru:
      "Журнал о технологиях, стартапах, цифровой экономике. Резиденты IT Park, IPO узбекских fintech-компаний, разборы решений Министерства цифрового развития, интервью с CTO банков и операторов связи. Колонка с обзорами zarplata.uz и hh.uz по IT-вакансиям.",
    description_uz:
      "Texnologiyalar, startaplar, raqamli iqtisodiyot haqida jurnal. IT Park rezidentlari, o'zbek fintech kompaniyalarining IPO'si, Raqamli rivojlanish vazirligi qarorlari tahlili, banklar va aloqa operatorlari CTO'lari bilan intervyular. zarplata.uz va hh.uz IT-vakansiyalari sharhi ustuni.",
    category_slug: "science",
    type: "magazine",
    price_per_month: 48000,
    founded: 2018,
    cadence: "monthly",
  },
  {
    slug: "saodat",
    title_ru: "Саодат",
    title_uz: "Saodat",
    description_ru:
      "Журнал для женщин с шестидесятилетней историей. Семейная психология, кулинария по сезонам, обзоры коллекций модельеров Ташкентской недели моды, материалы о здоровье женщин разных возрастов, рекомендации врачей республиканского перинатального центра.",
    description_uz:
      "Oltmish yillik tarixga ega ayollar uchun jurnal. Oilaviy psixologiya, mavsumlar bo'yicha pazandachilik, Toshkent moda haftaligi modelyerlari kolleksiyalari sharhlari, turli yoshdagi ayollar salomatligi haqida materiallar, respublika perinatal markazi shifokorlarining tavsiyalari.",
    category_slug: "magazines",
    type: "magazine",
    price_per_month: 27000,
    founded: 1961,
    cadence: "monthly",
  },
  {
    slug: "darakchi",
    title_ru: "Даракчи",
    title_uz: "Darakchi",
    description_ru:
      "Самая массовая узбекоязычная газета о повседневной жизни. Истории читателей, юридические консультации по вопросам ЖКХ и трудового кодекса, обзоры программ Министерства здравоохранения, кроссворды и рецепты от шеф-поваров узбекских ресторанов.",
    description_uz:
      "Kundalik hayot haqida eng ommaviy o'zbek tilidagi gazeta. O'quvchilar hikoyalari, KKX va mehnat kodeksi masalalari bo'yicha yuridik maslahatlar, Sog'liqni saqlash vazirligi dasturlari sharhi, krosvordlar va o'zbek restoranlari oshpazlaridan retseptlar.",
    category_slug: "newspapers",
    type: "newspaper",
    price_per_month: 21000,
    founded: 1995,
    cadence: "weekly",
  },
  {
    slug: "tafakkur",
    title_ru: "Тафаккур",
    title_uz: "Tafakkur",
    description_ru:
      "Философско-публицистический журнал Академии наук. Эссе о национальной идентичности, переводы Хабермаса и Сэндела, материалы Института истории, дискуссии об этике искусственного интеллекта, обзоры новых книг по политической философии.",
    description_uz:
      "Fanlar akademiyasining falsafiy-publitsistik jurnali. Milliy o'ziga xoslik haqida esselar, Xabermas va Sendel tarjimalari, Tarix instituti materiallari, sun'iy intellekt etikasi bo'yicha munozaralar, siyosiy falsafa bo'yicha yangi kitoblar sharhi.",
    category_slug: "culture",
    type: "magazine",
    price_per_month: 36000,
    founded: 1996,
    cadence: "quarterly",
  },
  {
    slug: "uchitelskaya",
    title_ru: "Учительская газета",
    title_uz: "O'qituvchilar gazetasi",
    description_ru:
      "Профессиональное издание для педагогов школ и колледжей. Обзоры новых учебных программ Министерства просвещения, методические разработки уроков, истории учителей-новаторов, информация о повышении квалификации, регулярная рубрика «Психология подростка».",
    description_uz:
      "Maktab va kollej o'qituvchilari uchun professional nashr. Maktab ta'limi vazirligining yangi o'quv dasturlari sharhi, dars metodik ishlanmalari, o'qituvchi-novatorlar hikoyalari, malaka oshirish haqida ma'lumot, doimiy \"O'smir psixologiyasi\" rukni.",
    category_slug: "newspapers",
    type: "newspaper",
    price_per_month: 17000,
    founded: 1934,
    cadence: "weekly",
  },
  {
    slug: "agro-news",
    title_ru: "Агро Новости",
    title_uz: "Agro Yangiliklar",
    description_ru:
      "Газета для фермеров и работников агропромышленного комплекса. Прогнозы Узгидромета, инструкции по применению удобрений, обзоры ярмарок Узагропродэкспорта, отчёты по урожаю хлопка и зерновых, программы льготного кредитования Агробанка.",
    description_uz:
      "Fermerlar va agrosanoat majmuasi xodimlari uchun gazeta. O'zgidromet prognozlari, o'g'itlarni qo'llash bo'yicha ko'rsatmalar, O'zagroprodeksport yarmarkalari sharhi, paxta va don hosildorligi hisobotlari, Agrobankning imtiyozli kreditlash dasturlari.",
    category_slug: "business",
    type: "newspaper",
    price_per_month: 23000,
    founded: 1991,
    cadence: "weekly",
  },
  {
    slug: "yoshlik",
    title_ru: "Ёшлик",
    title_uz: "Yoshlik",
    description_ru:
      "Литературный журнал для молодых авторов и читателей. Дебютные подборки прозы и поэзии, эссе о современной литературе, переводы из малых англоязычных журналов, рецензии студентов филологических факультетов на новинки книжного рынка.",
    description_uz:
      "Yosh mualliflar va o'quvchilar uchun adabiy jurnal. Nasr va she'riyat debyut to'plamlari, zamonaviy adabiyot haqida esselar, kichik ingliz tilidagi jurnallardan tarjimalar, filologiya fakulteti talabalarining kitob bozoridagi yangiliklarga retsenziyalari.",
    category_slug: "culture",
    type: "magazine",
    price_per_month: 25000,
    founded: 1982,
    cadence: "monthly",
  },
  {
    slug: "auto-uzb",
    title_ru: "Авто Узбекистан",
    title_uz: "Avto Uzbekistan",
    description_ru:
      "Журнал об автомобильном рынке. Тест-драйвы новых моделей UzAuto Motors, обзоры импортных кроссоверов, расчёт стоимости владения по регионам, советы по выбору автостраховки, новости дорожной полиции и реформы УБДД.",
    description_uz:
      "Avtomobil bozori haqida jurnal. UzAuto Motors yangi modellarining test-draylari, import krossoverlari sharhi, hududlar bo'yicha egalik qilish narxini hisoblash, avto sug'urta tanlash bo'yicha maslahatlar, yo'l politsiyasi yangiliklari va YHXBB islohoti.",
    category_slug: "magazines",
    type: "magazine",
    price_per_month: 31000,
    founded: 2007,
    cadence: "monthly",
  },
]

const readers = [
  { email: "reader1@example.uz", password: "password123", full_name: "Иван Тестов", phone: "+998901234567" },
  { email: "azizov@example.uz", password: "password123", full_name: "Азиз Азизов", phone: "+998931112233" },
  { email: "karimova@example.uz", password: "password123", full_name: "Дилнора Каримова", phone: "+998977654321" },
  { email: "yusupov@example.uz", password: "password123", full_name: "Шохрух Юсупов", phone: "+998939988776" },
  { email: "rahimova@example.uz", password: "password123", full_name: "Севинч Рахимова", phone: "+998901119900" },
  { email: "tursunov@example.uz", password: "password123", full_name: "Анвар Турсунов", phone: "+998935554433" },
  { email: "saidova@example.uz", password: "password123", full_name: "Малика Саидова", phone: "+998977778822" },
  { email: "olimov@example.uz", password: "password123", full_name: "Бобур Олимов", phone: "+998931233211" },
]

const cards = ["4421", "5588", "8830", "9912", "7711", "3344"]

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function shiftDays(date: Date, days: number): Date {
  const r = new Date(date)
  r.setDate(r.getDate() + days)
  return r
}

function shiftMonths(date: Date, months: number): Date {
  const r = new Date(date)
  r.setMonth(r.getMonth() + months)
  return r
}

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is not set")
  const sql = neon(url)

  console.log("→ wiping previous catalog data (keeping users + admin)")
  await sql`DELETE FROM payments`
  await sql`DELETE FROM subscriptions`
  await sql`DELETE FROM issues`
  await sql`DELETE FROM publications`

  console.log("→ filling publications")
  const cats = await sql`SELECT id, slug FROM categories`
  const catBySlug = new Map<string, number>(cats.map((c) => [c.slug, c.id]))

  for (const p of publications) {
    const catId = catBySlug.get(p.category_slug) ?? 1
    await sql`
      INSERT INTO publications (slug, title_ru, title_uz, description_ru, description_uz, cover_url, category_id, type, price_per_month, is_published)
      VALUES (
        ${p.slug}, ${p.title_ru}, ${p.title_uz},
        ${p.description_ru}, ${p.description_uz},
        '', ${catId}, ${p.type}, ${p.price_per_month}, TRUE
      )
    `
  }
  console.log(`✓ inserted ${publications.length} publications`)

  console.log("→ filling issues")
  const allPubs = await sql`SELECT id, slug FROM publications ORDER BY id`
  const today = new Date("2026-04-29")
  let issuesCount = 0
  for (const pub of allPubs) {
    const def = publications.find((p) => p.slug === pub.slug)!
    const stepDays = def.cadence === "daily" ? 2 : def.cadence === "weekly" ? 7 : def.cadence === "monthly" ? 30 : 90
    const totalIssues = def.cadence === "daily" ? 24 : def.cadence === "weekly" ? 16 : def.cadence === "monthly" ? 12 : 6
    let cursor = new Date(today)
    for (let i = 0; i < totalIssues; i++) {
      const issueNumber = totalIssues - i
      const datedAt = isoDate(cursor)
      await sql`
        INSERT INTO issues (publication_id, issue_number, title_ru, title_uz, published_at, pdf_url)
        VALUES (
          ${pub.id}, ${issueNumber},
          ${"Выпуск № " + issueNumber}, ${"Soni № " + issueNumber},
          ${datedAt}, ${SAMPLE_PDF}
        )
        ON CONFLICT (publication_id, issue_number) DO NOTHING
      `
      issuesCount++
      cursor = shiftDays(cursor, -stepDays)
    }
  }
  console.log(`✓ inserted ${issuesCount} issues`)

  console.log("→ filling readers")
  for (const r of readers) {
    const existing = await sql`SELECT id FROM users WHERE email = ${r.email}`
    if (existing.length > 0) continue
    const hash = await bcrypt.hash(r.password, 10)
    await sql`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES (${r.email}, ${hash}, ${r.full_name}, ${r.phone}, 'reader')
    `
  }
  const users = await sql`SELECT id, email FROM users WHERE role = 'reader' ORDER BY id`
  console.log(`✓ readers in DB: ${users.length}`)

  console.log("→ filling subscriptions and payments")
  const subscriptionsPlan: Array<{
    user_email: string
    pub_slug: string
    period: 1 | 3 | 12
    start_iso: string
    status: "active" | "expired" | "cancelled"
  }> = [
    { user_email: "reader1@example.uz", pub_slug: "khalq-suzi", period: 3, start_iso: "2026-03-01", status: "active" },
    { user_email: "reader1@example.uz", pub_slug: "biznes-daily", period: 1, start_iso: "2026-04-15", status: "active" },
    { user_email: "reader1@example.uz", pub_slug: "sharq-yulduzi", period: 12, start_iso: "2026-01-10", status: "active" },
    { user_email: "azizov@example.uz", pub_slug: "tech-uz", period: 12, start_iso: "2026-01-15", status: "active" },
    { user_email: "azizov@example.uz", pub_slug: "biznes-daily", period: 3, start_iso: "2026-02-01", status: "active" },
    { user_email: "karimova@example.uz", pub_slug: "saodat", period: 12, start_iso: "2026-02-12", status: "active" },
    { user_email: "karimova@example.uz", pub_slug: "madaniyat", period: 3, start_iso: "2026-04-01", status: "active" },
    { user_email: "karimova@example.uz", pub_slug: "yoshlik", period: 1, start_iso: "2025-12-01", status: "expired" },
    { user_email: "yusupov@example.uz", pub_slug: "sport-pres", period: 3, start_iso: "2026-03-10", status: "active" },
    { user_email: "yusupov@example.uz", pub_slug: "auto-uzb", period: 12, start_iso: "2026-02-20", status: "active" },
    { user_email: "rahimova@example.uz", pub_slug: "saodat", period: 3, start_iso: "2026-04-05", status: "active" },
    { user_email: "rahimova@example.uz", pub_slug: "fan-va-turmush", period: 12, start_iso: "2026-01-22", status: "active" },
    { user_email: "rahimova@example.uz", pub_slug: "gulkhan", period: 12, start_iso: "2026-02-01", status: "active" },
    { user_email: "tursunov@example.uz", pub_slug: "uz-economy", period: 12, start_iso: "2026-01-08", status: "active" },
    { user_email: "tursunov@example.uz", pub_slug: "tashkent-times", period: 3, start_iso: "2026-04-01", status: "active" },
    { user_email: "tursunov@example.uz", pub_slug: "tafakkur", period: 12, start_iso: "2025-09-15", status: "active" },
    { user_email: "saidova@example.uz", pub_slug: "uchitelskaya", period: 12, start_iso: "2026-01-05", status: "active" },
    { user_email: "saidova@example.uz", pub_slug: "darakchi", period: 3, start_iso: "2026-04-10", status: "active" },
    { user_email: "saidova@example.uz", pub_slug: "saodat", period: 1, start_iso: "2025-11-01", status: "cancelled" },
    { user_email: "olimov@example.uz", pub_slug: "agro-news", period: 12, start_iso: "2026-01-18", status: "active" },
    { user_email: "olimov@example.uz", pub_slug: "biznes-daily", period: 1, start_iso: "2026-03-25", status: "active" },
    { user_email: "olimov@example.uz", pub_slug: "yosh-kuchlari", period: 3, start_iso: "2026-02-05", status: "active" },
  ]

  let subsCreated = 0
  let paysCreated = 0
  for (let idx = 0; idx < subscriptionsPlan.length; idx++) {
    const plan = subscriptionsPlan[idx]
    const userRow = await sql`SELECT id FROM users WHERE email = ${plan.user_email}`
    const pubRow = await sql`SELECT id, price_per_month FROM publications WHERE slug = ${plan.pub_slug}`
    if (userRow.length === 0 || pubRow.length === 0) continue
    const userId = userRow[0].id
    const pubId = pubRow[0].id
    const pricePerMonth = pubRow[0].price_per_month
    const total = pricePerMonth * plan.period
    const start = new Date(plan.start_iso + "T00:00:00Z")
    const end = shiftMonths(start, plan.period)
    const sub = await sql`
      INSERT INTO subscriptions (user_id, publication_id, period_months, start_date, end_date, status, total_amount)
      VALUES (${userId}, ${pubId}, ${plan.period}, ${isoDate(start)}, ${isoDate(end)}, ${plan.status}, ${total})
      RETURNING id
    `
    subsCreated++
    const card = cards[idx % cards.length]
    const paidAt = new Date(start)
    paidAt.setHours(10 + (idx % 6), 30, 0, 0)
    await sql`
      INSERT INTO payments (subscription_id, amount, card_last4, status, paid_at)
      VALUES (${sub[0].id}, ${total}, ${card}, 'success', ${paidAt.toISOString()})
    `
    paysCreated++
    if (plan.status === "active" && plan.period === 12 && idx % 3 === 0) {
      const renewal = shiftMonths(start, 6)
      const renewalCard = cards[(idx + 2) % cards.length]
      await sql`
        INSERT INTO payments (subscription_id, amount, card_last4, status, paid_at)
        VALUES (${sub[0].id}, ${Math.round(total / 4)}, ${renewalCard}, 'success', ${renewal.toISOString()})
      `
      paysCreated++
    }
  }
  console.log(`✓ subscriptions: ${subsCreated}, payments: ${paysCreated}`)

  const stats = await sql`
    SELECT
      (SELECT count(*)::int FROM publications) AS publications,
      (SELECT count(*)::int FROM issues)       AS issues,
      (SELECT count(*)::int FROM users)        AS users,
      (SELECT count(*)::int FROM subscriptions WHERE status='active') AS active_subs,
      (SELECT COALESCE(SUM(amount),0)::int FROM payments)             AS total_revenue
  `
  console.log("\n=== final state ===")
  console.log(stats[0])
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
