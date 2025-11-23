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

echo "Building Netlify Functions..."
npx esbuild netlify/functions/gemini-generate.ts --bundle --platform=node --target=node18 --outfile=netlify/functions/gemini-generate.js --format=cjs --external:@netlify/functions

echo "Building TypeScript/React with esbuild..."
npx esbuild index.tsx --bundle --outfile=dist/index.js \
  --loader:.tsx=tsx --loader:.ts=tsx --loader:.css=empty \
  --jsx=automatic --jsx-dev --format=esm --minify --sourcemap \
  --define:process.env.NODE_ENV='"production"' \
  --define:import.meta.env.PROD='true' \
  --define:import.meta.env.VITE_SUPABASE_URL='"'$VITE_SUPABASE_URL'"' \
  --define:import.meta.env.VITE_SUPABASE_ANON_KEY='"'$VITE_SUPABASE_ANON_KEY'"'

echo "Updating HTML references..."
sed -i 's/index\.tsx/index.js/g' dist/index.html

echo "Build complete!"
