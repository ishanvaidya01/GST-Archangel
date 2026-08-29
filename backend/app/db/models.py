from datetime import datetime, date
from decimal import Decimal
from typing import Optional, Any
import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Date, Numeric,
    ForeignKey, text, JSON, Index
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Run(Base):
    __tablename__ = "runs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    status: Mapped[str] = mapped_column(String, nullable=False)
    ingestion_errors: Mapped[Optional[Any]] = mapped_column(JSONB, nullable=True)

class Transaction(Base):
    __tablename__ = "transactions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("runs.id", ondelete="CASCADE"))
    date: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    counterparty: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False)
    raw_ref: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class Invoice(Base):
    __tablename__ = "invoices"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("runs.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(String, nullable=False) # 'purchase' | 'sale'
    invoice_no: Mapped[str] = mapped_column(String, nullable=False)
    gstin: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hsn_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    cgst: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    sgst: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    igst: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    supplier_name: Mapped[str] = mapped_column(String, nullable=False)
    raw_ref: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class Case(Base):
    __tablename__ = "cases"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("runs.id", ondelete="CASCADE"))
    transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=True)
    invoice_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="CASCADE"), nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)
    risk_breakdown: Mapped[Any] = mapped_column(JSONB, nullable=False)
    current_action: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    human_verdict: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))

class AgentEvent(Base):
    __tablename__ = "agent_events"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"))
    agent_name: Mapped[str] = mapped_column(String, nullable=False)
    step: Mapped[str] = mapped_column(String, nullable=False)
    reasoning: Mapped[Any] = mapped_column(JSONB, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class SupplierHistory(Base):
    __tablename__ = "supplier_histories"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("runs.id", ondelete="CASCADE"))
    supplier_name: Mapped[str] = mapped_column(String, nullable=False)
    prior_mismatch_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)

class EvidenceLog(Base):
    __tablename__ = "evidence_logs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"))
    submitted_text: Mapped[str] = mapped_column(String, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))
    resulting_diff: Mapped[Any] = mapped_column(JSONB, nullable=False)

class User(Base):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class LlmCall(Base):
    __tablename__ = "llm_calls"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id", ondelete="CASCADE"), nullable=True)
    agent_name: Mapped[str] = mapped_column(String, nullable=False)
    prompt: Mapped[str] = mapped_column(String, nullable=False)
    response: Mapped[str] = mapped_column(String, nullable=False)
    model_name: Mapped[str] = mapped_column(String, nullable=False)
    input_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    output_tokens: Mapped[int] = mapped_column(Integer, nullable=False)
    latency_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class RuleChunk(Base):
    __tablename__ = "rule_chunks"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content: Mapped[str] = mapped_column(String, nullable=False)
    citation: Mapped[str] = mapped_column(String, nullable=False)
    embedding: Mapped[Any] = mapped_column(Vector(1536), nullable=False)

# Indexes
Index('ix_transactions_run_id', Transaction.run_id)
Index('ix_invoices_run_id', Invoice.run_id)
Index('ix_cases_run_id', Case.run_id)
Index('ix_cases_risk_score', Case.risk_score)
Index('ix_agent_events_case_id', AgentEvent.case_id)
