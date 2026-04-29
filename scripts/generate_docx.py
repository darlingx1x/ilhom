"""Генератор Проектной работы-2 Абдуллаева И.

Запуск: python3 scripts/generate_docx.py
Результат: «Проектная работа Абдуллаев И.docx» в корне репозитория.
"""
from __future__ import annotations

from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Mm, Pt

ROOT = Path(__file__).resolve().parent.parent
OUT_FILE = ROOT / "Проектная работа Абдуллаев И.docx"
SCREENS_DIR = ROOT / "docs" / "screens"

FONT = "Times New Roman"
DEPLOY_URL = "https://ilhom-oj9x.vercel.app/"


# ────────────────────────────── низкоуровневые помощники ──────────────────────────────


def _set_run_font(run, *, size: int = 14, bold: bool = False, italic: bool = False) -> None:
    run.font.name = FONT
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    rPr = run._element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rFonts.set(qn(attr), FONT)


def _set_style_font(style, *, size: int = 14, bold: bool = False, italic: bool = False) -> None:
    style.font.name = FONT
    style.font.size = Pt(size)
    style.font.bold = bold
    style.font.italic = italic
    rPr = style.element.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    for attr in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rFonts.set(qn(attr), FONT)


def setup_styles(doc: Document) -> None:
    styles = doc.styles

    normal = styles["Normal"]
    _set_style_font(normal, size=14)
    pf = normal.paragraph_format
    pf.line_spacing = 1.5
    pf.first_line_indent = Cm(1.25)
    pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf.space_before = Pt(0)
    pf.space_after = Pt(0)

    h1 = styles["Heading 1"]
    h1.base_style = normal
    _set_style_font(h1, size=14, bold=True)
    h1.font.color.rgb = None
    h1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    h1.paragraph_format.first_line_indent = Cm(0)
    h1.paragraph_format.line_spacing = 1.5
    h1.paragraph_format.space_before = Pt(0)
    h1.paragraph_format.space_after = Pt(18)
    h1.paragraph_format.keep_with_next = True
    h1.paragraph_format.page_break_before = True

    h2 = styles["Heading 2"]
    h2.base_style = normal
    _set_style_font(h2, size=14, bold=True)
    h2.font.color.rgb = None
    h2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
    h2.paragraph_format.first_line_indent = Cm(1.25)
    h2.paragraph_format.line_spacing = 1.5
    h2.paragraph_format.space_before = Pt(12)
    h2.paragraph_format.space_after = Pt(6)
    h2.paragraph_format.keep_with_next = True
    h2.paragraph_format.page_break_before = False

    if "Caption" in styles:
        caption = styles["Caption"]
        _set_style_font(caption, size=12)
        caption.font.italic = False
        caption.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        caption.paragraph_format.first_line_indent = Cm(0)
        caption.paragraph_format.line_spacing = 1.0
        caption.paragraph_format.space_before = Pt(6)
        caption.paragraph_format.space_after = Pt(12)


def setup_section(section, *, with_page_number: bool = False, start_page: int | None = None) -> None:
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.left_margin = Mm(30)
    section.right_margin = Mm(20)
    section.top_margin = Mm(25)
    section.bottom_margin = Mm(25)
    section.header_distance = Mm(12)
    section.footer_distance = Mm(12)

    section.footer.is_linked_to_previous = False
    section.header.is_linked_to_previous = False

    footer_p = section.footer.paragraphs[0] if section.footer.paragraphs else section.footer.add_paragraph()
    footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for r in list(footer_p.runs):
        r._element.getparent().remove(r._element)

    if with_page_number:
        run = footer_p.add_run()
        _set_run_font(run, size=14)
        fld_begin = OxmlElement("w:fldChar")
        fld_begin.set(qn("w:fldCharType"), "begin")
        instr = OxmlElement("w:instrText")
        instr.set(qn("xml:space"), "preserve")
        instr.text = " PAGE   \\* MERGEFORMAT "
        fld_end = OxmlElement("w:fldChar")
        fld_end.set(qn("w:fldCharType"), "end")
        run._element.append(fld_begin)
        run._element.append(instr)
        run._element.append(fld_end)

    if start_page is not None:
        sectPr = section._sectPr
        pg = sectPr.find(qn("w:pgNumType"))
        if pg is None:
            pg = OxmlElement("w:pgNumType")
            sectPr.append(pg)
        pg.set(qn("w:start"), str(start_page))


def add_para(doc, text: str = "", *, align=None, first_line: Cm | None = None,
              bold: bool = False, italic: bool = False, size: int = 14, style=None):
    p = doc.add_paragraph(style=style) if style else doc.add_paragraph()
    if align is not None:
        p.alignment = align
    if first_line is not None:
        p.paragraph_format.first_line_indent = first_line
    if text:
        run = p.add_run(text)
        _set_run_font(run, size=size, bold=bold, italic=italic)
    return p


def add_runs(doc, parts, *, align=None, first_line: Cm | None = None, size: int = 14, style=None):
    """Параграф со смешанным форматированием: parts = [(text, {bold,italic,size})]."""
    p = doc.add_paragraph(style=style) if style else doc.add_paragraph()
    if align is not None:
        p.alignment = align
    if first_line is not None:
        p.paragraph_format.first_line_indent = first_line
    for part in parts:
        if isinstance(part, str):
            text, opts = part, {}
        else:
            text, opts = part
        run = p.add_run(text)
        _set_run_font(
            run,
            size=opts.get("size", size),
            bold=opts.get("bold", False),
            italic=opts.get("italic", False),
        )
    return p


