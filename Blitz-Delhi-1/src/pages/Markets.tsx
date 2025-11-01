
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the type for the coin data we expect from the API
interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

// Function to fetch coin data from CoinGecko API
const fetchCoins = async (): Promise<Coin[]> => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

// Helper to format numbers as currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Helper to format large numbers
const formatLargeNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(num);
};


const Markets = () => {
  const { data: coins, isLoading, error } = useQuery<Coin[]>({
    queryKey: ["coins"],
    queryFn: fetchCoins,
  });

  if (error) {
    return (
      <div className="container py-8">
        <p className="text-red-500">Error fetching data: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Cryptocurrency Market</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Coin</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h %</TableHead>
                <TableHead className="text-right">Market Cap</TableHead>
                <TableHead className="text-right">Volume (24h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                : coins?.map((coin, index) => (
                    <TableRow key={coin.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={coin.image} alt={coin.name} className="h-6 w-6" />
                          <span className="font-medium">{coin.name}</span>
                          <span className="text-muted-foreground uppercase">{coin.symbol}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(coin.current_price)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          coin.price_change_percentage_24h >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-right">
                        {formatLargeNumber(coin.market_cap)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatLargeNumber(coin.total_volume)}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Markets;
