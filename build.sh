#!/bin/bash
set -e

echo "Loading environment variables..."
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

echo "Creating dist directory..."
mkdir -p dist

echo "Copying static files..."
cp index.html dist/

echo "Copying CSS..."
cp index.css dist/index.css

echo "Building TypeScript/React with esbuild..."
npx esbuild index.tsx --bundle --outfile=dist/index.js \
  --loader:.tsx=tsx --loader:.ts=tsx --loader:.css=empty \
  --jsx=automatic --jsx-dev --format=esm --minify --sourcemap \
  --define:process.env.NODE_ENV='"production"' \
  --define:import.meta.env.PROD='true' \
  --define:import.meta.env.VITE_SUPABASE_URL='"'$VITE_SUPABASE_URL'"' \
  --define:import.meta.env.VITE_SUPABASE_ANON_KEY='"'$VITE_SUPABASE_ANON_KEY'"' \
  --define:import.meta.env.VITE_API_KEY='"'$VITE_API_KEY'"' \
  --define:import.meta.env.VITE_GEMINI_API_KEY='"'$VITE_GEMINI_API_KEY'"'

echo "Updating HTML references..."
sed -i 's/index\.tsx/index.js/g' dist/index.html

echo "Build complete!"
