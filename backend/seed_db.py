#!/usr/bin/env python3
"""Seed database with embroidery patterns from static SVG files."""

import asyncio
import os
import shutil
import sys
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

import sqlalchemy
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

from adapters.persistence.sqlmodel.models import (
    Collection as ORMCollection,
    Pattern as ORMPattern,
)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://fioeluz:fioeluz_pass@localhost:5432/fioeluz_db",
)

SVG_SOURCE_DIR = os.getenv(
    "SVG_SOURCE_DIR",
    "/tmp/opencode/patterns-source",
)

PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PATTERNS_DIR = os.path.join(PROJECT_ROOT, "frontend", "public", "patterns")

COLLECTIONS = [
    {"slug": "xadrez",  "title": "Xadrez"},
    {"slug": "animais", "title": "Animais"},
    {"slug": "flores",  "title": "Flores"},
    {"slug": "pessoas", "title": "Pessoas"},
]

PATTERNS_META = [
    # (svg_filename_without_ext, title, collection_slug, scale_cm)
    # Xadrez (scale: 12cm)
    ("rei",     "Rei",    "xadrez",  12),
    ("rainha",  "Rainha", "xadrez",  12),
    ("bispo",   "Bispo",  "xadrez",  12),
    ("cavalo",  "Cavalo", "xadrez",  12),
    ("torre",   "Torre",  "xadrez",  12),
    ("peao",    "Peão",   "xadrez",  12),
    # Animais (scale: 16cm)
    ("camelo",   "Camelo",   "animais", 16),
    ("capivara", "Capivara", "animais", 16),
    ("cisne",    "Cisne",    "animais", 16),
    ("coelho",   "Coelho",   "animais", 16),
    ("coelho2",  "Coelho II","animais", 16),
    ("gorila",   "Gorila",   "animais", 16),
    ("leao",     "Leão",     "animais", 16),
    ("pato",     "Pato",     "animais", 16),
    ("pinguim",  "Pinguim",  "animais", 16),
    ("raposa",   "Raposa",   "animais", 16),
    # Flores (scale: 14cm)
    ("margarida",  "Margarida",       "flores", 14),
    ("margarida1", "Margarida II",    "flores", 14),
    ("buque",      "Buquê",           "flores", 14),
    ("melancia",   "Flor de Melancia","flores", 14),
    # Pessoas (scale: 18cm)
    ("cavaleiro", "Cavaleiro", "pessoas", 18),
    ("general",   "General",   "pessoas", 18),
    ("madame",    "Madame",    "pessoas", 18),
    ("mulher",    "Mulher",    "pessoas", 18),
]


def compute_difficulty(svg_path: str) -> int:
    tree = ET.parse(svg_path)
    root = tree.getroot()
    ns = {"svg": "http://www.w3.org/2000/svg"}

    paths = root.findall(".//svg:path", ns)
    lines = root.findall(".//svg:line", ns)
    circles = root.findall(".//svg:circle", ns)
    ellipses = root.findall(".//svg:ellipse", ns)

    total_commands = 0
    for p in paths:
        d = p.get("d", "")
        for c in "MLCQAZ":
            total_commands += d.count(c)

    score = (len(paths) * 3 + total_commands + len(lines) * 2 +
             len(circles) * 2 + len(ellipses) * 2)

    if score <= 15:
        return 1
    elif score <= 35:
        return 2
    elif score <= 55:
        return 3
    elif score <= 75:
        return 4
    else:
        return 5


async def seed():
    engine = create_async_engine(DATABASE_URL, echo=True, future=True)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        collection_ids = {}

        for col_data in COLLECTIONS:
            col_id = uuid.uuid5(uuid.NAMESPACE_DNS, f"collection-{col_data['slug']}")
            existing = await session.get(ORMCollection, col_id)
            if existing:
                collection_ids[col_data["slug"]] = existing.id
                print(f"  Collection '{col_data['title']}' already exists (id={existing.id})")
                continue

            cover_src = os.path.join(SVG_SOURCE_DIR, "covers", f"{col_data['slug']}.svg")
            cover_path = f"/patterns/covers/{col_data['slug']}.svg"
            cover_dst = os.path.join(PATTERNS_DIR, "covers", f"{col_data['slug']}.svg")

            col = ORMCollection(
                id=col_id,
                title=col_data["title"],
                cover_image_path=cover_path,
                created_at=datetime.utcnow(),
            )
            session.add(col)

            os.makedirs(os.path.dirname(cover_dst), exist_ok=True)
            if os.path.exists(cover_src):
                shutil.copy2(cover_src, cover_dst)
                print(f"  Copied cover: {cover_src} -> {cover_dst}")

            collection_ids[col_data["slug"]] = col_id
            print(f"  Created collection '{col_data['title']}' (id={col_id})")

        await session.commit()

        patterns_created = 0
        patterns_skipped = 0

        for (slug, title, coll_slug, scale_cm) in PATTERNS_META:
            pat_id = uuid.uuid5(uuid.NAMESPACE_DNS, f"static-pattern-{slug}")
            existing = await session.get(ORMPattern, pat_id)
            if existing:
                patterns_skipped += 1
                continue

            svg_filename = f"{slug}.svg"
            svg_src = os.path.join(SVG_SOURCE_DIR, coll_slug, svg_filename)
            coll_dir = os.path.join(PATTERNS_DIR, coll_slug)
            os.makedirs(coll_dir, exist_ok=True)
            svg_dst = os.path.join(coll_dir, svg_filename)

            image_path = f"/patterns/{coll_slug}/{svg_filename}"

            if os.path.exists(svg_src):
                shutil.copy2(svg_src, svg_dst)

            difficulty = compute_difficulty(svg_dst if os.path.exists(svg_dst) else svg_src)

            pat = ORMPattern(
                id=pat_id,
                collection_id=collection_ids[coll_slug],
                title=title,
                image_path=image_path,
                thumbnail_path=image_path,
                scale_cm_reference=float(scale_cm),
                difficulty_level=difficulty,
                created_at=datetime.utcnow(),
            )
            session.add(pat)
            patterns_created += 1

        await session.commit()

        total = await session.scalar(select(sqlalchemy.func.count()).select_from(ORMPattern))
        coll_total = await session.scalar(select(sqlalchemy.func.count()).select_from(ORMCollection))

    print(f"\n=== Seed complete ===")
    print(f"  Collections: {coll_total}")
    print(f"  Patterns created: {patterns_created}")
    print(f"  Patterns skipped (already exist): {patterns_skipped}")
    print(f"  Total patterns in DB: {total}")
    print(f"  SVGs in: {PATTERNS_DIR}")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
