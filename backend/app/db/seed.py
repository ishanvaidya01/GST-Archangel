import asyncio
import uuid
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.models import Base, Run, Transaction, Invoice, SupplierHistory

async def seed_data():
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        try:
            # Create a run
            run = Run(business_name="Acme Corp", status="processing")
            session.add(run)
            await session.flush()
            
            # Suppliers
            sup1 = "Apollo HealthCare Profficiency"
            sup2 = "Fast Logistics Ltd"
            sup3 = "Paperworks Inc"
            
            sh1 = SupplierHistory(run_id=run.id, supplier_name=sup1, prior_mismatch_count=2, notes="Often late with invoices")
            session.add(sh1)
            
            # Matched Case (Transaction + Invoice perfectly match)
            t1 = Transaction(run_id=run.id, date=date.today(), amount=Decimal("1180.00"), counterparty=sup1, source="bank")
            i1 = Invoice(run_id=run.id, type="purchase", invoice_no="INV-001", gstin="29ABCDE1234F1Z5", hsn_code="9983", cgst=Decimal("90.00"), sgst=Decimal("90.00"), igst=Decimal("0.00"), total=Decimal("1180.00"), supplier_name=sup1)
            
            # Missing Invoice Case (Transaction exists, no invoice)
            t2 = Transaction(run_id=run.id, date=date.today() - timedelta(days=2), amount=Decimal("5000.00"), counterparty=sup2, source="bank")
            
            # Amount Mismatch Case
            t3 = Transaction(run_id=run.id, date=date.today() - timedelta(days=5), amount=Decimal("2500.00"), counterparty=sup3, source="bank")
            i3 = Invoice(run_id=run.id, type="purchase", invoice_no="INV-003", gstin="27XYZAQ9876C1Z2", hsn_code="4820", cgst=Decimal("100.00"), sgst=Decimal("100.00"), igst=Decimal("0.00"), total=Decimal("2200.00"), supplier_name=sup3) # Mismatch!
            
            # HSN Mismatch Case (We will detect this via risk engine if HSN is invalid, but for now just seed it)
            t4 = Transaction(run_id=run.id, date=date.today() - timedelta(days=1), amount=Decimal("3540.00"), counterparty=sup1, source="bank")
            i4 = Invoice(run_id=run.id, type="purchase", invoice_no="INV-004", gstin="29ABCDE1234F1Z5", hsn_code="INVALID99", cgst=Decimal("270.00"), sgst=Decimal("270.00"), igst=Decimal("0.00"), total=Decimal("3540.00"), supplier_name=sup1)
            
            # Duplicate Invoice Case (Two invoices with same number)
            t5 = Transaction(run_id=run.id, date=date.today(), amount=Decimal("1000.00"), counterparty=sup2, source="bank")
            i5_a = Invoice(run_id=run.id, type="purchase", invoice_no="INV-005", gstin="07AAAAA0000A1Z5", hsn_code="9981", cgst=Decimal("0"), sgst=Decimal("0"), igst=Decimal("180.00"), total=Decimal("1180.00"), supplier_name=sup2)
            i5_b = Invoice(run_id=run.id, type="purchase", invoice_no="INV-005", gstin="07AAAAA0000A1Z5", hsn_code="9981", cgst=Decimal("0"), sgst=Decimal("0"), igst=Decimal("180.00"), total=Decimal("1180.00"), supplier_name=sup2)
            
            session.add_all([t1, i1, t2, t3, i3, t4, i4, t5, i5_a, i5_b])
            
            # Generate remaining ~20 transactions and invoices to hit the ~25 target
            for i in range(6, 26):
                amt = Decimal(str(100 * i))
                tax = amt * Decimal("0.18")
                tot = amt + tax
                tx = Transaction(run_id=run.id, date=date.today(), amount=tot, counterparty=f"Supplier {i}", source="bank")
                inv = Invoice(run_id=run.id, type="purchase", invoice_no=f"INV-0{i}", gstin=f"29SUP{i}1234F1Z5", hsn_code="9983", cgst=tax/2, sgst=tax/2, igst=Decimal("0.00"), total=tot, supplier_name=f"Supplier {i}")
                session.add_all([tx, inv])

            await session.commit()
            print(f"Successfully seeded DB. Run ID: {run.id}")
            
        except Exception as e:
            await session.rollback()
            print(f"Error seeding DB: {e}")
            raise
        finally:
            await session.close()
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
