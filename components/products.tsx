import { addDoc, collection, getDocs, serverTimestamp, deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Product {
    id: string;
    name: string;
    company: string;
    category: string;
    stock: number;
    minStock: number;
    price: number;
    lastRestocked: string;
    createdAt: string;
    status?: string;
  }

export const addProduct = async (productData: Omit<Product, 'id' | 'status'>) => {
  try {
    // Validate input
    if (!productData.name.trim() || !productData.company || !productData.category) {
      throw new Error("Please fill in all product details");
    }

    // Determine stock status
    const status = productData.stock < productData.minStock ? "Low Stock" : "In Stock";

    // Create a new product document in the 'products' collection
    const productRef = await addDoc(collection(db, "products"), {
      ...productData,
      lastRestocked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status
    });

    // Return the newly created product with its ID
    return {
      id: productRef.id,
      ...productData,
      lastRestocked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status
    };
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsCollection = collection(db, "products");
    const productsSnapshot = await getDocs(productsCollection);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const productRef = doc(db, "products", productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getProductsByCompany = async (companyCode: string): Promise<Product[]> => {
  try {
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, where("company", "==", companyCode));
    const productsSnapshot = await getDocs(q);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error("Error fetching products by company:", error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const productsCollection = collection(db, "products");
    const q = query(productsCollection, where("category", "==", categoryId));
    const productsSnapshot = await getDocs(q);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};