def add_page_break(doc) -> None:
    p = doc.add_paragraph()
    p.add_run().add_break(WD_BREAK.PAGE)


def add_blank_line(doc, *, count: int = 1) -> None:
    for _ in range(count):
        p = doc.add_paragraph()
        p.paragraph_format.first_line_indent = Cm(0)


def add_heading_h1(doc, text: str) -> None:
    p = doc.add_paragraph(text.upper(), style="Heading 1")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    for run in p.runs:
        _set_run_font(run, size=14, bold=True)


def add_heading_h2(doc, text: str) -> None:
    p = doc.add_paragraph(text, style="Heading 2")
    for run in p.runs:
        _set_run_font(run, size=14, bold=True)


# ────────────────────────────── 1. Титульный лист ──────────────────────────────


def build_titulnik(doc) -> None:
    add_para(doc, "МИНИСТЕРСТВО ЦИФРОВЫХ ТЕХНОЛОГИЙ",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True)
    add_para(doc, "РЕСПУБЛИКИ УЗБЕКИСТАН",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True)
    add_blank_line(doc)
    add_para(doc, "ТАШКЕНТСКИЙ УНИВЕРСИТЕТ",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True)
    add_para(doc, "ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True)
    add_para(doc, "имени Мухаммада ал-Хорезми",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True)
    add_blank_line(doc)
    add_para(doc, "Факультет «Компьютерный инжиниринг»",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0))
    add_para(doc, "Кафедра «Конвергенция цифровых технологий»",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0))

    add_blank_line(doc, count=6)

    add_para(doc, "ПРОЕКТНАЯ РАБОТА",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True, size=18)
    add_blank_line(doc)
    add_para(doc, "на тему:",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0))
    add_para(doc, "«Создание информационной системы электронной",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True, size=16)
    add_para(doc, "подписки на газеты и журналы»",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True, size=16)

    add_blank_line(doc, count=6)

    add_runs(doc,
             [("Выполнил студент группы 035-22:    ", {}),
              ("Абдуллаев Ильхом", {"bold": True})],
             align=WD_ALIGN_PARAGRAPH.LEFT, first_line=Cm(0))
    add_blank_line(doc)
    add_runs(doc,
             [("Научный руководитель:    ", {}),
              ("Маликова Н. Т.", {"bold": True})],
             align=WD_ALIGN_PARAGRAPH.LEFT, first_line=Cm(0))
    add_para(doc, "доцент кафедры «Конвергенция цифровых технологий»",
             align=WD_ALIGN_PARAGRAPH.LEFT, first_line=Cm(0), italic=False)

    add_blank_line(doc, count=4)

    add_para(doc, "Ташкент — 2026",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True)


# ────────────────────────────── 2. Лист задания ──────────────────────────────


def build_zadanie(doc) -> None:
    add_para(doc, "ТАШКЕНТСКИЙ УНИВЕРСИТЕТ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True)
    add_para(doc, "имени Мухаммада ал-Хорезми",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True)
    add_para(doc, "Кафедра «Конвергенция цифровых технологий»",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0))
    add_blank_line(doc)

    add_runs(doc,
             [("«УТВЕРЖДАЮ»", {"bold": True})],
             align=WD_ALIGN_PARAGRAPH.RIGHT, first_line=Cm(0))
    add_para(doc, "Заведующий кафедрой",
             align=WD_ALIGN_PARAGRAPH.RIGHT, first_line=Cm(0))
    add_para(doc, "____________________",
             align=WD_ALIGN_PARAGRAPH.RIGHT, first_line=Cm(0))
    add_para(doc, "«____» ____________ 2026 г.",
             align=WD_ALIGN_PARAGRAPH.RIGHT, first_line=Cm(0))
    add_blank_line(doc, count=2)

    add_para(doc, "ЗАДАНИЕ",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True, size=16)
    add_para(doc, "на проектную работу",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0))
    add_blank_line(doc)

    add_runs(doc,
             [("Студент: ", {"bold": True}),
              ("Абдуллаев Ильхом, группа 035-22", {})],
             first_line=Cm(0))
    add_runs(doc,
             [("Тема работы: ", {"bold": True}),
              ("«Создание информационной системы электронной подписки на газеты и журналы»", {})],
             first_line=Cm(0))
    add_runs(doc,
             [("Руководитель: ", {"bold": True}),
              ("Маликова Нодира Тургуновна, доцент кафедры «Конвергенция цифровых технологий»", {})],
             first_line=Cm(0))
    add_blank_line(doc)

    add_runs(doc,
             [("Исходные данные. ", {"bold": True}),
              ("Предметная область — рынок периодических печатных и электронных изданий "
               "Республики Узбекистан. Целевой стек разработки — React 18, TypeScript, Vite, "
               "TailwindCSS на стороне клиента, Vercel Serverless Functions на стороне сервера, "
               "Neon PostgreSQL в качестве базы данных, Vercel Blob для хранения PDF-номеров "
               "и обложек, JSON Web Token (JWT, англ. — токен в формате JSON) и bcrypt для "
               "аутентификации. Целевая аудитория — читатели газет и журналов на русском и "
               "узбекском языках.", {})])
    add_blank_line(doc)

    add_para(doc, "Перечень разделов проектной работы.",
             first_line=Cm(0), bold=True)
    items = [
        "Введение.",
        "Теоретическая часть. Раздел 1. Анализ предметной области.",
        "Теоретическая часть. Раздел 2. Архитектурные подходы и обоснование выбора стека.",
        "Теоретическая часть. Раздел 3. Проектирование базы данных и модели подписок.",
        "Практическая часть. Описание реализации функциональных модулей.",
        "Заключение.",
        "Использованные источники.",
        "Приложения.",
    ]
    for i, item in enumerate(items, start=1):
        add_para(doc, f"{i}. {item}", first_line=Cm(0))
    add_blank_line(doc)

    add_para(doc, "Перечень графического материала.",
             first_line=Cm(0), bold=True)
    add_para(doc, "1. ER-диаграмма базы данных.", first_line=Cm(0))
    add_para(doc, "2. Архитектурная схема системы.", first_line=Cm(0))
    add_para(doc, "3. Скриншоты пользовательского интерфейса (14 рисунков).", first_line=Cm(0))
    add_blank_line(doc)

    add_runs(doc,
             [("Дата выдачи задания: ", {"bold": True}),
              ("«____» ____________ 2026 г.", {})], first_line=Cm(0))
    add_runs(doc,
             [("Срок сдачи работы: ", {"bold": True}),
              ("«____» ____________ 2026 г.", {})], first_line=Cm(0))
    add_blank_line(doc, count=2)

    add_para(doc, "Руководитель                    ____________________ / Маликова Н. Т. /",
             first_line=Cm(0))
    add_blank_line(doc)
    add_para(doc, "Задание принял к исполнению  ____________________ / Абдуллаев И. /",
             first_line=Cm(0))


