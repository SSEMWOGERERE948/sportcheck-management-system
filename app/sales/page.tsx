"use client";

import { useState, useEffect } from "react";
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
import { db } from "@/lib/firebase";
import { collection, doc, getDocs, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  stock: number;
  company: string;
  price: number;
}

interface Sale {
  id: string;
  date: string;
  product: string;
  company: string;
  quantity: number;
  amount: number;
  customer: string;
  employee: string;
  isPending: boolean;
  balanceDue?: number;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const [customer, setCustomer] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPendingOnly, setShowPendingOnly] = useState<boolean>(false);

  useEffect(() => {
    const fetchProductsAndSales = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const fetchedProducts = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(fetchedProducts);

        const salesSnapshot = await getDocs(collection(db, "sales"));
        const fetchedSales = salesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Sale[];
        setSales(fetchedSales);

        localStorage.setItem("productsCache", JSON.stringify(fetchedProducts));
        localStorage.setItem("salesCache", JSON.stringify(fetchedSales));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchProductsAndSales();
  }, []);

  const handleAddSale = async () => {
    if (!selectedProduct || quantity < 1 || amount <= 0 || !customer.trim()) {
      toast.error("Please fill all fields correctly");
      return;
    }

    try {
      const productRef = doc(db, "products", selectedProduct);
      const productSnapshot = await getDoc(productRef);

      if (!productSnapshot.exists()) {
        throw new Error("Product not found");
      }

      const productData = productSnapshot.data() as Product;
      const updatedStock = productData.stock - quantity;

      if (updatedStock < 0) {
        toast.error("Insufficient stock");
        return;
      }

      await updateDoc(productRef, { stock: updatedStock });

      const updatedProducts = products.map((product) =>
        product.id === selectedProduct ? { ...product, stock: updatedStock } : product
      );
      setProducts(updatedProducts);
      localStorage.setItem("productsCache", JSON.stringify(updatedProducts));

      const totalPrice = productData.price * quantity;
      const balanceDue = isPending ? totalPrice - amount : 0;

      const newSale: Omit<Sale, "id"> = {
        date: new Date().toISOString().split("T")[0],
        product: productData.name,
        company: productData.company,
        quantity,
        amount,
        customer,
        employee: "Current Employee",
        isPending,
        balanceDue,
      };

      const saleRef = await addDoc(collection(db, "sales"), newSale);
      const addedSale = { ...newSale, id: saleRef.id };

      const updatedSales = [...sales, addedSale];
      setSales(updatedSales);
      localStorage.setItem("salesCache", JSON.stringify(updatedSales));

      toast.success("Sale recorded successfully");

      setSelectedProduct(undefined);
      setQuantity(1);
      setAmount(0);
      setCustomer("");
      setIsPending(false);
    } catch (error) {
      console.error("Error adding sale:", error);
      toast.error("Failed to add sale");
    }
  };

  const handleMarkAsPaid = async (saleId: string) => {
    try {
      const saleRef = doc(db, "sales", saleId);
      await updateDoc(saleRef, { isPending: false, balanceDue: 0 });

      const updatedSales = sales.map((sale) =>
        sale.id === saleId ? { ...sale, isPending: false, balanceDue: 0 } : sale
      );

      setSales(updatedSales);
      localStorage.setItem("salesCache", JSON.stringify(updatedSales));

      toast.success("Payment marked as paid.");
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      toast.error("Failed to mark payment as paid.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
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
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={selectedProduct}
                    onValueChange={(value: string) => setSelectedProduct(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Initial Payment</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Enter initial payment"
                  />
                </div>
                {isPending && (
                  <div className="grid gap-2">
                    <Label htmlFor="balanceDue">Balance Due</Label>
                    <Input
                      id="balanceDue"
                      type="number"
                      readOnly
                      value={
                        (products.find((p) => p.id === selectedProduct)?.price || 0) * quantity -
                        amount
                      }
                      placeholder="Calculated balance due"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="customer">Customer Name</Label>
                  <Input
                    id="customer"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="pending"
                    checked={isPending}
                    onCheckedChange={setIsPending}
                  />
                  <Label htmlFor="pending">Mark as Pending Payment</Label>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddSale}>Save Sale</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-6">
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

 {/* Responsive Layout */}
 <div className="grid grid-cols-1 gap-4 sm:hidden">
          {sales
            .filter(
              (sale) =>
                (!showPendingOnly || sale.isPending) &&
                (sale.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sale.customer.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .map((sale) => (
              <div key={sale.id} className="border rounded-lg p-4 shadow-sm bg-white space-y-2">
                <div className="flex justify-between">
                  <span className="font-bold">Date:</span>
                  <span>{sale.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Product:</span>
                  <span>{sale.product}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Quantity:</span>
                  <span>{sale.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Customer:</span>
                  <span>{sale.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Initial Payment:</span>
                  <span>{sale.amount}</span>
                </div>
                <div className="flex justify-between">
                  <Button
                    size="sm"
                    variant={sale.isPending ? "destructive" : "default"}
                    onClick={() => handleMarkAsPaid(sale.id)}
                  >
                    {sale.isPending ? "Mark as Paid" : "Paid"}
                  </Button>
                </div>
              </div>
            ))}
        </div>

        {/* Original Table */}
        <div className="hidden sm:block overflow-x-auto border rounded-lg">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Initial Payment</TableHead>
                <TableHead>Balance Due</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales
                .filter(
                  (sale) =>
                    (!showPendingOnly || sale.isPending) &&
                    (sale.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((sale: Sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{sale.product}</TableCell>
                    <TableCell className="capitalize">{sale.company}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{`ugx${sale.amount.toLocaleString()}`}</TableCell>
                    <TableCell>
                      {sale.isPending && sale.balanceDue
                        ? `ugx${sale.balanceDue.toLocaleString()}`
                        : "-"}
                    </TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell>{sale.employee}</TableCell>
                    <TableCell>
                      {sale.isPending ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleMarkAsPaid(sale.id)}
                        >
                          Mark as Paid
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-green-500 text-white hover:bg-green-600 cursor-default"
                          disabled
                        >
                          Paid
                        </Button>
                      )}
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
