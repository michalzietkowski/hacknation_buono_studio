import datetime as dt
import uuid

from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, DateTime


Base = declarative_base()


class TimestampMixin:
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: dt.datetime.now(dt.timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: dt.datetime.now(dt.timezone.utc),
        onupdate=lambda: dt.datetime.now(dt.timezone.utc),
        nullable=False,
    )


def default_uuid() -> uuid.UUID:
    return uuid.uuid4()