# ────────────────────────────── 3. Содержание ──────────────────────────────


def build_toc(doc) -> None:
    add_para(doc, "СОДЕРЖАНИЕ",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), bold=True, size=14)
    add_blank_line(doc)

    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Cm(0)
    run = p.add_run()
    _set_run_font(run, size=14)

    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = ' TOC \\o "1-2" \\h \\z \\u '
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    placeholder = OxmlElement("w:t")
    placeholder.text = "Откройте документ в Microsoft Word и обновите поле (F9), чтобы построить оглавление."
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")

    run._element.append(fld_begin)
    run._element.append(instr)
    run._element.append(fld_sep)
    run2 = p.add_run()
    _set_run_font(run2, size=14, italic=True)
    run2._element.append(placeholder)
    run3 = p.add_run()
    _set_run_font(run3, size=14)
    run3._element.append(fld_end)


# ────────────────────────────── 4. Введение ──────────────────────────────


def build_introduction(doc) -> None:
    add_heading_h1(doc, "Введение")

    add_para(doc,
        "Развитие цифровой инфраструктуры Республики Узбекистан меняет способы "
        "распространения периодических печатных изданий. Тиражи бумажных газет "
        "и журналов в стране снижаются с 2018 года, а доля читателей, "
        "получающих новости и аналитику через интернет, растёт. По данным "
        "Государственного комитета Республики Узбекистан по статистике, "
        "охват домашних хозяйств широкополосным доступом в 2024 году превысил "
        "82 процента, а число активных мобильных интернет-подключений достигло "
        "33,6 миллионов. Эти показатели создают реальную почву для перевода "
        "подписки на периодические издания в электронный формат, при котором "
        "читатель оформляет доступ к изданию через веб-сайт и получает номера "
        "в виде PDF-файлов или адаптивных страниц на любом устройстве [1] [4].")

    add_para(doc,
        "Государственная политика прямо ориентирует отрасль на цифровизацию. "
        "Указом Президента Республики Узбекистан № УП-6079 от 5 октября 2020 года "
        "«Об утверждении Стратегии «Цифровой Узбекистан — 2030», определяющей "
        "приоритеты развития цифровой экономики, телекоммуникаций и электронного "
        "правительства, поставлена задача перевести в электронный вид массовые "
        "сервисы и распространение информации. Закон Республики Узбекистан № 541 "
        "от 15 января 2007 года «О средствах массовой информации» (действующая "
        "редакция), регулирующий деятельность СМИ и порядок их распространения, "
        "признаёт сетевые издания полноправной формой массовой информации. Закон "
        "Республики Узбекистан № ЗРУ-560 от 24 апреля 2019 года «О связи», "
        "устанавливающий правовые основы деятельности в сфере электросвязи, "
        "формирует требования к каналам передачи данных, через которые работает "
        "электронная подписка [1] [2] [3].")

    add_para(doc,
        "Существующие в стране сервисы решают задачу частично. Государственный "
        "оператор Pochta.uz позволяет оформить бумажную подписку через интернет, "
        "однако содержательный доступ к выпускам остаётся на бумаге. Портал "
        "davr-online.uz предоставляет архивы отдельных изданий, но не объединяет "
        "каталоги издателей и не работает с моделью подписки. Зарубежные "
        "сервисы Readly, Magzter и PressReader предлагают единый каталог "
        "и читалку, однако русскоязычный и узбекоязычный контент Узбекистана "
        "представлен в них фрагментарно, а оплата привязана к платёжным "
        "системам, недоступным локальному читателю. Для отечественного рынка "
        "остаётся свободной ниша, в которой объединяются национальный каталог, "
        "цифровая доставка PDF и оплата в национальной валюте [5] [6].")

    add_para(doc,
        "Актуальность работы определяется тремя обстоятельствами. Первое — "
        "регуляторная среда требует переноса распространения СМИ в электронный "
        "контур. Второе — техническая инфраструктура (широкополосный интернет, "
        "массовые мобильные устройства, безналичная оплата) уже доступна "
        "целевой аудитории. Третье — на рынке отсутствует комплексное "
        "веб-решение, которое объединяет каталог изданий, оформление подписки "
        "по периодам, доступ к архиву номеров и личный кабинет читателя.")

    add_runs(doc, [
        ("Цель работы. ", {"bold": True}),
        ("Спроектировать и реализовать веб-приложение электронной подписки "
         "на газеты и журналы для рынка Республики Узбекистан с поддержкой "
         "русского и узбекского языков, включающее каталог изданий, "
         "оформление подписки на выбранный период, имитацию оплаты, "
         "цифровой архив PDF-номеров и административную панель для "
         "управления контентом.", {})])

    add_runs(doc, [
        ("Задачи работы.", {"bold": True})], first_line=Cm(1.25))
    tasks = [
        "проанализировать предметную область и существующие сервисы электронной подписки;",
        "обосновать выбор архитектуры и технологического стека для развёртывания на бесплатных тарифах облачных провайдеров;",
        "спроектировать реляционную базу данных и описать жизненный цикл подписки;",
        "разработать публичную часть приложения (главная страница, каталог, карточка издания, формы регистрации и входа);",
        "разработать личный кабинет читателя с разделами «Мои подписки», «Архив номеров», «История платежей»;",
        "реализовать оформление подписки с имитацией оплаты по банковской карте;",
        "разработать административную панель для управления изданиями и загрузки PDF-номеров;",
        "обеспечить двуязычный интерфейс на основе библиотеки react-i18next;",
        "выполнить развёртывание системы на платформе Vercel и подключить базу данных Neon PostgreSQL.",
    ]
    for i, t in enumerate(tasks, start=1):
        add_para(doc, f"{i}. {t}")

    add_runs(doc, [
        ("Объект исследования — ", {"bold": True}),
        ("процессы оформления и сопровождения электронной подписки на "
         "периодические издания.", {})])

    add_runs(doc, [
        ("Предмет исследования — ", {"bold": True}),
        ("методы построения веб-приложений на стеке React, бессерверных функций "
         "Vercel и управляемой базы данных PostgreSQL для задачи цифровой "
         "подписки.", {})])

    add_runs(doc, [
        ("Методы. ", {"bold": True}),
        ("Использованы методы системного анализа предметной области, "
         "сравнительного анализа технологий, проектирования реляционных баз "
         "данных по правилам нормализации до третьей нормальной формы, "
         "объектно-ориентированного и компонентного программирования, "
         "функционального тестирования веб-интерфейса.", {})])

    add_runs(doc, [
        ("Структура работы. ", {"bold": True}),
        ("Документ состоит из введения, теоретической части из трёх "
         "разделов, практической части, заключения, списка использованных "
         "источников и приложений. В первом разделе теоретической части "
         "выполнен анализ рынка электронной подписки. Во втором разделе "
         "обоснован выбор архитектуры и стека. В третьем разделе "
         "спроектирована база данных. В практической части описаны "
         "реализованные модули и приведены экранные формы готового "
         "приложения, развёрнутого по адресу " + DEPLOY_URL + ".", {})])


