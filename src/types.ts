export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

export interface Account {
  accountNumber: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  accountType: 'Savings' | 'Current';
  balance: number;
  openingDate: string;
  transactions: Transaction[];
}

export interface BankStats {
  totalCustomers: number;
  totalBalance: number;
}
