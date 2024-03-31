import {
  QueryClient,
  QueryClientProvider,
  useQuery
} from '@tanstack/react-query'
import {
  collection,
  doc,
  query as fquery,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  startAfter
} from 'firebase/firestore'
import { ListFilter, MoreHorizontal } from "lucide-react"
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { apiMiddleware } from "./api/helper"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./components/ui/dropdown-menu"
import { Label } from "./components/ui/label"
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from './components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"
import { Toaster } from "./components/ui/toaster"
import { db, dbCollections } from "./firebase"
import { usePagination } from './hooks/usePagination'
import { ITransaction } from "./lib/helper"
import { cn } from './lib/utils'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Transactions />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>)
}


function Transactions() {
  const { updatePaginationMap, onNextPage, onPrevPage, startAfterId, page, resultsPerPage, setResultsPerPage } =
    usePagination();

  const getTransactions = async () => {
    try {
      let q;
      q = fquery(collection(db, dbCollections.transactions), limit(10));
      if (page > 1) {
        if (startAfterId) {
          const cursor = await getDoc(doc(db, dbCollections.transactions, startAfterId));
          q = fquery(collection(db, dbCollections.transactions), startAfter(cursor), limit(10));
        }
      }
      const snapshot = await getDocs(q);
      const result = snapshot.docs.map((doc) => ({
        ...doc.data()
      }))
      updatePaginationMap(page, { first: result[0].id, last: result[result.length - 1].id })
      return apiMiddleware.fromJson(result) as ITransaction[];
    } catch (err) {
      console.error(err);
      return []
    }
  }

  const { data: totalTransactions, status: totalTransactionsStatus } = useQuery({
    queryKey: ['totalTransactions'], queryFn: async () => {
      return await getCountFromServer(fquery(collection(db, dbCollections.transactions))).then((snapshot) => {
        return snapshot.data().count
      });
    }
  })

  const { data, status } = useQuery({
    queryKey: ['transactions', page, resultsPerPage],
    queryFn: getTransactions
  })

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
        <div className='flex flex-col gap-6'>

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
                  <TableCell className="font-medium">{(index + 1) + ((page - 1) * resultsPerPage)}.</TableCell>
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
          <div className='flex items-center justify-between'>
            {totalTransactions &&
              <h3>Total: {totalTransactions}</h3>
            }
            <div className='ml-auto'>
              <CustomPagination
                count={totalTransactions || 0}
                page={page}
                onNextPage={() => onNextPage()}
                onPrevPage={() => onPrevPage()}
                resultsPerPage={resultsPerPage}
                setResultsPerPage={setResultsPerPage}
              />
            </div>
          </div>

        </div>
      }
    </main>
  )
}

export function CustomPagination({
  count,
  onNextPage,
  onPrevPage,
  page,
  resultsPerPage,
  setResultsPerPage
}: {
  count: number;
  page: number;
  onPrevPage: any;
  onNextPage: any;
  resultsPerPage: number;
  setResultsPerPage: any;
}) {
  return (
    <div className="flex flex-row gap-3 items-center">
      <p className='text-sm whitespace-nowrap'>
        Page {page} of {Math.ceil(count / resultsPerPage)}
      </p>
      <Pagination className='cursor-pointer'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={cn(page === 1 ? "opacity-50 cursor-not-allowed" : "opacity-100")}
              onClick={() => page !== 1 && onPrevPage()} />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className={cn(page === Math.ceil(count / resultsPerPage) ? "opacity-50 cursor-not-allowed" : "opacity-100")}
              onClick={() => page !== Math.ceil(count / resultsPerPage) && onNextPage()} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default App
