"""init accident schema

Revision ID: 20241206_000001
Revises: None
Create Date: 2025-12-06
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20241206_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    rola_enum = sa.Enum("admin", "pracownik", "zus", name="rola_uzytkownika")
    typ_adresu_enum = sa.Enum(
        "zamieszkania",
        "ostatni_pobyt_pl",
        "korespondencyjny",
        "miejsce_dzialalnosci",
        "miejsce_wypadku",
        "placowka_medyczna",
        name="typ_adresu",
    )
    rodzaj_koresp_enum = sa.Enum("standard", "poste_restante", "skrytka_pocztowa", name="rodzaj_korespondencji")
    typ_zglasz_enum = sa.Enum("poszkodowany", "pelnomocnik", name="typ_zglaszajacego")
    status_sprawy_enum = sa.Enum("zakonczona", "w_toku", "umorzona", name="status_sprawy")
    typ_organ_enum = sa.Enum("policja", "prokuratura", "pip", "sanepid", "psp", "inne", name="typ_organ")
    status_sprawy_post_enum = sa.Enum("zakonczona", "w_toku", "umorzona", name="status_sprawy_postepowanie")
    zakres_pytania_enum = sa.Enum("zawiadomienie", "wyjasnienia", name="zakres_pytania")

    op.create_table(
        "organizacje",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nazwa", sa.String(255), nullable=False),
        sa.Column("nip", sa.String(20), unique=True),
        sa.Column("regon", sa.String(20), unique=True),
        sa.Column("typ", sa.String(50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "uzytkownicy",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organizacja_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizacje.id"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("rola", rola_enum, nullable=False),
        sa.Column("hashed_password", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.UniqueConstraint("organizacja_id", "email", name="uq_uzytkownicy_org_email"),
    )

    op.create_table(
        "osoby",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organizacja_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizacje.id"), nullable=False),
        sa.Column("pesel", sa.String(11)),
        sa.Column("dokument_typ", sa.String(50)),
        sa.Column("dokument_nr", sa.String(50)),
        sa.Column("imie", sa.String(100), nullable=False),
        sa.Column("nazwisko", sa.String(100), nullable=False),
        sa.Column("data_urodzenia", sa.Date()),
        sa.Column("miejsce_urodzenia", sa.String(120)),
        sa.Column("telefon", sa.String(50)),
        sa.Column("email", sa.String(255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "adresy",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organizacja_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizacje.id"), nullable=False),
        sa.Column("osoba_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("osoby.id")),
        sa.Column("typ", typ_adresu_enum, nullable=False),
        sa.Column("ulica", sa.String(120)),
        sa.Column("nr_domu", sa.String(20)),
        sa.Column("nr_lokalu", sa.String(20)),
        sa.Column("kod", sa.String(12)),
        sa.Column("miejscowosc", sa.String(120)),
        sa.Column("kraj", sa.String(80), nullable=False),
        sa.Column("rodzaj_korespondencji", rodzaj_koresp_enum),
        sa.Column("nazwa_placowki", sa.String(120)),
        sa.Column("nr_skrytki", sa.String(30)),
        sa.Column("kod_urzedu", sa.String(20)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "dzialalnosci",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organizacja_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizacje.id"), nullable=False),
        sa.Column("nip", sa.String(20), nullable=False),
        sa.Column("regon", sa.String(20)),
        sa.Column("pkd_kod", sa.String(10)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "wypadki",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organizacja_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizacje.id"), nullable=False),
        sa.Column("dzialalnosc_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("dzialalnosci.id")),
        sa.Column("poszkodowany_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("osoby.id"), nullable=False),
        sa.Column("zglaszajacy_typ", typ_zglasz_enum, nullable=False),
        sa.Column("zglaszajacy_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("osoby.id"), nullable=False),
        sa.Column("pelnomocnik_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("osoby.id")),
        sa.Column("data_wypadku", sa.Date(), nullable=False),
        sa.Column("godzina_wypadku", sa.Time(), nullable=False),
        sa.Column("plan_start", sa.Time()),
        sa.Column("plan_koniec", sa.Time()),
        sa.Column("miejsce_adres_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("adresy.id"), nullable=False),
        sa.Column("opis_czynnosci", sa.Text()),
        sa.Column("opis_zdarzenia", sa.Text()),
        sa.Column("opis_przyczyny", sa.Text()),
        sa.Column("opis_miejsca", sa.Text()),
        sa.Column("urazy_opis", sa.Text()),
        sa.Column("czy_smiertelny", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("czy_pierwsza_pomoc", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("placowka_adres_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("adresy.id")),
        sa.Column("rozpoznanie_medyczne", sa.Text()),
        sa.Column("hospitalizacja_od", sa.Date()),
        sa.Column("hospitalizacja_do", sa.Date()),
        sa.Column("niezdolnosc_dni", sa.Integer()),
        sa.Column("l4_w_dniu", sa.Boolean()),
        sa.Column("l4_powod", sa.Text()),
        sa.Column("czy_badanie_trzezwosci", sa.Boolean()),
        sa.Column("trzezwosc_wynik", sa.String(50)),
        sa.Column("trzezwosc_szczegoly", sa.Text()),
        sa.Column("status_sprawy", status_sprawy_enum),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "wypadek_swiadkowie",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("wypadek_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False),
        sa.Column("imie", sa.String(100), nullable=False),
        sa.Column("nazwisko", sa.String(100), nullable=False),
        sa.Column("adres", sa.String(255)),
        sa.Column("kontakt", sa.String(100)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "wypadek_maszyny",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("wypadek_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False),
        sa.Column("nazwa", sa.String(120), nullable=False),
        sa.Column("typ", sa.String(120)),
        sa.Column("data_produkcji", sa.String(20)),
        sa.Column("czy_sprawna", sa.Boolean()),
        sa.Column("uzycie_zgodne", sa.Boolean()),
        sa.Column("czy_deklaracja_zgodnosci", sa.Boolean()),
        sa.Column("czy_w_ewidencji", sa.Boolean()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "wypadek_srodki_ochrony",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("wypadek_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False),
        sa.Column("nazwa", sa.String(120), nullable=False),
        sa.Column("czy_sprawny", sa.Boolean()),
        sa.Column("czy_wymagana_asekuracja", sa.Boolean()),
        sa.Column("czy_mogla_byc_samotnie", sa.Boolean()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "wypadek_postepowania",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("wypadek_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False),
        sa.Column("organ_typ", typ_organ_enum, nullable=False),
        sa.Column("nazwa_organu", sa.String(120)),
        sa.Column("numer_sprawy", sa.String(80)),
        sa.Column("status_sprawy", status_sprawy_post_enum, nullable=False, server_default=sa.text("'w_toku'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "wyjasnienia_poszkodowanego",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("wypadek_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("opis_czynnosci", sa.Text(), nullable=False),
        sa.Column("opis_zdarzen", sa.Text(), nullable=False),
        sa.Column("opis_przyczyn", sa.Text(), nullable=False),
        sa.Column("opis_maszyn", sa.Text()),
        sa.Column("opis_srodki_ochrony", sa.Text()),
        sa.Column("opis_postepowan", sa.Text()),
        sa.Column("rozpoznanie_medyczne", sa.Text()),
        sa.Column("hospitalizacja_okres", sa.String(120)),
        sa.Column("l4_info", sa.String(120)),
        sa.Column("ocena_trzezwosci", sa.String(120)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "pytania_dynamiczne",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organizacja_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizacje.id"), nullable=False),
        sa.Column("zakres", zakres_pytania_enum, nullable=False),
        sa.Column("tresc", sa.Text(), nullable=False),
        sa.Column("wymagane", sa.String(10)),
        sa.Column("kolejnosc", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "warunki_pytan",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("pytanie_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("pytania_dynamiczne.id", ondelete="CASCADE"), nullable=False),
        sa.Column("definicja", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "odpowiedzi_dynamiczne",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("pytanie_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("pytania_dynamiczne.id", ondelete="CASCADE"), nullable=False),
        sa.Column("wypadek_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False),
        sa.Column("wyjasnienia_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("wyjasnienia_poszkodowanego.id", ondelete="CASCADE")),
        sa.Column("wartosc_text", sa.Text()),
        sa.Column("wartosc_json", postgresql.JSONB(astext_type=sa.Text())),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "zalaczniki",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organizacja_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("organizacje.id"), nullable=False),
        sa.Column("nazwa_pliku", sa.String(255), nullable=False),
        sa.Column("mime_type", sa.String(120), nullable=False),
        sa.Column("size_bytes", sa.String(40)),
        sa.Column("blob", sa.LargeBinary(), nullable=False),
        sa.Column("meta", postgresql.JSONB(astext_type=sa.Text())),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )

    op.create_table(
        "wypadek_zalaczniki",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("wypadek_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False),
        sa.Column("wyjasnienia_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("wyjasnienia_poszkodowanego.id", ondelete="CASCADE")),
        sa.Column("zalacznik_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("zalaczniki.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rola", sa.String(80)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("wypadek_zalaczniki")
    op.drop_table("zalaczniki")
    op.drop_table("odpowiedzi_dynamiczne")
    op.drop_table("warunki_pytan")
    op.drop_table("pytania_dynamiczne")
    op.drop_table("wyjasnienia_poszkodowanego")
    op.drop_table("wypadek_postepowania")
    op.drop_table("wypadek_srodki_ochrony")
    op.drop_table("wypadek_maszyny")
    op.drop_table("wypadek_swiadkowie")
    op.drop_table("wypadki")
    op.drop_table("dzialalnosci")
    op.drop_table("adresy")
    op.drop_table("osoby")
    op.drop_table("uzytkownicy")
    op.drop_table("organizacje")

    for enum_name in [
        "zakres_pytania",
        "status_sprawy_postepowanie",
        "typ_organ",
        "status_sprawy",
        "typ_zglaszajacego",
        "rodzaj_korespondencji",
        "typ_adresu",
        "rola_uzytkownika",
    ]:
        op.execute(sa.text(f"DROP TYPE IF EXISTS {enum_name}"))

