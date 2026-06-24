import re
import json
s = r'{"key": "value \- test \escape", "path": "C:\\folder\\file.txt", "newline": "line1\nline2"}'
print("Original:", repr(s))
cleaned = re.sub(r'(?<!\\)\\([^"\\/bfnrtu])', r'\1', s)
print("Cleaned:", repr(cleaned))
print("Parsed:", json.loads(cleaned))
