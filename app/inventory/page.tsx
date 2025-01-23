"use client";

import { useEffect, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  ArrowLeftRight,
  Building2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  addCategory,
  getCategories,
  deleteCategory,
  type Category,
} from "@/components/categories";
import {
  addCompany,
  getCompanies,
  deleteCompany,
  type Company,
} from "@/components/companies";
import { toast } from "sonner";
import { addProduct, getProducts } from "@/components/products";

interface Product {
  id: string;
  name: string;
  category: string;
  company: string;
  stock: number;
  minStock: number;
  price: number;
  lastRestocked: string;
}

const PRODUCT_CACHE_KEY = "productCache";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCompany, setNewProductCompany] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductStock, setNewProductStock] = useState(0);
  const [newProductMinStock, setNewProductMinStock] = useState(0);
  const [newProductPrice, setNewProductPrice] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedCategories, fetchedCompanies] = await Promise.all([
          getCategories(),
          getCompanies(),
        ]);
        setCategories(fetchedCategories);
        setCompanies(fetchedCompanies);
      } catch (error) {
        toast.error("Failed to load data");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      const cachedProducts = localStorage.getItem(PRODUCT_CACHE_KEY);
      if (cachedProducts) {
        setProducts(JSON.parse(cachedProducts));
      } else {
        try {
          const fetchedProducts = await getProducts();
          setProducts(fetchedProducts);
          localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(fetchedProducts));
        } catch (error) {
          toast.error("Failed to fetch products");
        }
      }
    };
    loadProducts();
  }, []);

  const handleAddCompany = async () => {
    if (!newCompanyName.trim() || !newCompanyCode.trim()) {
      toast.error("Company name and code are required");
      return;
    }

    setIsAddingCompany(true);
    try {
      await addCompany(newCompanyName.trim(), newCompanyCode.trim());
      const updatedCompanies = await getCompanies();
      setCompanies(updatedCompanies);
      toast.success("Company added successfully");
      setNewCompanyName("");
      setNewCompanyCode("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add company");
    } finally {
      setIsAddingCompany(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      await deleteCompany(companyId);
      const updatedCompanies = await getCompanies();
      setCompanies(updatedCompanies);
      toast.success("Company deleted successfully");
    } catch (error) {
      toast.error("Failed to delete company");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !selectedCompany) {
      toast.error("Category name and company are required");
      return;
    }

    setIsAddingCategory(true);
    try {
      await addCategory(newCategoryName.trim(), selectedCompany);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      toast.success("Category added successfully");
      setNewCategoryName("");
      setSelectedCompany("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newProductCompany || !newProductCategory) {
      toast.error("Please fill in all product details");
      return;
    }

    setIsAddingProduct(true);
    try {
      const newProduct = await addProduct({
        name: newProductName.trim(),
        company: newProductCompany,
        category: newProductCategory,
        stock: newProductStock,
        minStock: newProductMinStock,
        price: newProductPrice,
        lastRestocked: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(updatedProducts));
      toast.success("Product added successfully");

      setNewProductName("");
      setNewProductCompany("");
      setNewProductCategory("");
      setNewProductStock(0);
      setNewProductMinStock(0);
      setNewProductPrice(0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setIsAddingProduct(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Add Company
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Company</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Enter company name"
                      value={newCompanyName}
                      onChange={(e) => setNewCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyCode">Company Code</Label>
                    <Input
                      id="companyCode"
                      placeholder="Enter company code"
                      value={newCompanyCode}
                      onChange={(e) => setNewCompanyCode(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddCompany} disabled={isAddingCompany}>
                    {isAddingCompany ? "Adding..." : "Add Company"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryName">Category Name</Label>
                    <Input
                      id="categoryName"
                      placeholder="Enter category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryCompany">Company</Label>
                    <Select
                      value={selectedCompany}
                      onValueChange={setSelectedCompany}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.code}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddCategory} disabled={isAddingCategory}>
                    {isAddingCategory ? "Adding..." : "Add Category"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Company</Label>
                    <Select
                      value={newProductCompany}
                      onValueChange={setNewProductCompany}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.code}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select
                      value={newProductCategory}
                      onValueChange={setNewProductCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Product Name</Label>
                    <Input
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Initial Stock</Label>
                    <Input
                      type="number"
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(Number(e.target.value))}
                      placeholder="Enter stock quantity"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Minimum Stock</Label>
                    <Input
                      type="number"
                      value={newProductMinStock}
                      onChange={(e) => setNewProductMinStock(Number(e.target.value))}
                      placeholder="Enter minimum stock"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(Number(e.target.value))}
                      placeholder="Enter product price"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleAddProduct} disabled={isAddingProduct}>
                    {isAddingProduct ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            {companies.map((company) => (
              <TabsTrigger key={company.id} value={company.code}>
                {company.name}
              </TabsTrigger>
            ))}
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          </TabsList>

          <div className="flex justify-between items-center space-x-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all" className="mt-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Last Restocked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="capitalize">{item.company}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{item.stock}</span>
                          {item.stock < item.minStock && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.price.toLocaleString()}</TableCell>
                      <TableCell>{item.lastRestocked}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.stock < item.minStock ? "destructive" : "default"}
                        >
                          {item.stock < item.minStock ? "Low Stock" : "In Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Package className="h-4 w-4 mr-2" />
                          Restock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function deleteProduct(productId: string) {
  throw new Error("Function not implemented.");
}
