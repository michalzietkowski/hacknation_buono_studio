"""assistant sessions table

Revision ID: 20241206_000002
Revises: 20241206_000001
Create Date: 2025-12-06
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20241206_000002"
down_revision = "20241206_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "assistant_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", sa.String(length=255), nullable=False, unique=True),
        sa.Column("history", postgresql.JSONB, nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("form_state", postgresql.JSONB, nullable=False, server_default=sa.text("'{}'::jsonb")),
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
    op.create_index("ix_assistant_sessions_session_id", "assistant_sessions", ["session_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_assistant_sessions_session_id", table_name="assistant_sessions")
    op.drop_table("assistant_sessions")

