import re

def generate_subtopic_id(module_title: str, topic_title: str, sub_topic_title: str) -> str:
    # This function should mirror the logic in frontend/src/lib/utils.ts
    # to ensure consistent ID generation.
    combined_string = f"{module_title}-{topic_title}-{sub_topic_title}"
    # Replace non-alphanumeric characters with hyphens
    cleaned_string = re.sub(r'[^a-zA-Z0-9]', '-', combined_string)
    # Convert to lowercase
    return cleaned_string.lower()