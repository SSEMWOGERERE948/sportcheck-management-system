import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

export interface Company {
  id: string;
  name: string;
  code: string;
  createdAt: Date;
}

export const addCompany = async (name: string, code: string) => {
  try {
    const companiesRef = collection(db, 'companies');
    
    // Check if company already exists
    const q = query(companiesRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Company code already exists');
    }

    const newCompany = {
      name,
      code,
      createdAt: new Date(),
    };

    const docRef = await addDoc(companiesRef, newCompany);
    return { id: docRef.id, ...newCompany };
  } catch (error) {
    console.error('Error adding company:', error);
    throw error;
  }
};

export const getCompanies = async (): Promise<Company[]> => {
  try {
    const companiesRef = collection(db, 'companies');
    const querySnapshot = await getDocs(companiesRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Company[];
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

export const deleteCompany = async (companyId: string) => {
  try {
    await deleteDoc(doc(db, 'companies', companyId));
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};