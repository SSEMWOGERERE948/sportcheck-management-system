import { db } from "./firebase"
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from "firebase/firestore"

export interface InventoryItem {
  id?: string
  name: string
  category: string
  company: string
  stock: number
  minStock: number
  price: number
  lastRestocked: string
}

export async function getInventory(): Promise<InventoryItem[]> {
  const inventoryRef = collection(db, "inventory")
  const snapshot = await getDocs(inventoryRef)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as InventoryItem)
}

export async function addInventoryItem(item: Omit<InventoryItem, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, "inventory"), item)
  return docRef.id
}

export async function updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<void> {
  const docRef = doc(db, "inventory", id)
  await updateDoc(docRef, item)
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const docRef = doc(db, "inventory", id)
  await deleteDoc(docRef)
}

export async function getCategories(): Promise<{ id: string; name: string; company: string }[]> {
  const categoriesRef = collection(db, "categories")
  const snapshot = await getDocs(categoriesRef)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as { name: string; company: string }) }))
}

