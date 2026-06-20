import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT pid, state, query FROM pg_stat_activity WHERE state IN ('active', 'idle in transaction');"))
    for row in result:
        print(row)
