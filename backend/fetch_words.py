"""临时脚本：导出所有单词到 words_list.txt"""
from supabase_client import get_supabase

supabase = get_supabase()
result = supabase.table('words').select('id,word,phonetic,basic_meaning').order('id').execute()
words = result.data
print(f"Total: {len(words)}")
with open('words_list.txt', 'w', encoding='utf-8') as f:
    for w in words:
        f.write(f"{w['id']}|{w['word']}|{w.get('phonetic','')}|{w.get('basic_meaning','')}\n")
print("Done. Written to words_list.txt")
