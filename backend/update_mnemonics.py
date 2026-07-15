"""将 mnemonics_data.py 中的三风格素材写入 Supabase words 表
mnemonic 列存为 JSON：{"simple":"...","story":"...","mnemonic":"..."}
"""
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

from supabase_client import get_supabase
from mnemonics_data import MNEMONICS

supabase = get_supabase()
success = 0
fail = 0
fail_ids = []

for word_id, styles in sorted(MNEMONICS.items()):
    try:
        result = supabase.table('words').update({
            'mnemonic': json.dumps(styles, ensure_ascii=False)
        }).eq('id', word_id).execute()
        if result.data:
            success += 1
            print(f"OK id={word_id}")
        else:
            fail += 1
            fail_ids.append(word_id)
            print(f"FAIL id={word_id} - no data returned")
    except Exception as e:
        fail += 1
        fail_ids.append(word_id)
        print(f"ERROR id={word_id}: {e}")

print(f"\nDone. Success: {success}, Fail: {fail}")
if fail_ids:
    print(f"Failed IDs: {fail_ids}")