# ────────────────────────────── 5. Теоретическая часть. Раздел 1 ──────────────────────────────


def build_theory_section_1(doc) -> None:
    add_heading_h1(doc, "1. Теоретическая часть. Анализ предметной области")

    add_heading_h2(doc, "1.1. Понятие электронной подписки и её отличия от бумажной")
    add_para(doc,
        "Электронная подписка на периодическое издание — это договорное "
        "отношение, при котором читатель приобретает доступ к выпускам газеты "
        "или журнала в цифровой форме на ограниченный срок. В отличие от "
        "бумажной подписки, при которой издатель печатает тираж и доставляет "
        "физический экземпляр через почтовые и курьерские каналы, электронная "
        "форма не предполагает производственного цикла печати и логистики. "
        "Читатель получает выпуски через веб-сайт или мобильное приложение "
        "сразу после публикации, а права доступа определяются статусом "
        "подписки в базе данных провайдера.")
    add_para(doc,
        "С точки зрения издателя электронная подписка снижает себестоимость "
        "выпуска, поскольку расходы на бумагу, печать и доставку заменяются "
        "затратами на хостинг файлов и поддержку программного обеспечения. "
        "С точки зрения читателя электронная форма даёт доступ к архиву "
        "выпусков, поиск по номерам, чтение с произвольного устройства и "
        "независимость от расписания почтовой доставки. С точки зрения "
        "регулятора электронные издания подпадают под действие Закона "
        "Республики Узбекистан № 541 от 15 января 2007 года «О средствах "
        "массовой информации» (действующая редакция), регулирующего "
        "деятельность СМИ и порядок их распространения, а защита персональных "
        "данных подписчиков обеспечивается Законом Республики Узбекистан "
        "№ ЗРУ-547 от 2 июля 2019 года «О персональных данных», "
        "устанавливающим требования к обработке и хранению персональных данных "
        "граждан [1] [7].")

    add_heading_h2(doc, "1.2. Эволюция модели подписки")
    add_para(doc,
        "Подписка как форма распространения прессы появилась в XVIII веке и до "
        "конца XX века оставалась преимущественно бумажной. Первый этап "
        "цифровизации связан с появлением сайтов газет в 1990-х годах, на "
        "которых статьи публиковались бесплатно для привлечения трафика. "
        "Второй этап начался в 2000-х годах с введением модели paywall "
        "(англ. — платный доступ), при которой часть материалов закрывалась "
        "для не оплативших читателей. Третий этап, наблюдаемый с середины "
        "2010-х годов, связан с появлением универсальных платформ-агрегаторов, "
        "которые продают доступ к каталогам изданий по единой подписке.")
    add_para(doc,
        "Для рынка Республики Узбекистан характерно сочетание этапов. Часть "
        "изданий продолжает работать в бумажной подписке через "
        "Государственное унитарное предприятие «O‘zbekiston pochtasi» "
        "(сайт Pochta.uz). Часть изданий публикует материалы открыто на "
        "собственных сайтах. Цифровых агрегаторов с моделью платной подписки "
        "и национальным контентом на русском и узбекском языках на момент "
        "написания работы не зафиксировано, что и определяет нишу для "
        "проектируемой системы [5].")

    add_heading_h2(doc, "1.3. Сравнительный анализ существующих сервисов")
    add_para(doc,
        "Для сопоставления функциональных возможностей рассмотрены четыре "
        "сервиса. Pochta.uz — портал государственного оператора почтовой связи. "
        "Davr-online.uz — портал архивов отдельных изданий. Readly — "
        "международный шведский сервис цифровой подписки. Magzter — "
        "международный сервис цифровых журналов с штаб-квартирой в США. "
        "Сравнение по ключевым функциям приведено в таблице 1.")

    table = doc.add_table(rows=8, cols=5)
    table.style = "Table Grid"
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    headers = ["Функция", "Pochta.uz", "Davr-online.uz", "Readly", "Magzter"]
    rows_data = [
        ["Единый каталог изданий", "частично", "нет", "да", "да"],
        ["Цифровая доставка PDF", "нет", "частично", "да", "да"],
        ["Подписка по периодам", "да (бумажная)", "нет", "да", "да"],
        ["Контент на узбекском языке", "да", "да", "нет", "нет"],
        ["Оплата в национальной валюте", "да", "не применимо", "нет", "нет"],
        ["Личный кабинет читателя", "ограниченный", "нет", "да", "да"],
        ["Архив номеров", "нет", "да", "да", "да"],
    ]
    for j, h in enumerate(headers):
        cell = table.rows[0].cells[j]
        cell.text = h
        for para in cell.paragraphs:
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            para.paragraph_format.first_line_indent = Cm(0)
            para.paragraph_format.line_spacing = 1.0
            for run in para.runs:
                _set_run_font(run, size=12, bold=True)
    for i, row in enumerate(rows_data, start=1):
        for j, val in enumerate(row):
            cell = table.rows[i].cells[j]
            cell.text = val
            for para in cell.paragraphs:
                para.alignment = WD_ALIGN_PARAGRAPH.CENTER
                para.paragraph_format.first_line_indent = Cm(0)
                para.paragraph_format.line_spacing = 1.0
                for run in para.runs:
                    _set_run_font(run, size=12)

    add_para(doc, "Таблица 1. Сравнение сервисов электронной подписки",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), size=12)
    add_blank_line(doc)

    add_para(doc,
        "Из сравнения видно, что зарубежные платформы выигрывают по полноте "
        "функций цифровой подписки, но не покрывают локальный контент и не "
        "поддерживают оплату в сумах. Отечественные сервисы покрывают "
        "локальный контент, но не реализуют полноценную модель цифровой "
        "подписки с архивом и личным кабинетом. Проектируемая система "
        "закрывает это расхождение, объединяя национальный каталог изданий, "
        "оплату по картам узбекских банков и стандартную модель цифровой "
        "подписки с архивом номеров и доступом по статусу подписки [5] [6] [8].")

    add_heading_h2(doc, "1.4. Целевые пользователи и сценарии использования")
    add_para(doc,
        "Целевая аудитория системы делится на три группы. Первая группа — "
        "читатели, оформляющие подписку на конкретное издание для чтения "
        "новых выпусков. Вторая группа — пользователи, использующие архив "
        "выпусков для подготовки материалов или личных целей. Третья группа — "
        "сотрудники издательств и редакций, загружающие новые выпуски через "
        "административную панель.")
    add_para(doc,
        "Основные сценарии использования включают регистрацию пользователя, "
        "поиск издания по категории и ключевому слову, оформление подписки "
        "на выбранный период (один, три, шесть или двенадцать месяцев), "
        "оплату подписки имитируемым переводом по банковской карте, чтение "
        "и скачивание PDF-номеров в течение срока действия подписки, "
        "продление и отмену подписки в личном кабинете, просмотр истории "
        "платежей. Для администратора предусмотрены сценарии создания "
        "издания, загрузки обложек и PDF-номеров, редактирования метаданных "
        "и просмотра агрегированной статистики.")


