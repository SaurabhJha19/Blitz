
-- Create a table for user wallets
CREATE TABLE public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(10, 2) NOT NULL DEFAULT 10000.00,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create an ENUM type for transaction types
CREATE TYPE public.transaction_type AS ENUM ('deposit', 'withdrawal');

-- Create a table for transactions
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id uuid NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  amount numeric(10, 2) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wallets table
CREATE POLICY "Users can view their own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
  ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for transactions table
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM public.wallets WHERE id = wallet_id));

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM public.wallets WHERE id = wallet_id));

-- Function to create a wallet for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Trigger to call handle_new_user on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle deposits
CREATE OR REPLACE FUNCTION public.deposit(amount_val numeric)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  wallet_id_val uuid;
BEGIN
  SELECT id INTO wallet_id_val FROM public.wallets WHERE user_id = auth.uid();

  IF wallet_id_val IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for current user';
  END IF;

  UPDATE public.wallets
  SET balance = balance + amount_val, updated_at = now()
  WHERE id = wallet_id_val;

  INSERT INTO public.transactions(wallet_id, type, amount)
  VALUES(wallet_id_val, 'deposit', amount_val);
END;
$$;

-- Function to handle withdrawals
CREATE OR REPLACE FUNCTION public.withdraw(amount_val numeric)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  wallet_id_val uuid;
  current_balance numeric;
BEGIN
  SELECT id, balance INTO wallet_id_val, current_balance FROM public.wallets WHERE user_id = auth.uid();

  IF wallet_id_val IS NULL THEN
    RAISE EXCEPTION 'Wallet not found for current user';
  END IF;

  IF current_balance < amount_val THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  UPDATE public.wallets
  SET balance = balance - amount_val, updated_at = now()
  WHERE id = wallet_id_val;

  INSERT INTO public.transactions(wallet_id, type, amount)
  VALUES(wallet_id_val, 'withdrawal', amount_val);
END;
$$;
