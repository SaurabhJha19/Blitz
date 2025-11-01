
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, MinusCircle, Loader2 } from 'lucide-react';
import DebitCard from '@/components/DebitCard';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
});

// Helper to format numbers as currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const Wallet = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'deposit' | 'withdraw'>('deposit');

  useEffect(() => {
    if (!session) {
      navigate('/auth');
    }
  }, [session, navigate]);

  const fetchWallet = async () => {
    if (!user) return null;
    const { data, error } = await supabase.rpc('get_or_create_wallet');

    if (error) {
      throw new Error(error.message);
    }
    return data;
  };
  
  const fetchTransactions = async (walletId: string) => {
    const { data, error } = await supabase.from('transactions').select('*').eq('wallet_id', walletId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  };

  const { data: wallet, isLoading: isLoadingWallet, error: walletError } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: fetchWallet,
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', wallet?.id],
    queryFn: () => fetchTransactions(wallet!.id),
    enabled: !!wallet,
  });
  
  const mutation = useMutation({
    mutationFn: async ({ amount, type }: { amount: number, type: 'deposit' | 'withdraw' }) => {
      const { error } = await supabase.rpc(type, { amount_val: amount });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({ title: `${variables.type === 'deposit' ? 'Deposit' : 'Withdrawal'} successful!`, description: `Your balance has been updated.` });
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['transactions', wallet?.id] });
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Transaction failed', description: error.message, variant: 'destructive' });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: 0 },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate({ amount: values.amount, type: dialogMode });
  }
  
  if (!session) return null;

  if (isLoadingWallet) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        </Card>
      </div>
    )
  }
  
  if (walletError) {
     return (
      <div className="container py-8 text-center">
        <p className="text-red-500">Could not load wallet data: {walletError.message}</p>
      </div>
    );
  }

  if (!wallet) {
     return (
      <div className="container py-8 text-center">
        <p>Your wallet is not available at the moment. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Balance</CardTitle>
              <CardDescription>Your available funds.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{formatCurrency(wallet.balance)}</p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <div className="mt-6 flex gap-4">
                  <DialogTrigger asChild>
                    <Button onClick={() => setDialogMode('deposit')} className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" /> Deposit
                    </Button>
                  </DialogTrigger>
                  <DialogTrigger asChild>
                    <Button onClick={() => setDialogMode('withdraw')} variant="outline" className="w-full">
                      <MinusCircle className="mr-2 h-4 w-4" /> Withdraw
                    </Button>
                  </DialogTrigger>
                </div>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{dialogMode === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}</DialogTitle>
                    <DialogDescription>
                      Enter the amount you'd like to {dialogMode}. This is a simulation, no real money is involved.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (USD)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={mutation.isPending}>
                          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Confirm {dialogMode === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>A record of your recent deposits and withdrawals.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingTransactions ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : transactions && transactions.length > 0 ? (
                    transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{tx.type}</TableCell>
                        <TableCell className={`text-right font-medium ${tx.type === 'deposit' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.type === 'deposit' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">No transactions yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <DebitCard />
        </div>
      </div>
    </div>
  );
};

export default Wallet;
