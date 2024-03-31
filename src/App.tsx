import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  collection,
  query as fquery,
  getDocs,
  limit
} from 'firebase/firestore'
import { ListFilter, MoreHorizontal } from "lucide-react"
import { apiMiddleware } from "./api/helper"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu"
import { Label } from "./components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Toaster } from "./components/ui/toaster"
import { db, dbCollections } from "./firebase"
import { ITransaction } from "./lib/helper"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Transactions />
      <Toaster />
    </QueryClientProvider>)
}


function Transactions() {
  const queryClient = useQueryClient()

  const getTransactions = async () => {
    const q = fquery(collection(db, dbCollections.transactions), limit(10))
    const snapshot = await getDocs(q);
    const result = snapshot.docs.map((doc) => ({
      ...doc.data()
    }))
    return apiMiddleware.fromJson(result) as ITransaction[];
  }

  const { data, status } = useQuery({ queryKey: ['transactions'], queryFn: getTransactions })
  return (
    <main className='container w-full mx-auto p-6'>
      <div className="flex items-center mb-6">
        <h1 className='text-2xl font-bold'>Transactions</h1>
        <div className="ml-auto flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-1"
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem>
                Attempted
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>
                Succeeded
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>
                Failed
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-3 min-w-[200px]">
            <Label htmlFor="status" className="whitespace-nowrap">Sort By</Label>
            <Select>
              <SelectTrigger id="status" aria-label="Select status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {status === "success" &&
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sr.no</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">
                Payment Method
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Date
              </TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d, index) =>
              <TableRow>
                <TableCell className="font-medium">{index + 1}.</TableCell>
                <TableCell className="font-medium">
                  {d.customer}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{d.status}</Badge>
                </TableCell>
                <TableCell>{d.amount}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {d.paymentMethod}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {new Date(d.date).toDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-haspopup="true"
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      }
    </main>
  )
}


export default App
