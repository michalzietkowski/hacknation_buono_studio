"""analysis cases and documents

Revision ID: 20241207_000003
Revises: 20241206_000002
Create Date: 2025-12-07
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20241207_000003"
down_revision = "20241206_000002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "analysis_cases",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="processing"),
        sa.Column("source_case_id", sa.String(length=120), nullable=True),
        sa.Column("result", postgresql.JSONB, nullable=True),
        sa.Column("error", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )

    op.create_table(
        "analysis_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("case_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("analysis_cases.id", ondelete="CASCADE"), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("mime_type", sa.String(length=120), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("form", sa.String(length=50), nullable=True),
        sa.Column("doc_type", sa.String(length=50), nullable=True),
        sa.Column("other_description", sa.String(length=255), nullable=True),
        sa.Column("blob", sa.LargeBinary(), nullable=False),
        sa.Column("meta", postgresql.JSONB, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
    )
    op.create_index("ix_analysis_documents_case_id", "analysis_documents", ["case_id"])


def downgrade() -> None:
    op.drop_index("ix_analysis_documents_case_id", table_name="analysis_documents")
    op.drop_table("analysis_documents")
    op.drop_table("analysis_cases")

