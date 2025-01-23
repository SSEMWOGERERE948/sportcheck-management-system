"use client";

import { useState } from "react";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function SalesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // Dummy data for demonstration
  const sales = [
    {
      id: "1",
      date: "2024-03-20",
      product: "Manchester United Jersey",
      company: "vargo",
      quantity: 2,
      amount: 120000,
      customer: "John Doe",
      employee: "Jane Smith",
      isPending: true,
    },
    {
      id: "2",
      date: "2024-03-20",
      product: "Rugby Ball",
      company: "sportcheck",
      quantity: 5,
      amount: 250000,
      customer: "Mike Johnson",
      employee: "Jane Smith",
      isPending: false,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <MainNav />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sales</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record New Sale</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="company">Company</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vargo">Vargo Sports</SelectItem>
                      <SelectItem value="sportcheck">Sportcheck Uganda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product">Product</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jersey">Football Jersey</SelectItem>
                      <SelectItem value="ball">Rugby Ball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" min="1" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" min="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input id="customer" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="pending" />
                  <Label htmlFor="pending">Mark as Pending Payment</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit">Save Sale</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex justify-between items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="pending-filter"
              checked={showPendingOnly}
              onCheckedChange={setShowPendingOnly}
            />
            <Label htmlFor="pending-filter">Show Pending Only</Label>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales
                .filter(
                  (sale) =>
                    (!showPendingOnly || sale.isPending) &&
                    (sale.product
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                      sale.customer
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()))
                )
                .map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{sale.product}</TableCell>
                    <TableCell className="capitalize">{sale.company}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{sale.amount.toLocaleString()}</TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell>{sale.employee}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sale.isPending
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {sale.isPending ? "Pending" : "Paid"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}