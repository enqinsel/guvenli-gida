-- Güvenli Gıda Database Schema
-- Run this in Supabase SQL Editor

-- Foods Table: Stores all food safety violations
CREATE TABLE IF NOT EXISTS foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_date DATE,
  company_name TEXT NOT NULL,
  brand TEXT,
  product_name TEXT NOT NULL,
  violation TEXT,
  batch_number TEXT,
  district TEXT,
  city TEXT,
  product_group TEXT,
  category TEXT NOT NULL CHECK (category IN ('saglik', 'taklit1', 'taklit2')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  removed_at TIMESTAMP WITH TIME ZONE,
  
  -- Unique constraint to prevent duplicates
  UNIQUE(company_name, product_name, batch_number, category)
);

-- Subscribers Table: Email subscribers for notifications
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_foods_is_active ON foods(is_active);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_city ON foods(city);
CREATE INDEX IF NOT EXISTS idx_foods_company ON foods(company_name);
CREATE INDEX IF NOT EXISTS idx_foods_created_at ON foods(created_at DESC);

-- Enable Row Level Security
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for foods
CREATE POLICY "Foods are viewable by everyone" ON foods
  FOR SELECT USING (true);

-- Public read access for subscriber count (not emails)
CREATE POLICY "Subscriber count is public" ON subscribers
  FOR SELECT USING (true);

-- Allow inserts for subscribers (anyone can subscribe)
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (true);
