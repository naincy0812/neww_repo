
import { useState, useEffect } from 'react';
import { Customer } from '../components/customers/CustomerCard';
import {
  listCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} from '../services/customerService';

export interface UseCustomersResult {
  customers: Customer[];
  isLoading: boolean;
  error: Error | null;
}

export const useCustomers = (): UseCustomersResult => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await listCustomers();
        setCustomers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch customers'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return { customers, isLoading, error };
};