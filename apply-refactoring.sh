#!/bin/bash

# Apply refactoring changes
echo "Applying refactoring changes..."

# Create backup of original files
echo "Creating backup of original files..."
mkdir -p backup/src/components
cp -r src/App.tsx src/main.tsx src/components/* backup/src/

# Move new files to their final locations
echo "Moving new files to their final locations..."
mv src/App.tsx.new src/App.tsx
mv src/main.tsx.new src/main.tsx

# Remove old component files that have been moved
echo "Removing old component files..."
rm -f src/components/ChatInput.tsx
rm -f src/components/ChatMessage.tsx
rm -f src/components/ConfessionDropdown.tsx
rm -f src/components/FireOverlay3D.tsx

echo "Refactoring applied successfully!"
echo "Original files are backed up in the 'backup' directory."
echo ""
echo "To test the refactored application, run:"
echo "  npm run dev"
