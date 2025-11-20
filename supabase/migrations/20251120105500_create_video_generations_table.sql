/*
  # Video Generations Schema

  ## Overview
  Creates a comprehensive database schema for storing AI-generated video content with full metadata tracking.

  ## New Tables

  ### `video_generations`
  Stores complete information about each video generation request and result.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each generation
  - `user_id` (uuid) - User identifier for tracking generations per user
  - `title` (text) - User-provided title for the video
  - `prompt` (text) - The generation prompt used
  - `negative_prompt` (text, nullable) - What to avoid in generation
  - `mode` (text) - Generation mode: text-to-video, image-to-video, video-extension
  - `model` (text) - Veo model used for generation
  - `aspect_ratio` (text) - Video aspect ratio
  - `resolution` (text) - Video resolution (720p/1080p)
  - `duration` (integer) - Video duration in seconds
  - `camera_motion` (text, nullable) - Camera motion description
  - `cinematic_style` (text, nullable) - Cinematic style applied
  - `seed` (integer, nullable) - Seed for deterministic generation
  - `enable_person_generation` (boolean) - Whether people are allowed
  - `video_url` (text, nullable) - URL to the generated video
  - `input_image_url` (text, nullable) - URL to input image if used
  - `reference_images` (jsonb, nullable) - Array of reference image data
  - `status` (text) - Generation status: pending, processing, completed, failed
  - `error_message` (text, nullable) - Error details if failed
  - `created_at` (timestamptz) - When generation was requested
  - `updated_at` (timestamptz) - Last update timestamp
  - `completed_at` (timestamptz, nullable) - When generation completed

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own video generations
  - Insert, select, update, and delete policies enforce user ownership

  ## Indexes
  - Index on user_id for fast user-specific queries
  - Index on created_at for chronological sorting
  - Index on status for filtering by generation state
*/

-- Create video_generations table
CREATE TABLE IF NOT EXISTS video_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled Video',
  prompt text NOT NULL,
  negative_prompt text,
  mode text NOT NULL,
  model text NOT NULL,
  aspect_ratio text NOT NULL,
  resolution text NOT NULL,
  duration integer NOT NULL,
  camera_motion text,
  cinematic_style text,
  seed integer,
  enable_person_generation boolean DEFAULT false,
  video_url text,
  input_image_url text,
  reference_images jsonb,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_video_generations_user_id ON video_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_video_generations_created_at ON video_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_generations_status ON video_generations(status);

-- Enable Row Level Security
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own video generations
CREATE POLICY "Users can view own video generations"
  ON video_generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own video generations
CREATE POLICY "Users can create video generations"
  ON video_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own video generations
CREATE POLICY "Users can update own video generations"
  ON video_generations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own video generations
CREATE POLICY "Users can delete own video generations"
  ON video_generations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_video_generations_updated_at
  BEFORE UPDATE ON video_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
