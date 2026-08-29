import pandas as pd
from typing import List, Tuple
from app.ingestion.schema import ExtractedTransaction
import io

def parse_bank_csv(file_content: bytes) -> Tuple[List[ExtractedTransaction], List[str]]:
    transactions = []
    errors = []
    try:
        df = pd.read_csv(io.BytesIO(file_content))
        for index, row in df.iterrows():
            try:
                date_val = pd.to_datetime(row.get('Date', row.iloc[0])).date()
                amount_val = row.get('Amount', row.iloc[1])
                counterparty_val = str(row.get('Counterparty', row.iloc[2]))
                ref_val = str(row.get('Reference', ''))
                
                transactions.append(
                    ExtractedTransaction(
                        date=date_val,
                        amount=abs(float(amount_val)),
                        counterparty=counterparty_val,
                        source="bank_csv",
                        raw_ref=ref_val
                    )
                )
            except Exception as e:
                errors.append(f"Row {index}: {str(e)}")
    except Exception as e:
        errors.append(f"CSV Parsing failed: {str(e)}")
        
    return transactions, errors
