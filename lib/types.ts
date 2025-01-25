export type UserRole = 'admin' | 'employee';

export type Company = string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: Company;
  createdAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  amount: number;
  employeeId: string;
  customerId?: string;
  isPending: boolean;
  createdAt: Date;
}

interface Product {
  id: string;
  name: string;
  category: string;
  company: string;
  stock: number;
  minStock: number;
  price: number;
  lastRestocked: string;
  createdAt: string;
  status?: string;
  clarification?: {
    identifier: string;  // either color or size
    quantity: number;
  }[];
}


export interface Stock {
  id: string;
  productId: string;
  quantity: number;
  receivedBy: string;
  verifiedBy?: string;
  status: 'pending' | 'verified' | 'disputed';
  createdAt: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  company: Company;
  category: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  pendingAmount: number;
  createdAt: Date;
}