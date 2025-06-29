#!/bin/bash

echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "!! WARNING: This script will modify files in place.         !!"
echo "!! >> TEST ON COPIES FIRST <<                             !!"
echo "!! Ensure your code is backed up or committed to Git first. !!"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
read -p "Press Enter to continue, or Ctrl+C to abort..."

echo "Starting comment removal (ignoring first line, preserving '// eslint') and blank line collapsing (v9)..."

TARGET_DIRS=(
    "app/"
    "src/"
)

TMP_FILE_COMMENTS=$(mktemp)
TMP_FILE_BLANKS=$(mktemp)

echo "Target directories:"
for dir in "${TARGET_DIRS[@]}"; do
    echo "  - $dir"
done
echo "Searching for .ts and .tsx files..."

find "${TARGET_DIRS[@]}" -type f \( -name "*.ts" -o -name "*.tsx" \) -print0 | while IFS= read -r -d $'\0' file; do

    if [ ! -f "$file" ]; then
        echo "  -> Skipping non-file: $file"
        continue
    fi

    echo "Processing: $file"

    sed -e '
    2,$ {
        # If the line starts with optional whitespace then // eslint, do nothing (branch to end)
        /^[[:space:]]*\/\/ eslint/{b}
        # If the line starts with optional whitespace then // prettier, do nothing (branch to end)
        /^[[:space:]]*\/\/ prettier/{b}
        /^[[:space:]]*\/\/ @ts/{b}
        
        # Case 1: Comment starts at the beginning of the line (preceded by potential whitespace)
        s,^[[:space:]]*//.*$,,
        # Case 2: Comment follows some code/text (preceded by potential whitespace)
        s,[[:space:]]//.*$,,
    }
    ' "$file" > "$TMP_FILE_COMMENTS"
    if [ ! -s "$TMP_FILE_COMMENTS" ] && [ -s "$file" ]; then
        echo "  -> WARNING: Comment removal resulted in empty output for non-empty file. Skipping $file"
        truncate -s 0 "$TMP_FILE_COMMENTS" 
        continue 
    fi

    sed '/^$/N;/\n$/D' "$TMP_FILE_COMMENTS" > "$TMP_FILE_BLANKS"

    if [ ! -s "$TMP_FILE_BLANKS" ] && [ -s "$TMP_FILE_COMMENTS" ]; then
        echo "  -> INFO: Blank line collapsing resulted in empty output (likely okay). Continuing for $file"
    fi

    mv "$TMP_FILE_BLANKS" "$file"
     if [ $? -ne 0 ]; then
        echo "  -> ERROR: Failed to overwrite $file with mv. Check permissions or temp file state."
    else
        echo "  -> Processed successfully."
    fi

    truncate -s 0 "$TMP_FILE_COMMENTS"

done

rm -f "$TMP_FILE_COMMENTS" "$TMP_FILE_BLANKS" 

echo "Processing finished."
echo "Run 'npm run format' and 'npm run lint -- --fix' next."
echo "Please review the changes using 'git diff' or your backup."

exit 0