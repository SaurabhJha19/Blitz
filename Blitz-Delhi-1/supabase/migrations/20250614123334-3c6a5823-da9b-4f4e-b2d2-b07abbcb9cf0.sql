
-- Function to get a user's wallet, or create one if it doesn't exist.
CREATE OR REPLACE FUNCTION public.get_or_create_wallet()
RETURNS wallets
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  wallet_record public.wallets;
BEGIN
  -- Check if wallet exists for the current user
  SELECT * INTO wallet_record FROM public.wallets WHERE user_id = auth.uid();

  -- If wallet does not exist, create it
  IF wallet_record IS NULL THEN
    INSERT INTO public.wallets (user_id) VALUES (auth.uid())
    RETURNING * INTO wallet_record;
  END IF;
  
  -- Return the wallet
  RETURN wallet_record;
END;
$$;
