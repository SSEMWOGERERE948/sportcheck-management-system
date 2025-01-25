"use client";

import { useEffect, useState } from "react";
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
  Building2,
  Trash2,
  Edit,
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
import { 
  addProduct, 
  getProducts, 
  deleteProduct, 
  updateProductStock, 
  type Product 
} from "@/components/products";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const PRODUCT_CACHE_KEY = "productCache";

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Company state
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyCode, setNewCompanyCode] = useState("");
  const [isAddingCompany, setIsAddingCompany] = useState(false);

  // Category state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Product state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCompany, setNewProductCompany] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductStock, setNewProductStock] = useState(0);
  const [newProductMinStock, setNewProductMinStock] = useState(0);
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [hasSizes, setHasSizes] = useState(false);
  const [productColor, setProductColor] = useState("");
  const [colorsStock, setColorsStock] = useState<{ [color: string]: number }>({});
  const [newColor, setNewColor] = useState<string>(""); // Temporary color name
const [newColorStock, setNewColorStock] = useState<number>(0); // Temporary stock for the color
const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
const [restockQuantities, setRestockQuantities] = useState<{ [key: string]: number }>({});
const [isRestocking, setIsRestocking] = useState(false);

  const [sizesStock, setSizesStock] = useState<{ [key: string]: number }>(
    SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {})
  );

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

  useEffect(() => {
    const fetchFilteredCategories = async () => {
      try {
        if (newProductCompany) {
          const filteredCategories = await getCategories(newProductCompany);
          setCategories(filteredCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        toast.error("Failed to fetch categories");
      }
    };
    
    fetchFilteredCategories();
  }, [newProductCompany]);
  

  // Company handlers
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

  // Category handlers
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

  // Product handlers
  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newProductCompany || !newProductCategory) {
      toast.error("Please fill in all product details");
      return;
    }
  
    setIsAddingProduct(true);
    try {
      const clarification = [];
  
      if (hasSizes) {
        // Add size-based clarification
        clarification.push(
          ...SIZES.filter((size) => sizesStock[size] > 0).map((size) => ({
            identifier: size,
            quantity: sizesStock[size],
          }))
        );
      }
  
      if (Object.keys(colorsStock).length > 0) {
        // Add color-based clarification
        clarification.push(
          ...Object.keys(colorsStock).map((color) => ({
            identifier: color,
            quantity: colorsStock[color],
          }))
        );
      }
  
      const totalStock = clarification.reduce((total, item) => total + item.quantity, 0);
  
      const newProduct = await addProduct({
        name: newProductName.trim(),
        company: newProductCompany,
        category: newProductCategory,
        stock: totalStock,
        minStock: newProductMinStock,
        price: newProductPrice,
        lastRestocked: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        clarification,
      });
  
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(updatedProducts));
      toast.success("Product added successfully");
  
      // Reset form fields
      setNewProductName("");
      setNewProductCompany("");
      setNewProductCategory("");
      setNewProductStock(0);
      setNewProductMinStock(0);
      setNewProductPrice(0);
      setHasSizes(false);
      setSizesStock(SIZES.reduce((acc, size) => ({ ...acc, [size]: 0 }), {}));
      setColorsStock({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add product");
    } finally {
      setIsAddingProduct(false);
    }
  };
  

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      const updatedProducts = products.filter(product => product.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(updatedProducts));
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleRestock = async (productId: string, quantities: { [key: string]: number }) => {
    try {
      // Step 1: Fetch the product from Firestore
      const productRef = doc(db, "products", productId);
      const productSnapshot = await getDoc(productRef);
  
      if (!productSnapshot.exists()) {
        throw new Error("Product not found");
      }
  
      const productData = productSnapshot.data();
      const currentClarification = productData.clarification || [];
      const currentStock = productData.stock || 0;
  
      // Step 2: Update clarification (sizes/colors) and calculate total stock
      const updatedClarification = currentClarification.map((entry: { identifier: string; quantity: number }) => {
        const additionalStock = quantities[entry.identifier] || 0;
        return {
          ...entry,
          quantity: entry.quantity + additionalStock, // Increment stock for specific size/color
        };
      });
  
      const newTotalStock = updatedClarification.reduce(
        (total: number, entry: { quantity: number }) => total + entry.quantity,
        0
      );
  
      // Step 3: Update the product in Firestore
      await updateDoc(productRef, {
        clarification: updatedClarification,
        stock: newTotalStock,
      });
  
      // Step 4: Update the local state
      const updatedProducts = products.map((product) =>
        product.id === productId
          ? { ...product, clarification: updatedClarification, stock: newTotalStock }
          : product
      );
  
      setProducts(updatedProducts); // Update local state
      localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(updatedProducts)); // Sync with localStorage
  
      toast.success("Product restocked successfully");
    } catch (error) {
      console.error("Error restocking product:", error);
      toast.error("Failed to restock product");
    }
  };
  
  

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

