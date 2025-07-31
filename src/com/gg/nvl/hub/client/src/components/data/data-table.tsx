import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2
} from "lucide-react";
import type { Transaction } from "@shared/schema";

interface DataTableProps {
  data: Transaction[];
  className?: string;
}

type SortField = "transactionId" | "type" | "status" | "createdAt" | "duration";
type SortOrder = "asc" | "desc";

const statusIcons = {
  success: CheckCircle,
  processing: Loader2,
  failed: XCircle,
  error: AlertCircle,
};

const statusColors = {
  success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

export function DataTable({ data, className }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique values for filters
  const uniqueStatuses = Array.from(new Set(data.map(t => t.status)));
  const uniqueTypes = Array.from(new Set(data.map(t => t.type)));

  // Filter and sort data
  const filteredData = data.filter(transaction => {
    const matchesSearch = searchQuery === "" || 
      transaction.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.sourceCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    // Handle date sorting
    if (sortField === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Handle string sorting
    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const formatDuration = (duration?: number | null) => {
    if (!duration) return "--";
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '--';
    return new Date(date).toLocaleString();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {uniqueStatuses.map(status => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted" style={{backgroundColor: 'hsl(var(--muted) / 0.5)'}}>
              <TableHead className="w-48">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort("transactionId")}
                  className="font-medium p-0 h-auto"
                >
                  Transaction ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort("type")}
                  className="font-medium p-0 h-auto"
                >
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort("status")}
                  className="font-medium p-0 h-auto"
                >
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort("createdAt")}
                  className="font-medium p-0 h-auto"
                >
                  Timestamp
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort("duration")}
                  className="font-medium p-0 h-auto"
                >
                  Duration
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {filteredData.length === 0 && data.length > 0 ? (
                      <>
                        <Filter className="w-8 h-8 mx-auto mb-2" />
                        <p>No transactions match your filters</p>
                        <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                      </>
                    ) : (
                      <>
                        <Clock className="w-8 h-8 mx-auto mb-2" />
                        <p>No transactions available</p>
                        <p className="text-sm mt-1">Transactions will appear here once data is available</p>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((transaction) => {
                const StatusIcon = statusIcons[transaction.status as keyof typeof statusIcons] || AlertCircle;
                const statusColorClass = statusColors[transaction.status as keyof typeof statusColors] || statusColors.error;
                
                return (
                  <TableRow key={transaction.id} className="hover:bg-muted">
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="truncate">{transaction.transactionId}</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.sourceCode}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {transaction.type.replace(/-/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColorClass} flex items-center space-x-1 w-fit`}>
                        <StatusIcon className={`w-3 h-3 ${transaction.status === 'processing' ? 'animate-spin' : ''}`} />
                        <span className="capitalize">{transaction.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDuration(transaction.duration)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} transactions
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
