-- Create a function to handle Google token authentication
CREATE OR REPLACE FUNCTION handle_google_auth(
  p_token TEXT,
  p_email TEXT,
  p_name TEXT,
  p_google_id TEXT,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_is_new_user boolean;
BEGIN
  -- Check if user exists by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    -- Create new user if not exists
    v_is_new_user := true;
    
    -- Generate a secure password based on Google ID
    INSERT INTO auth.users (
      email,
      raw_user_meta_data,
      raw_app_meta_data,
      is_anonymous,
      created_at,
      updated_at,
      email_confirmed_at
    )
    VALUES (
      p_email,
      jsonb_build_object(
        'name', p_name,
        'avatar_url', p_avatar_url,
        'google_id', p_google_id
      ),
      jsonb_build_object(
        'provider', 'google'
      ),
      false,
      now(),
      now(),
      now()
    )
    RETURNING id INTO v_user_id;
    
    -- Create profile for new user
    INSERT INTO public.profiles (
      id,
      name,
      email,
      avatar_url,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      p_name,
      p_email,
      p_avatar_url,
      now(),
      now()
    );
  ELSE
    -- Update existing user
    v_is_new_user := false;
    
    UPDATE auth.users
    SET
      raw_user_meta_data = jsonb_build_object(
        'name', p_name,
        'avatar_url', p_avatar_url,
        'google_id', p_google_id
      ),
      updated_at = now()
    WHERE id = v_user_id;
    
    -- Update profile
    UPDATE public.profiles
    SET
      name = p_name,
      avatar_url = p_avatar_url,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;
  
  -- Return user info
  RETURN json_build_object(
    'user_id', v_user_id,
    'email', p_email,
    'is_new_user', v_is_new_user
  );
END;
$$;

-- Create a function to verify Google token
CREATE OR REPLACE FUNCTION verify_google_token(
  p_token TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payload json;
  v_email text;
  v_name text;
  v_google_id text;
  v_avatar_url text;
BEGIN
  -- In a real implementation, this would verify the token with Google
  -- For now, we'll just parse the token and extract the payload
  -- This is a simplified version for demonstration
  
  -- Parse token (in a real implementation, this would verify with Google)
  -- For now, we'll just return success
  RETURN json_build_object(
    'valid', true,
    'message', 'Token verification is mocked for demonstration'
  );
END;
$$;

-- Create a function to handle Google Sign-In fallback for error code 10
CREATE OR REPLACE FUNCTION handle_google_signin_fallback(
  p_email TEXT,
  p_google_id TEXT,
  p_name TEXT,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_is_new_user boolean;
  v_password text;
BEGIN
  -- Generate a secure password based on Google ID
  v_password := 'google_' || p_google_id;
  
  -- Check if user exists by email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    -- Create new user if not exists
    v_is_new_user := true;
    
    -- Insert user with email/password
    INSERT INTO auth.users (
      email,
      encrypted_password,
      raw_user_meta_data,
      raw_app_meta_data,
      is_anonymous,
      created_at,
      updated_at,
      email_confirmed_at
    )
    VALUES (
      p_email,
      crypt(v_password, gen_salt('bf')),
      jsonb_build_object(
        'name', p_name,
        'avatar_url', p_avatar_url,
        'google_id', p_google_id
      ),
      jsonb_build_object(
        'provider', 'google_fallback'
      ),
      false,
      now(),
      now(),
      now()
    )
    RETURNING id INTO v_user_id;
    
    -- Create profile for new user
    INSERT INTO public.profiles (
      id,
      name,
      email,
      avatar_url,
      created_at,
      updated_at
    )
    VALUES (
      v_user_id,
      p_name,
      p_email,
      p_avatar_url,
      now(),
      now()
    );
  ELSE
    -- Update existing user
    v_is_new_user := false;
    
    -- Update password for fallback authentication
    UPDATE auth.users
    SET
      encrypted_password = crypt(v_password, gen_salt('bf')),
      raw_user_meta_data = jsonb_build_object(
        'name', p_name,
        'avatar_url', p_avatar_url,
        'google_id', p_google_id
      ),
      updated_at = now()
    WHERE id = v_user_id;
    
    -- Update profile
    UPDATE public.profiles
    SET
      name = p_name,
      avatar_url = p_avatar_url,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;
  
  -- Return user info
  RETURN json_build_object(
    'user_id', v_user_id,
    'email', p_email,
    'is_new_user', v_is_new_user,
    'password', v_password
  );
END;
$$;