// utils/formatDate.ts
 const formatFirestoreTimestamp = (
  timestamp: { seconds: number; nanoseconds: number } | string | null
): string => {
  if (!timestamp) return "N/A";

  if (typeof timestamp === "string") {
    // Assume the string is already an ISO date string
    return new Date(timestamp).toLocaleString();
  }

  if ("seconds" in timestamp) {
    // Firestore Timestamp object
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }

  return "Invalid Date";
};



  return (
    <div className="flex min-h-screen flex-col">
    <main className="flex-1 container py-6">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <div className="flex flex-wrap sm:flex-nowrap sm:space-x-2 space-y-2 sm:space-y-0">
          <Dialog>
              <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
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
              <Button variant="outline" className="w-full sm:w-auto">
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

            <Dialog open={!!restockingProduct} onOpenChange={() => setRestockingProduct(null)}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Restock Product</DialogTitle>
    </DialogHeader>

    {restockingProduct && (
      <div className="space-y-4">
        {/* Product Name */}
        <p className="font-medium text-gray-700">
          Restocking: <span className="text-gray-900">{restockingProduct.name}</span>
        </p>

        {/* Sizes or Colors */}
        <div className="space-y-2">
          {restockingProduct.clarification?.map(({ identifier, quantity }) => (
            <div key={identifier} className="flex items-center space-x-4">
              <Label className="flex-1">{identifier} (Current: {quantity})</Label>
              <Input
                type="number"
                min="0"
                value={restockQuantities[identifier] || 0}
                onChange={(e) =>
                  setRestockQuantities((prev) => ({
                    ...prev,
                    [identifier]: Number(e.target.value),
                  }))
                }
                placeholder="Enter restock quantity"
              />
            </div>
          )) || (
            <p className="text-sm text-gray-500">This product has no sizes or colors.</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            onClick={async () => {
              setIsRestocking(true);
              await handleRestock(restockingProduct.id, restockQuantities);
              setIsRestocking(false);
              setRestockingProduct(null); // Close dialog
            }}
            disabled={isRestocking}
          >
            {isRestocking ? "Restocking..." : "Confirm Restock"}
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>


            <Dialog>
  <DialogTrigger asChild>
  <Button variant="outline" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
      Add Product
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[600px] max-h-screen overflow-y-auto">
        <DialogHeader>
      <DialogTitle>Add New Product</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Company and Category Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Company</Label>
          <Select value={newProductCompany} onValueChange={setNewProductCompany}>
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
  <Select value={newProductCategory} onValueChange={setNewProductCategory}>
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

      </div>

      {/* Product Name */}
      <div className="grid gap-2">
        <Label>Product Name</Label>
        <Input
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
          placeholder="Enter product name"
        />
      </div>

      {/* Classification by Size or Multiple Colors */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="hasSizes"
          checked={hasSizes}
          onChange={(e) => setHasSizes(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="hasSizes">Classify by Size</Label>
      </div>

      {hasSizes ? (
        <div className="grid gap-4">
          <Label>Stock by Size</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {SIZES.map((size) => (
              <div key={size} className="space-y-2">
                <Label>{size}</Label>
                <Input
                  type="number"
                  value={sizesStock[size]}
                  onChange={(e) =>
                    setSizesStock((prev) => ({
                      ...prev,
                      [size]: Number(e.target.value),
                    }))
                  }
                  min="0"
                  placeholder={`Stock for ${size}`}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          <Label>Colors and Stock</Label>
          <div className="grid gap-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Enter stock"
                value={newColorStock}
                onChange={(e) => setNewColorStock(Number(e.target.value))}
              />
              <Button
                onClick={() => {
                  if (newColor && newColorStock > 0) {
                    setColorsStock((prev) => ({
                      ...prev,
                      [newColor]: newColorStock,
                    }));
                    setNewColor("");
                    setNewColorStock(0);
                  } else {
                    toast.error("Please enter a valid color and stock.");
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div>
              {Object.keys(colorsStock).length > 0 && (
                <ul className="list-disc pl-6">
                  {Object.keys(colorsStock).map((color) => (
                    <li key={color} className="flex justify-between items-center">
                      <span>
                        {color}: {colorsStock[color]} units
                      </span>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          setColorsStock((prev) => {
                            const updated = { ...prev };
                            delete updated[color];
                            return updated;
                          })
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minimum Stock and Price */}
      <div className="grid grid-cols-2 gap-4">
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
    </div>

    {/* Submit Button */}
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
          {/* Table for larger screens */}
          <div className="hidden lg:block border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Stock Details</TableHead>
                  <TableHead>Total Stock</TableHead>
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
                      {Array.isArray(item.clarification) && item.clarification.length > 0 ? (
                        <div className="space-y-2">
                          {item.clarification.map(({ identifier, quantity }) => (
                            <span
                              key={identifier}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                            >
                              {identifier}: {quantity}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span>General: {item.stock}</span>
                      )}
                    </TableCell>
                    <TableCell>{item.stock}</TableCell>
                    <TableCell>{item.price.toLocaleString()}</TableCell>
                    <TableCell>{formatFirestoreTimestamp(item.lastRestocked)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.stock < item.minStock ? "destructive" : "default"}
                      >
                        {item.stock < item.minStock ? "Low Stock" : "In Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRestockingProduct(item);
                            setRestockQuantities(
                              item.clarification?.reduce(
                                (acc, { identifier }) => ({ ...acc, [identifier]: 0 }),
                                {}
                              ) || {}
                            );
                          }}
                        >
                          Restock
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteProduct(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Card layout for small screens */}
          <div className="block lg:hidden">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 mb-4 shadow-md space-y-4"
              >
                <div>
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Company:</span> {item.company}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Total Stock:</span> {item.stock}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Price:</span> UGX {item.price.toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Last Restocked:</span>{" "}
                    {formatFirestoreTimestamp(item.lastRestocked)}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    <Badge variant={item.stock < item.minStock ? "destructive" : "default"}>
                      {item.stock < item.minStock ? "Low Stock" : "In Stock"}
                    </Badge>
                  </p>
                </div>
                <div className="flex justify-between space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRestockingProduct(item);
                      setRestockQuantities(
                        item.clarification?.reduce(
                          (acc, { identifier }) => ({ ...acc, [identifier]: 0 }),
                          {}
                        ) || {}
                      );
                    }}
                  >
                    Restock
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteProduct(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


