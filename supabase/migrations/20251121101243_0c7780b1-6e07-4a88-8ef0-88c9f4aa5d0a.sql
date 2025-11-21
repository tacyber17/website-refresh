-- Ensure pgcrypto extension is available in public schema
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;

-- Test if pgp_sym_encrypt is available
DO $$
BEGIN
  PERFORM pgp_sym_encrypt('test', 'key');
  RAISE NOTICE 'pgp_sym_encrypt is available';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgp_sym_encrypt error: %', SQLERRM;
END $$;