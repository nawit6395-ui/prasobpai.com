-- 1. Create Enum for Roles
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- 2. Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role user_role DEFAULT 'user';

-- 3. Update RLS policies to allow admins/moderators more access (Optional for now, but good practice)
-- For this specific request, we just need the column to exist and be updateable by the user (for testing/demo purposes as implied by "adjust role level")
-- In a real app, only admins should update roles, but for this "self-adjustment" feature:

CREATE POLICY "Users can update their own role" 
ON profiles FOR UPDATE USING (auth.uid() = id);
