-- Clean up duplicate categories and add unique constraint
-- This migration will remove duplicate categories keeping only the most recent one per user/name combination

-- Step 1: Create a temporary table with unique categories (keeping the most recent)
CREATE TEMP TABLE unique_categories AS
SELECT DISTINCT ON (user_id, name)
  id, user_id, name, color, created_at, updated_at
FROM categories
ORDER BY user_id, name, updated_at DESC;

-- Step 2: Delete all categories
DELETE FROM categories;

-- Step 3: Insert back only the unique categories
INSERT INTO categories (id, user_id, name, color, created_at, updated_at)
SELECT id, user_id, name, color, created_at, updated_at
FROM unique_categories;

-- Step 4: Add unique constraint to prevent future duplicates
ALTER TABLE categories 
ADD CONSTRAINT unique_user_category_name 
UNIQUE (user_id, name);

-- Step 5: Reset the sequence to avoid ID conflicts
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
