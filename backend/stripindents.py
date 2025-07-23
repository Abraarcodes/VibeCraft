from typing import Union

def strip_indents(value: Union[str, list], *values: any) -> str:
    if not isinstance(value, str):
        # Simulate tagged template processing: combine strings and values
        processed = ""
        for i, segment in enumerate(value):
            processed += segment
            if i < len(values):
                processed += str(values[i])
        return _strip_indents(processed)

    return _strip_indents(value)


def _strip_indents(text: str) -> str:
    return "\n".join(line.strip() for line in text.splitlines()).lstrip().rstrip("\r\n")
