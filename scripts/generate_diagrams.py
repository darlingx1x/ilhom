"""Генерация иллюстраций для Word-документа через Graphviz.

Создаёт PNG-файлы в docs/:
  architecture.png            — Рис. 1, архитектурная схема
  er-diagram.png              — Рис. 2, ER-диаграмма базы данных
  subscription-lifecycle.png  — Рис. 3, диаграмма состояний подписки
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "docs"
OUT_DIR.mkdir(parents=True, exist_ok=True)

DOT = shutil.which("dot") or "dot"
DPI = "180"


def render(name: str, source: str) -> Path:
    out = OUT_DIR / f"{name}.png"
    proc = subprocess.run(
        [DOT, "-Tpng", f"-Gdpi={DPI}", "-o", str(out)],
        input=source.encode("utf-8"),
        capture_output=True,
        check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.decode("utf-8"))
    print(f"OK: {out}")
    return out


# ────────────────────────────── 1. Архитектура ──────────────────────────────

ARCHITECTURE = r"""
digraph G {
    graph [rankdir=TB, splines=ortho, nodesep=0.6, ranksep=0.9, fontname="Times New Roman", fontsize=14, bgcolor="white"];
    node  [shape=box, style="rounded,filled", fontname="Times New Roman", fontsize=12, margin="0.18,0.10"];
    edge  [fontname="Times New Roman", fontsize=11, color="#444444"];

    subgraph cluster_client {
        label="Клиент (браузер)";
        style="rounded,dashed";
        color="#888888";
        fontsize=13;
        bgcolor="#F4F4F4";
        spa  [label="React 18 + Vite + TS\nTailwindCSS, React Router", fillcolor="#DDE7F5"];
        i18n [label="react-i18next\nru / uz",                          fillcolor="#DDE7F5"];
        jwt_ls [label="JWT\nв localStorage",                            fillcolor="#EEEEEE", shape=note];
    }

    subgraph cluster_api {
        label="Vercel Serverless Functions";
        style="rounded,dashed";
        color="#888888";
        fontsize=13;
        bgcolor="#FBF3F1";
        api_auth   [label="/api/auth\nlogin · register · me",        fillcolor="#F2D7D2"];
        api_pub    [label="/api/publications\ncatalog · detail",     fillcolor="#F2D7D2"];
        api_sub    [label="/api/subscriptions\ncreate · cancel",     fillcolor="#F2D7D2"];
        api_admin  [label="/api/admin\nCRUD изданий и номеров",      fillcolor="#F2D7D2"];
    }

    subgraph cluster_data {
        label="Данные";
        style="rounded,dashed";
        color="#888888";
        fontsize=13;
        bgcolor="#F0F5EC";
        db   [label="Neon PostgreSQL 16\nusers · publications · issues\nsubscriptions · payments", shape=cylinder, fillcolor="#D9E8C7"];
        blob [label="Vercel Blob\nPDF-номера и обложки", shape=folder, fillcolor="#D9E8C7"];
    }

    user [label="Читатель / Администратор", shape=oval, fillcolor="#FFFFFF"];

    user -> spa [label="HTTPS"];
    spa  -> api_auth   [label="HTTP + JWT"];
    spa  -> api_pub    [label="HTTP"];
    spa  -> api_sub    [label="HTTP + JWT"];
    spa  -> api_admin  [label="HTTP + JWT (admin)"];

    api_auth  -> db;
    api_pub   -> db;
    api_sub   -> db;
    api_admin -> db;
    api_admin -> blob [label="upload-url"];
    spa       -> blob [label="прямая загрузка PDF", style=dashed];

    {rank=same; jwt_ls; i18n;}
}
"""


# ────────────────────────────── 2. ER-диаграмма ──────────────────────────────

ER_DIAGRAM = r"""
digraph ER {
    graph [rankdir=LR, splines=ortho, nodesep=0.6, ranksep=1.0, fontname="Times New Roman", fontsize=14, bgcolor="white"];
    node  [shape=plaintext, fontname="Times New Roman"];
    edge  [fontname="Times New Roman", fontsize=11, color="#444444", arrowhead=crow, arrowtail=none, dir=both];

    users [label=<
      <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">
        <TR><TD BGCOLOR="#DDE7F5" COLSPAN="2"><B>users</B></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id</B></TD><TD ALIGN="LEFT">SERIAL PK</TD></TR>
        <TR><TD ALIGN="LEFT">email</TD><TD ALIGN="LEFT">VARCHAR(255) UNIQUE</TD></TR>
        <TR><TD ALIGN="LEFT">password_hash</TD><TD ALIGN="LEFT">VARCHAR(255)</TD></TR>
        <TR><TD ALIGN="LEFT">full_name</TD><TD ALIGN="LEFT">VARCHAR(255)</TD></TR>
        <TR><TD ALIGN="LEFT">phone</TD><TD ALIGN="LEFT">VARCHAR(20)</TD></TR>
        <TR><TD ALIGN="LEFT">role</TD><TD ALIGN="LEFT">VARCHAR(20)</TD></TR>
        <TR><TD ALIGN="LEFT">created_at</TD><TD ALIGN="LEFT">TIMESTAMP</TD></TR>
      </TABLE>>];

    categories [label=<
      <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">
        <TR><TD BGCOLOR="#F4E1B6" COLSPAN="2"><B>categories</B></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id</B></TD><TD ALIGN="LEFT">SERIAL PK</TD></TR>
        <TR><TD ALIGN="LEFT">slug</TD><TD ALIGN="LEFT">VARCHAR(50) UNIQUE</TD></TR>
        <TR><TD ALIGN="LEFT">name_ru</TD><TD ALIGN="LEFT">VARCHAR(100)</TD></TR>
        <TR><TD ALIGN="LEFT">name_uz</TD><TD ALIGN="LEFT">VARCHAR(100)</TD></TR>
      </TABLE>>];

    publications [label=<
      <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">
        <TR><TD BGCOLOR="#F2D7D2" COLSPAN="2"><B>publications</B></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id</B></TD><TD ALIGN="LEFT">SERIAL PK</TD></TR>
        <TR><TD ALIGN="LEFT">slug</TD><TD ALIGN="LEFT">VARCHAR(100) UNIQUE</TD></TR>
        <TR><TD ALIGN="LEFT">title_ru / title_uz</TD><TD ALIGN="LEFT">VARCHAR(255)</TD></TR>
        <TR><TD ALIGN="LEFT">description_ru / description_uz</TD><TD ALIGN="LEFT">TEXT</TD></TR>
        <TR><TD ALIGN="LEFT">cover_url</TD><TD ALIGN="LEFT">TEXT</TD></TR>
        <TR><TD ALIGN="LEFT"><I>category_id</I></TD><TD ALIGN="LEFT">FK → categories</TD></TR>
        <TR><TD ALIGN="LEFT">type</TD><TD ALIGN="LEFT">newspaper / magazine</TD></TR>
        <TR><TD ALIGN="LEFT">price_per_month</TD><TD ALIGN="LEFT">INT (сум)</TD></TR>
        <TR><TD ALIGN="LEFT">is_published</TD><TD ALIGN="LEFT">BOOLEAN</TD></TR>
        <TR><TD ALIGN="LEFT">created_at / updated_at</TD><TD ALIGN="LEFT">TIMESTAMP</TD></TR>
      </TABLE>>];

    issues [label=<
      <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">
        <TR><TD BGCOLOR="#D9E8C7" COLSPAN="2"><B>issues</B></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id</B></TD><TD ALIGN="LEFT">SERIAL PK</TD></TR>
        <TR><TD ALIGN="LEFT"><I>publication_id</I></TD><TD ALIGN="LEFT">FK → publications</TD></TR>
        <TR><TD ALIGN="LEFT">issue_number</TD><TD ALIGN="LEFT">INT</TD></TR>
        <TR><TD ALIGN="LEFT">title_ru / title_uz</TD><TD ALIGN="LEFT">VARCHAR(255)</TD></TR>
        <TR><TD ALIGN="LEFT">published_at</TD><TD ALIGN="LEFT">DATE</TD></TR>
        <TR><TD ALIGN="LEFT">pdf_url</TD><TD ALIGN="LEFT">TEXT</TD></TR>
        <TR><TD ALIGN="LEFT">cover_url</TD><TD ALIGN="LEFT">TEXT</TD></TR>
      </TABLE>>];

    subscriptions [label=<
      <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">
        <TR><TD BGCOLOR="#E1D2EE" COLSPAN="2"><B>subscriptions</B></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id</B></TD><TD ALIGN="LEFT">SERIAL PK</TD></TR>
        <TR><TD ALIGN="LEFT"><I>user_id</I></TD><TD ALIGN="LEFT">FK → users</TD></TR>
        <TR><TD ALIGN="LEFT"><I>publication_id</I></TD><TD ALIGN="LEFT">FK → publications</TD></TR>
        <TR><TD ALIGN="LEFT">period_months</TD><TD ALIGN="LEFT">INT (1, 3, 6, 12)</TD></TR>
        <TR><TD ALIGN="LEFT">start_date / end_date</TD><TD ALIGN="LEFT">DATE</TD></TR>
        <TR><TD ALIGN="LEFT">status</TD><TD ALIGN="LEFT">pending/active/expired/cancelled</TD></TR>
        <TR><TD ALIGN="LEFT">total_amount</TD><TD ALIGN="LEFT">INT (сум)</TD></TR>
        <TR><TD ALIGN="LEFT">created_at</TD><TD ALIGN="LEFT">TIMESTAMP</TD></TR>
      </TABLE>>];

    payments [label=<
      <TABLE BORDER="0" CELLBORDER="1" CELLSPACING="0" CELLPADDING="4">
        <TR><TD BGCOLOR="#FBE7C6" COLSPAN="2"><B>payments</B></TD></TR>
        <TR><TD ALIGN="LEFT"><B>id</B></TD><TD ALIGN="LEFT">SERIAL PK</TD></TR>
        <TR><TD ALIGN="LEFT"><I>subscription_id</I></TD><TD ALIGN="LEFT">FK → subscriptions</TD></TR>
        <TR><TD ALIGN="LEFT">amount</TD><TD ALIGN="LEFT">INT (сум)</TD></TR>
        <TR><TD ALIGN="LEFT">card_last4</TD><TD ALIGN="LEFT">VARCHAR(4)</TD></TR>
        <TR><TD ALIGN="LEFT">status</TD><TD ALIGN="LEFT">success / failed</TD></TR>
        <TR><TD ALIGN="LEFT">paid_at</TD><TD ALIGN="LEFT">TIMESTAMP</TD></TR>
      </TABLE>>];

    categories    -> publications  [taillabel="1", headlabel="N", labeldistance=2.5, labelangle=15];
    publications  -> issues        [taillabel="1", headlabel="N", labeldistance=2.5, labelangle=15];
    publications  -> subscriptions [taillabel="1", headlabel="N", labeldistance=2.5, labelangle=15];
    users         -> subscriptions [taillabel="1", headlabel="N", labeldistance=2.5, labelangle=15];
    subscriptions -> payments      [taillabel="1", headlabel="N", labeldistance=2.5, labelangle=15];
}
"""


# ────────────────────────────── 3. Жизненный цикл подписки ──────────────────────────────

LIFECYCLE = r"""
digraph SUB {
    graph [rankdir=LR, splines=true, nodesep=0.7, ranksep=0.9, fontname="Times New Roman", fontsize=14, bgcolor="white"];
    node  [shape=circle, style="filled", fontname="Times New Roman", fontsize=13, width=1.2, fixedsize=true];
    edge  [fontname="Times New Roman", fontsize=11, color="#444444"];

    start [shape=point, width=0.20];
    pending   [label="pending",   fillcolor="#FBE7C6"];
    active    [label="active",    fillcolor="#D9E8C7"];
    expired   [label="expired",   fillcolor="#E0E0E0"];
    cancelled [label="cancelled", fillcolor="#F2D7D2"];

    start     -> pending   [label="POST /api/subscriptions"];
    pending   -> active    [label="оплата успешна"];
    pending   -> cancelled [label="оплата неуспешна"];
    active    -> expired   [label="end_date <\nCURRENT_DATE"];
    active    -> cancelled [label="отмена\nпользователем"];
    active    -> active    [label="renew\n(продление)"];
}
"""


def main() -> None:
    render("architecture", ARCHITECTURE)
    render("er-diagram", ER_DIAGRAM)
    render("subscription-lifecycle", LIFECYCLE)


if __name__ == "__main__":
    main()
