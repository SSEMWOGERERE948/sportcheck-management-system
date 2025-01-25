import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';

export interface Category {
  id: string;
  name: string;
  company: string; // Changed from "sportcheck" | "vargo" to string
  createdAt: Date;
}

export const addCategory = async (name: string, company: string) => {
  try {
    const categoriesRef = collection(db, 'categories');
    
    // Check if category already exists
    const q = query(categoriesRef, where('name', '==', name));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Category already exists');
    }

    const newCategory = {
      name,
      company,
      createdAt: new Date(),
    };

    const docRef = await addDoc(categoriesRef, newCategory);
    return { id: docRef.id, ...newCategory };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const getCategories = async (company?: string): Promise<Category[]> => {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = company ? query(categoriesRef, where('company', '==', company)) : categoriesRef;
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as Category[];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  };
  

export const deleteCategory = async (categoryId: string) => {
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};