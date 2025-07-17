import axios from 'axios';
import { Customer } from '../components/customers/CustomerCard';

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

// Helper – Beanie/FastAPI returns `_id`; normalise so the rest of the app can rely on `id`.
const normaliseCustomer = (data: any): Customer => ({
  ...data,
  id: data.id ?? data._id,
  location: {
    address: data.location?.address || "",
    city: data.location?.city || "",
    state: data.location?.state || "",
    zipCode: data.location?.zipCode || "",
    country: data.location?.country || "",
  },
});

export const listCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await api.get('/api/customers');
    return response.data.map(normaliseCustomer);
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

export const createCustomer = async (customerData: Partial<Customer>) => {
  try {
    const response = await api.post('/api/customers', customerData);
    return normaliseCustomer(response.data);
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const getCustomer = async (id: string) => {
  try {
    const response = await api.get(`/api/customers/${id}`);
    return normaliseCustomer(response.data);
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id: string, customerData: Partial<Customer>) => {
  try {
    const response = await api.put(`/api/customers/${id}`, customerData);
    return normaliseCustomer(response.data);
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    const response = await api.delete(`/api/customers/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('Error deleting customer, response data:', error.response.data);
    } else {
      console.error('Error deleting customer, message:', error.message);
    }
    throw error;
  }
};

export const searchCustomers = async (params: Record<string, any>) => {
  try {
    const response = await api.get('/api/customers/search', { params });
    return response.data.map(normaliseCustomer);
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
};

export const autocompleteCustomerNames = async (prefix: string): Promise<string[]> => {
  if (!prefix) return [];
  try {
    const response = await api.get('/api/customers/autocomplete/names', { params: { prefix } });
    return response.data;
  } catch (error) {
    console.error('Error fetching name suggestions:', error);
    return [];
  }
};
