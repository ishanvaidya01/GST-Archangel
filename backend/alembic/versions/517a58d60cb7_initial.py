"""initial

Revision ID: 517a58d60cb7
Revises: 
Create Date: 2026-08-29 00:29:43.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import pgvector

# revision identifiers, used by Alembic.
revision: str = '517a58d60cb7'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # 1. Enable pgvector
    op.execute('CREATE EXTENSION IF NOT EXISTS vector;')

    # 2. Runs table
    op.create_table(
        'runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('business_name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('ingestion_errors', postgresql.JSONB(astext_type=sa.Text()), nullable=True)
    )

    # 3. Transactions table
    op.create_table(
        'transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('counterparty', sa.String(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('raw_ref', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE')
    )
    op.create_index('ix_transactions_run_id', 'transactions', ['run_id'])

    # 4. Invoices table
    op.create_table(
        'invoices',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('invoice_no', sa.String(), nullable=False),
        sa.Column('gstin', sa.String(), nullable=True),
        sa.Column('hsn_code', sa.String(), nullable=True),
        sa.Column('cgst', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('sgst', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('igst', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('total', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('supplier_name', sa.String(), nullable=False),
        sa.Column('raw_ref', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE')
    )
    op.create_index('ix_invoices_run_id', 'invoices', ['run_id'])

    # 5. Cases table
    op.create_table(
        'cases',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('invoice_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('risk_score', sa.Integer(), nullable=False),
        sa.Column('risk_breakdown', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('current_action', sa.String(), nullable=True),
        sa.Column('human_verdict', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id'], ondelete='CASCADE')
    )
    op.create_index('ix_cases_risk_score', 'cases', ['risk_score'])
    op.create_index('ix_cases_run_id', 'cases', ['run_id'])

    # 6. AgentEvents table
    op.create_table(
        'agent_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('agent_name', sa.String(), nullable=False),
        sa.Column('step', sa.String(), nullable=False),
        sa.Column('reasoning', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='CASCADE')
    )
    op.create_index('ix_agent_events_case_id', 'agent_events', ['case_id'])

    # 7. SupplierHistories table
    op.create_table(
        'supplier_histories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('run_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('supplier_name', sa.String(), nullable=False),
        sa.Column('prior_mismatch_count', sa.Integer(), nullable=False),
        sa.Column('notes', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE')
    )

    # 8. EvidenceLogs table
    op.create_table(
        'evidence_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('submitted_text', sa.String(), nullable=False),
        sa.Column('submitted_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('resulting_diff', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='CASCADE')
    )

    # 9. Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.UniqueConstraint('email')
    )

    # 10. LlmCalls table
    op.create_table(
        'llm_calls',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('agent_name', sa.String(), nullable=False),
        sa.Column('prompt', sa.String(), nullable=False),
        sa.Column('response', sa.String(), nullable=False),
        sa.Column('model_name', sa.String(), nullable=False),
        sa.Column('input_tokens', sa.Integer(), nullable=False),
        sa.Column('output_tokens', sa.Integer(), nullable=False),
        sa.Column('latency_ms', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='CASCADE')
    )

    # 11. RuleChunks table
    op.create_table(
        'rule_chunks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('citation', sa.String(), nullable=False),
        sa.Column('embedding', pgvector.sqlalchemy.Vector(1536), nullable=False)
    )


def downgrade() -> None:
    op.drop_table('rule_chunks')
    op.drop_table('llm_calls')
    op.drop_table('users')
    op.drop_table('evidence_logs')
    op.drop_table('supplier_histories')
    op.drop_index('ix_agent_events_case_id', table_name='agent_events')
    op.drop_table('agent_events')
    op.drop_index('ix_cases_run_id', table_name='cases')
    op.drop_index('ix_cases_risk_score', table_name='cases')
    op.drop_table('cases')
    op.drop_index('ix_invoices_run_id', table_name='invoices')
    op.drop_table('invoices')
    op.drop_index('ix_transactions_run_id', table_name='transactions')
    op.drop_table('transactions')
    op.drop_table('runs')
    op.execute('DROP EXTENSION IF EXISTS vector;')