# ────────────────────────────── 6. Теоретическая часть. Раздел 2 ──────────────────────────────


def build_theory_section_2(doc) -> None:
    add_heading_h1(doc, "2. Архитектурные подходы и обоснование выбора стека")

    add_heading_h2(doc, "2.1. Обзор архитектурных моделей")
    add_para(doc,
        "Современные веб-приложения строятся в нескольких архитектурных "
        "моделях. Монолитная архитектура объединяет интерфейс, бизнес-логику "
        "и работу с базой данных в одном развёртываемом приложении. Достоинство "
        "модели — простота сборки и отладки. Недостаток — сложность "
        "масштабирования отдельных частей. Микросервисная архитектура делит "
        "приложение на самостоятельные сервисы, общающиеся по сетевым "
        "протоколам. Достоинство — независимое развитие модулей. Недостаток — "
        "повышенные расходы на инфраструктуру и сетевые задержки.")
    add_para(doc,
        "Бессерверная (serverless) архитектура размещает бизнес-логику в "
        "отдельных функциях, выполняемых облачным провайдером по запросу. "
        "Платформа сама запускает функцию, выделяет ресурсы и освобождает их "
        "после завершения работы. Подход хорош для приложений с переменной "
        "нагрузкой, поскольку ресурсы оплачиваются по времени фактического "
        "выполнения. Архитектура JAMstack (JavaScript, API, Markup) разделяет "
        "статический фронтенд (HTML, CSS, JavaScript) и набор API, работающих "
        "по запросу. Фронтенд раздаётся через сеть доставки контента, что "
        "обеспечивает быструю отдачу страниц.")
    add_para(doc,
        "Для проектируемой системы выбрана комбинация JAMstack и serverless. "
        "Клиент представлен одностраничным приложением React, собранным "
        "Vite, и раздаётся как статика через сеть доставки контента (CDN, "
        "англ. — content delivery network) платформы Vercel. Серверная часть "
        "построена на бессерверных функциях того же провайдера, написанных на "
        "TypeScript и развёртываемых из директории /api проекта. Эта связка "
        "минимизирует операционные расходы, поскольку Vercel предоставляет "
        "бесплатный тариф для индивидуальных проектов с лимитом 100 ГБ "
        "пропускной способности в месяц [9] [10].")

    add_heading_h2(doc, "2.2. Сравнение систем управления базами данных")
    add_para(doc,
        "В качестве системы управления базами данных рассмотрены три "
        "кандидата. PostgreSQL — реляционная СУБД с открытым исходным кодом, "
        "поддерживающая полноценный язык запросов SQL стандарта 2016, "
        "транзакции по уровням изоляции, расширенные типы данных (JSON, "
        "массивы, географические объекты), материализованные представления и "
        "индексы по выражениям. MySQL — реляционная СУБД, ориентированная на "
        "веб-нагрузки, с упрощённой моделью транзакций. SQLite — встраиваемая "
        "СУБД, хранящая базу в одном файле, без отдельного сервера.")
    add_para(doc,
        "Для системы электронной подписки требуется поддержка транзакций "
        "при оформлении подписки и платежа, поддержка многих параллельных "
        "соединений из бессерверных функций, доступность управляемого "
        "облачного хостинга на бесплатном тарифе. Этим требованиям наилучшим "
        "образом отвечает PostgreSQL в управляемом виде Neon. Платформа Neon "
        "предоставляет PostgreSQL версии 16, отделяет хранилище от вычислений "
        "и масштабирует вычислительный узел до нуля при отсутствии запросов, "
        "что важно для бесплатного тарифа. Драйвер @neondatabase/serverless "
        "работает по протоколу HTTP, что устраняет проблему ограниченного "
        "числа TCP-подключений в бессерверной среде [11].")

    add_heading_h2(doc, "2.3. Обоснование выбора стека")
    add_para(doc,
        "Технологический стек подобран по совокупности критериев: соответствие "
        "функциональным требованиям, скорость разработки, бесплатные тарифы "
        "облачных провайдеров, единый язык программирования на клиенте и "
        "сервере, наличие документации и активного сообщества. Подытоженный "
        "состав стека приведён в таблице 2.")

    table = doc.add_table(rows=11, cols=3)
    table.style = "Table Grid"
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    headers = ["Слой", "Технология", "Назначение"]
    rows_data = [
        ["Сборка клиента", "Vite 5", "Сборка одностраничного приложения с горячей перезагрузкой"],
        ["UI-фреймворк", "React 18", "Декларативное описание интерфейса"],
        ["Язык", "TypeScript 5", "Статическая типизация на клиенте и сервере"],
        ["Стили", "TailwindCSS 3", "Утилитарный подход к стилям без CSS-файлов"],
        ["Маршрутизация", "React Router 6", "Клиентская навигация по экранам"],
        ["Локализация", "react-i18next", "Двуязычный интерфейс ru / uz"],
        ["Серверный рантайм", "Vercel Serverless Functions", "Бессерверные функции на Node.js"],
        ["База данных", "Neon PostgreSQL 16", "Управляемая реляционная база"],
        ["Файловое хранилище", "Vercel Blob", "Хранение PDF-номеров и обложек"],
        ["Аутентификация", "JSON Web Token + bcrypt", "Подписанные токены и защищённое хранение паролей"],
    ]
    for j, h in enumerate(headers):
        cell = table.rows[0].cells[j]
        cell.text = h
        for para in cell.paragraphs:
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            para.paragraph_format.first_line_indent = Cm(0)
            para.paragraph_format.line_spacing = 1.0
            for run in para.runs:
                _set_run_font(run, size=12, bold=True)
    for i, row in enumerate(rows_data, start=1):
        for j, val in enumerate(row):
            cell = table.rows[i].cells[j]
            cell.text = val
            for para in cell.paragraphs:
                para.alignment = WD_ALIGN_PARAGRAPH.CENTER
                para.paragraph_format.first_line_indent = Cm(0)
                para.paragraph_format.line_spacing = 1.0
                for run in para.runs:
                    _set_run_font(run, size=12)

    add_para(doc, "Таблица 2. Технологический стек проектируемой системы",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), size=12)
    add_blank_line(doc)

    add_heading_h2(doc, "2.4. Архитектурная схема системы")
    add_para(doc,
        "Высокоуровневая архитектура системы построена в виде четырёх связанных "
        "слоёв. Первый слой — клиент в браузере читателя или администратора. "
        "Клиент представляет собой одностраничное приложение React, общается "
        "с сервером по протоколу HTTP, хранит токен аутентификации в локальном "
        "хранилище браузера. Второй слой — бессерверные функции платформы "
        "Vercel в директории /api проекта. Каждая функция отвечает за один "
        "набор операций (регистрация, выдача каталога, оформление подписки, "
        "загрузка номера). Третий слой — управляемая база данных Neon "
        "PostgreSQL, доступная функциям по защищённому соединению. Четвёртый "
        "слой — файловое хранилище Vercel Blob, в котором лежат PDF-номера "
        "и изображения обложек, а ссылки на эти файлы записаны в базе.")

    add_para(doc, "[ВСТАВИТЬ РИС.: Архитектурная схема системы — docs/architecture.png]",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), italic=True)
    add_para(doc, "Рис. 1. Архитектурная схема системы",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), size=12)
    add_blank_line(doc)

    add_para(doc,
        "Поток оформления подписки выглядит следующим образом. Клиент "
        "формирует запрос HTTP POST по адресу /api/subscriptions, передавая "
        "идентификатор издания, период подписки и платёжные реквизиты. "
        "Бессерверная функция проверяет токен аутентификации, валидирует "
        "входные данные через библиотеку zod, открывает транзакцию в "
        "PostgreSQL, добавляет запись в таблицу subscriptions, добавляет "
        "запись в таблицу payments и фиксирует транзакцию. В ответ клиент "
        "получает идентификатор подписки, статус и дату окончания. Поток "
        "загрузки PDF-номера администратором использует прямую загрузку в "
        "Vercel Blob по подписанному URL, после чего метаданные сохраняются "
        "в таблице issues.")


