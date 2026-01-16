import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Navigate } from 'react-router-dom';
import ProductForm from '../entity/product/ProductForm';
import ProductStats from './ProductStats';
import ProductTableToolbar from './ProductTableToolbar';
import ProductFilterPanel, { ProductFilters } from './ProductFilterPanel';
import BulkActionBar from './BulkActionBar';
import ProductTableRow from './ProductTableRow';
import axios from 'axios';
import { api } from '../../api/config';
import { useQuery, useQueryClient } from 'react-query';

interface Supplier {
  supplierId: number;
  name: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface Product {
  productId: number;
  supplierId: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  unit: string;
  imgName: string;
  stockLevel: number;
  createdAt: string;
  updatedAt: string;
  lastStockUpdate: string;
  supplier?: Supplier;
  discount?: number;
}

type SortField = 'name' | 'price' | 'sku' | 'stockLevel' | 'supplier';
type SortOrder = 'asc' | 'desc';


const fetchProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${api.baseURL}${api.endpoints.products}`);
  return response.data;
};

const fetchSuppliers = async (): Promise<Supplier[]> => {
  const response = await axios.get(`${api.baseURL}${api.endpoints.suppliers}`);
  return response.data;
};

export default function AdminProducts() {
  const { isAdmin } = useAuth();
  const { darkMode } = useTheme();
  const queryClient = useQueryClient();

  // Data fetching
  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery('products', fetchProducts);
  const { data: suppliers = [] } = useQuery('suppliers', fetchSuppliers);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [filters, setFilters] = useState<ProductFilters>({
    status: [],
    priceRange: [0, 1000],
    stockRange: [0, 200],
    suppliers: [],
    dateRange: ['', ''],
    onlyDiscounted: false
  });

  // Selection
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    sku: true,
    price: true,
    stock: true,
    status: true,
    supplier: true,
    discount: true
  });

  // Load preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('adminProductsPreferences');
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences);
      if (prefs.visibleColumns) setVisibleColumns(prefs.visibleColumns);
      if (prefs.itemsPerPage) setItemsPerPage(prefs.itemsPerPage);
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('adminProductsPreferences', JSON.stringify({
      visibleColumns,
      itemsPerPage
    }));
  }, [visibleColumns, itemsPerPage]);

  // Show toast notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // Get supplier name helper
  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    return supplier?.name || 'Unknown';
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(p => {
        if (filters.status.includes('Out of Stock')) return p.stockLevel === 0;
        if (filters.status.includes('Low Stock')) return p.stockLevel > 0 && p.stockLevel <= 10;
        if (filters.status.includes('In Stock')) return p.stockLevel > 10;
        return false;
      });
    }

    // Price range filter
    filtered = filtered.filter(p =>
      p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Stock range filter
    filtered = filtered.filter(p =>
      p.stockLevel >= filters.stockRange[0] && p.stockLevel <= filters.stockRange[1]
    );

    // Supplier filter
    if (filters.suppliers.length > 0) {
      filtered = filtered.filter(p => filters.suppliers.includes(p.supplierId));
    }

    // Discount filter
    if (filters.onlyDiscounted) {
      filtered = filtered.filter(p => p.discount && p.discount > 0);
    }

    // Sort
    filtered.sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'price' || sortField === 'stockLevel') {
        return (a[sortField] - b[sortField]) * modifier;
      }
      if (sortField === 'supplier') {
        const supplierA = suppliers.find(s => s.supplierId === a.supplierId);
        const supplierB = suppliers.find(s => s.supplierId === b.supplierId);
        return (supplierA?.name || '').localeCompare(supplierB?.name || '') * modifier;
      }
      return a[sortField].localeCompare(b[sortField]) * modifier;
    });

    return filtered;
  }, [products, searchTerm, filters, sortField, sortOrder, suppliers]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection handlers
  const handleSelectProduct = (productId: number) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      const allIds = new Set(filteredAndSortedProducts.map(p => p.productId));
      setSelectedProducts(allIds);
      setSelectAll(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts(new Set());
    setSelectAll(false);
  };

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export handlers
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const response = await axios.get(`${api.baseURL}${api.endpoints.products}/export`, {
        params: { format },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showNotification(`Products exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Failed to export products', 'error');
    }
  };

  const handleExportSelected = (format: 'csv' | 'json') => {
    const selected = products.filter(p => selectedProducts.has(p.productId));
    const dataStr = format === 'json'
      ? JSON.stringify(selected, null, 2)
      : convertToCSV(selected);
    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `selected-products.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotification(`${selectedProducts.size} products exported as ${format.toUpperCase()}`, 'success');
  };

  const convertToCSV = (data: Product[]) => {
    const headers = ['productId', 'name', 'description', 'price', 'sku', 'unit', 'stockLevel', 'supplierId', 'discount', 'createdAt', 'updatedAt'];
    const rows = data.map(p => headers.map(h => {
      const value = p[h as keyof Product];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(','));
    return [headers.join(','), ...rows].join('\n');
  };

  // Bulk operations
  const handleBulkEdit = () => {
    if (selectedProducts.size > 0) {
      // For now, show alert - bulk edit form can be enhanced later
      alert(`Bulk edit for ${selectedProducts.size} products - feature coming soon`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) return;

    try {
      await axios.delete(`${api.baseURL}${api.endpoints.products}/bulk-delete`, {
        data: { productIds: Array.from(selectedProducts) }
      });
      await refetchProducts();
      handleClearSelection();
      showNotification(`${selectedProducts.size} products deleted`, 'success');
    } catch (error) {
      console.error('Bulk delete error:', error);
      showNotification('Failed to delete products', 'error');
    }
  };

  const handleBulkUpdateStock = async () => {
    const stockLevel = prompt('Enter new stock level for selected products:');
    if (!stockLevel) return;

    try {
      await axios.post(`${api.baseURL}${api.endpoints.products}/bulk-update`, {
        productIds: Array.from(selectedProducts),
        updates: { stockLevel: parseInt(stockLevel) }
      });
      await refetchProducts();
      showNotification(`Stock updated for ${selectedProducts.size} products`, 'success');
    } catch (error) {
      console.error('Bulk update error:', error);
      showNotification('Failed to update stock', 'error');
    }
  };

  const handleBulkDiscount = async () => {
    const discount = prompt('Enter discount percentage (0-100):');
    if (!discount) return;
    const discountValue = parseFloat(discount) / 100;
    if (isNaN(discountValue) || discountValue < 0 || discountValue > 1) {
      showNotification('Invalid discount value', 'error');
      return;
    }

    try {
      await axios.post(`${api.baseURL}${api.endpoints.products}/bulk-update`, {
        productIds: Array.from(selectedProducts),
        updates: { discount: discountValue }
      });
      await refetchProducts();
      showNotification(`Discount applied to ${selectedProducts.size} products`, 'success');
    } catch (error) {
      console.error('Bulk discount error:', error);
      showNotification('Failed to apply discount', 'error');
    }
  };

  // Inline update handler
  const handleInlineUpdate = async (productId: number, field: string, value: string | number) => {
    try {
      const product = products.find(p => p.productId === productId);
      if (!product) return;

      await axios.put(`${api.baseURL}${api.endpoints.products}/${productId}`, {
        ...product,
        [field]: value,
        updatedAt: new Date().toISOString(),
        lastStockUpdate: field === 'stockLevel' ? new Date().toISOString() : product.lastStockUpdate
      });
      await refetchProducts();
      queryClient.invalidateQueries('productStats');
      showNotification('Product updated', 'success');
    } catch (error) {
      console.error('Inline update error:', error);
      showNotification('Failed to update product', 'error');
    }
  };

  // Product CRUD handlers
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${api.baseURL}${api.endpoints.products}/${productId}`);
      await refetchProducts();
      queryClient.invalidateQueries('productStats');
      showNotification('Product deleted', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Failed to delete product', 'error');
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const newProduct: Partial<Product> = {
        ...product,
        productId: Math.max(...products.map(p => p.productId)) + 1,
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-COPY`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastStockUpdate: new Date().toISOString()
      };
      await axios.post(`${api.baseURL}${api.endpoints.products}`, newProduct);
      await refetchProducts();
      showNotification('Product duplicated', 'success');
    } catch (error) {
      console.error('Duplicate error:', error);
      showNotification('Failed to duplicate product', 'error');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(undefined);
  };

  const handleFormSave = async () => {
    await refetchProducts();
    queryClient.invalidateQueries('productStats');
    handleFormClose();
    showNotification(editingProduct ? 'Product updated' : 'Product created', 'success');
  };

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-24 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-2`}>
            Product Management
          </h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your product catalog with advanced tools
          </p>
        </div>

        {/* Stats Dashboard */}
        <ProductStats />

        {/* Toolbar */}
        <ProductTableToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExport={handleExport}
          onImport={() => alert('Import functionality coming soon')}
          onNewProduct={() => {
            setEditingProduct(undefined);
            setShowForm(true);
          }}
          onColumnSettings={() => setShowColumnSettings(!showColumnSettings)}
        />

        {/* Filter Panel */}
        <ProductFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          suppliers={suppliers}
          show={showFilters}
        />

        {/* Products Table */}
        {productsLoading ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-8`}>
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        ) : (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
            {/* Table Header with Select All */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </th>
                    {visibleColumns.id && (
                      <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                        ID
                      </th>
                    )}
                    {visibleColumns.name && (
                      <th
                        className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:text-primary`}
                        onClick={() => handleSort('name')}
                      >
                        Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    )}
                    {visibleColumns.sku && (
                      <th
                        className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:text-primary`}
                        onClick={() => handleSort('sku')}
                      >
                        SKU {sortField === 'sku' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    )}
                    {visibleColumns.price && (
                      <th
                        className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:text-primary`}
                        onClick={() => handleSort('price')}
                      >
                        Price {sortField === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    )}
                    {visibleColumns.stock && (
                      <th
                        className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:text-primary`}
                        onClick={() => handleSort('stockLevel')}
                      >
                        Stock {sortField === 'stockLevel' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    )}
                    {visibleColumns.status && (
                      <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                        Status
                      </th>
                    )}
                    {visibleColumns.supplier && (
                      <th
                        className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider cursor-pointer hover:text-primary`}
                        onClick={() => handleSort('supplier')}
                      >
                        Supplier {sortField === 'supplier' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    )}
                    {visibleColumns.discount && (
                      <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                        Discount
                      </th>
                    )}
                    <th className={`px-4 py-3 text-left text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {paginatedProducts.map(product => (
                    <ProductTableRow
                      key={product.productId}
                      product={product}
                      selected={selectedProducts.has(product.productId)}
                      onSelect={handleSelectProduct}
                      onEdit={handleEditProduct}
                      onDelete={handleDeleteProduct}
                      onDuplicate={handleDuplicateProduct}
                      onInlineUpdate={handleInlineUpdate}
                      supplierName={getSupplierName(product.supplierId)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredAndSortedProducts.length > 0 && (
              <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} results
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1 text-sm ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} rounded border`}
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Previous
                  </button>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No products found matching your criteria
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bulk Action Bar */}
        <BulkActionBar
          selectedCount={selectedProducts.size}
          onClearSelection={handleClearSelection}
          onBulkEdit={handleBulkEdit}
          onBulkDelete={handleBulkDelete}
          onBulkUpdateStock={handleBulkUpdateStock}
          onBulkDiscount={handleBulkDiscount}
          onExportSelected={handleExportSelected}
        />

        {/* Product Form Modal */}
        {showForm && (
          <ProductForm
            product={editingProduct}
            suppliers={suppliers}
            onClose={handleFormClose}
            onSave={handleFormSave}
          />
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className={`fixed bottom-20 right-4 px-6 py-4 rounded-lg shadow-lg ${
            showToast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white z-50 animate-slide-up`}>
            {showToast.message}
          </div>
        )}

        {/* Column Settings Modal */}
        {showColumnSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowColumnSettings(false)}>
            <div
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full shadow-xl`}
              onClick={e => e.stopPropagation()}
            >
              <h3 className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}>
                Column Settings
              </h3>
              <div className="space-y-2">
                {Object.entries(visibleColumns).map(([key, value]) => (
                  <label key={key} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} capitalize`}>
                      {key}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowColumnSettings(false)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}