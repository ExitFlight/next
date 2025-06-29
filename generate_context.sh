#!/bin/bash

# --- generate_context.sh ---

OUTPUT_FILE="context.txt"

# List of specific files from the root directory to include.

ROOT_FILES=(
  "README.md"
  "package.json"
  "next.config.ts"
  "tailwind.config.ts" # Assuming you have one, if not, it will be skipped.
  "postcss.config.mjs"
  "tsconfig.json"
  "eslint.config.mjs"
)

# List of source directories to scan recursively.
SOURCE_DIRS=(
  "app"
  "src"
)

# --- End Configuration ---

# Clear the output file to start fresh.
> "$OUTPUT_FILE"

echo "🧹 Clearing old context and starting fresh..."
echo "🚀 Generating context for your project into $OUTPUT_FILE..."
echo "-------------------------------------------------"

# Helper function to append file content with a header
append_file_to_context() {
  local file_path="$1"
  if [ -f "$file_path" ]; then
    echo "📄 Adding: $file_path"
    echo "--- START FILE: $file_path ---" >> "$OUTPUT_FILE"
    cat "$file_path" >> "$OUTPUT_FILE"
    echo -e "\n--- END FILE: $file_path ---\n\n" >> "$OUTPUT_FILE"
  else
    # This is a warning, not an error, so the script can continue.
    echo "⚠️  Warning: File not found, skipping: $file_path" >&2
  fi
}

# 1. Process the specific root files
echo "[1/2] Processing root configuration files..."
for file in "${ROOT_FILES[@]}"; do
  append_file_to_context "$file"
done

# 2. Process all files in the source directories
echo "[2/2] Processing sou  "public"rce directories (app/, src/)..."
for dir in "${SOURCE_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    # Use find to recursively get all files in the directory.
    # -type f ensures we only get files, not directories.
    # The while loop reads each line (filename) from find's output.
    find "$dir" -type f | while read -r file; do
      append_file_to_context "$file"
    done
  else
    echo "⚠️  Warning: Directory not found, skipping: $dir" >&2
  fi
done

tree public/ >> "$OUTPUT_FILE"

echo "-------------------------------------------------"
echo "✅ Success! Project context has been generated in $OUTPUT_FILE"
echo "You can now copy the contents of that file and paste it into our chat."