# ────────────────────────────── 7. Теоретическая часть. Раздел 3 ──────────────────────────────


def build_theory_section_3(doc) -> None:
    add_heading_h1(doc, "3. Проектирование базы данных")

    add_heading_h2(doc, "3.1. Нормализация и общие принципы")
    add_para(doc,
        "Реляционная модель базы данных проектировалась с соблюдением "
        "первой, второй и третьей нормальных форм. Первая нормальная форма "
        "обеспечивается атомарностью значений в каждой ячейке (отсутствием "
        "массивов и составных полей в обычных колонках). Вторая нормальная "
        "форма обеспечивается тем, что неключевые атрибуты зависят от полного "
        "первичного ключа (в проекте используются простые суррогатные ключи "
        "типа SERIAL, что автоматически выполняет это требование). Третья "
        "нормальная форма обеспечивается отсутствием транзитивных "
        "зависимостей: метаданные категорий вынесены в отдельную таблицу "
        "categories, а каждое издание ссылается на категорию по внешнему "
        "ключу.")
    add_para(doc,
        "Двуязычные поля для русского и узбекского языков выделены в "
        "отдельные колонки с суффиксами _ru и _uz. Этот подход проще "
        "альтернативной таблицы переводов, упрощает запросы каталога и "
        "сохраняет производительность чтения, при этом поддерживает "
        "локализацию контента в обеих локалях [11].")

    add_heading_h2(doc, "3.2. Описание таблиц")
    add_para(doc,
        "База данных состоит из шести таблиц. Каждая таблица описана с "
        "указанием имени, назначения и ключевых полей.")

    add_para(doc,
        "Таблица users хранит зарегистрированных пользователей системы. "
        "Поля: id (первичный ключ), email (уникальный), password_hash "
        "(хеш пароля по алгоритму bcrypt), full_name (полное имя), phone "
        "(телефон, необязательное), role (роль reader или admin), created_at "
        "(дата регистрации). Уникальность электронной почты обеспечивает "
        "идентификацию аккаунта при входе.")

    add_para(doc,
        "Таблица categories содержит категории изданий. Поля: id, slug "
        "(человекочитаемый идентификатор для URL), name_ru, name_uz "
        "(локализованные названия). Используется как справочник для "
        "фильтров каталога.")

    add_para(doc,
        "Таблица publications содержит описания изданий (газет и журналов). "
        "Поля: id, slug, title_ru, title_uz, description_ru, description_uz, "
        "cover_url (ссылка на обложку в Vercel Blob), category_id (внешний "
        "ключ на categories), type (newspaper или magazine), price_per_month "
        "(цена за месяц подписки в сумах), is_published (флаг публикации), "
        "временные метки created_at и updated_at.")

    add_para(doc,
        "Таблица issues хранит выпуски (номера) изданий. Поля: id, "
        "publication_id (внешний ключ на publications с каскадным удалением), "
        "issue_number (номер выпуска внутри издания), title_ru, title_uz, "
        "published_at (дата публикации выпуска), pdf_url (ссылка на файл в "
        "Vercel Blob), cover_url, created_at. На пары (publication_id, "
        "issue_number) наложено ограничение уникальности, чтобы исключить "
        "дублирование номеров.")

    add_para(doc,
        "Таблица subscriptions хранит подписки читателей на издания. Поля: "
        "id, user_id (внешний ключ на users), publication_id (внешний ключ "
        "на publications), period_months (срок 1, 3, 6 или 12 месяцев), "
        "start_date, end_date (даты начала и окончания подписки), status "
        "(pending, active, expired или cancelled), total_amount (общая "
        "сумма), created_at. Поле status управляет доступом к PDF-номерам.")

    add_para(doc,
        "Таблица payments хранит факты имитационных платежей. Поля: id, "
        "subscription_id (внешний ключ на subscriptions), amount (сумма "
        "платежа), card_last4 (последние четыре цифры карты), status "
        "(success или failed), paid_at (момент платежа). Хранение полного "
        "номера карты не предусмотрено в соответствии с требованиями "
        "защиты персональных данных и стандарта PCI DSS (англ. — Payment "
        "Card Industry Data Security Standard).")

    add_heading_h2(doc, "3.3. Связи между таблицами")
    add_para(doc,
        "Связи между таблицами реализованы через внешние ключи. Один "
        "пользователь может иметь много подписок (1:N от users к "
        "subscriptions). Одно издание может быть подписано многими "
        "пользователями (1:N от publications к subscriptions). Одно "
        "издание содержит много выпусков (1:N от publications к issues). "
        "Одна категория содержит много изданий (1:N от categories к "
        "publications). Одна подписка содержит один или несколько платежей "
        "при продлении (1:N от subscriptions к payments). Эти связи "
        "обеспечивают целостность данных при операциях вставки, обновления "
        "и удаления.")

    add_para(doc, "[ВСТАВИТЬ РИС.: ER-диаграмма базы данных — docs/er-diagram.png]",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), italic=True)
    add_para(doc, "Рис. 2. Логическая ER-диаграмма базы данных",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), size=12)
    add_blank_line(doc)

    add_heading_h2(doc, "3.4. Жизненный цикл подписки")
    add_para(doc,
        "Подписка проходит четыре состояния. Начальное состояние pending "
        "присваивается записи на момент создания, до подтверждения платежа. "
        "При успешном платеже статус меняется на active, и пользователь "
        "получает доступ к PDF-номерам издания. По достижении даты end_date "
        "статус автоматически переводится в expired фоновой задачей "
        "проверки подписок. По запросу пользователя действующая подписка "
        "может быть переведена в состояние cancelled до окончания срока, "
        "при этом доступ к PDF прекращается немедленно.")

    add_para(doc, "[ВСТАВИТЬ РИС.: Диаграмма состояний подписки — docs/subscription-lifecycle.png]",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), italic=True)
    add_para(doc, "Рис. 3. Диаграмма состояний подписки",
             align=WD_ALIGN_PARAGRAPH.CENTER, first_line=Cm(0), size=12)
    add_blank_line(doc)

    add_heading_h2(doc, "3.5. Индексы и контроль доступа")
    add_para(doc,
        "Для ускорения часто исполняемых запросов на таблицах созданы "
        "вторичные индексы. Индекс subscriptions(user_id, status) "
        "обслуживает выборку активных подписок пользователя в личном "
        "кабинете. Индекс issues(publication_id, published_at DESC) "
        "обслуживает выдачу архива номеров издания. Индекс "
        "publications(category_id, is_published) обслуживает фильтрацию "
        "каталога по категории.")
    add_para(doc,
        "Контроль доступа к PDF-номерам реализован на стороне сервера. "
        "При запросе ссылки на файл бессерверная функция проверяет наличие "
        "записи в таблице subscriptions с текущим user_id, заданным "
        "publication_id, статусом active и end_date не ранее текущей даты. "
        "При отсутствии такой записи функция возвращает HTTP-код 403. Этот "
        "механизм исключает обход подписки прямой ссылкой на файл.")


# ────────────────────────────── сборка документа ──────────────────────────────


def build_document() -> None:
    doc = Document()
    setup_styles(doc)

    # Секция 1: титул, задание, содержание — без нумерации страниц.
    setup_section(doc.sections[0], with_page_number=False)

    build_titulnik(doc)

    sec_zad = doc.add_section(WD_SECTION.NEW_PAGE)
    setup_section(sec_zad, with_page_number=False)
    build_zadanie(doc)

    sec_toc = doc.add_section(WD_SECTION.NEW_PAGE)
    setup_section(sec_toc, with_page_number=False)
    build_toc(doc)

    # Секция 2: содержательная часть — с нумерацией начиная с 4.
    sec_main = doc.add_section(WD_SECTION.NEW_PAGE)
    setup_section(sec_main, with_page_number=True, start_page=4)

    build_introduction(doc)
    build_theory_section_1(doc)
    build_theory_section_2(doc)
    build_theory_section_3(doc)

    OUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    doc.save(str(OUT_FILE))
    print(f"OK: записан {OUT_FILE}")


if __name__ == "__main__":
    build_document()
