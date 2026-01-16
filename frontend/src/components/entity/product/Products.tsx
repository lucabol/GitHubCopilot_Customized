import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { api } from '../../../api/config';
import { useTheme } from '../../../context/ThemeContext';

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  imgName: string;
  sku: string;
  unit: string;
  supplierId: number;
  discount?: number;
  stockLevel: number;
  createdAt: string;
}

type SortField = 'name' | 'createdAt' | 'status' | 'price';
type SortDirection = 'asc' | 'desc';

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}`);
  return data;
};

const getStockStatus = (stockLevel: number): 'in-stock' | 'low-stock' | 'out-of-stock' => {
  if (stockLevel === 0) return 'out-of-stock';
  if (stockLevel <= 10) return 'low-stock';
  return 'in-stock';
};

const getStatusColor = (status: string, darkMode: boolean) => {
  switch (status) {
    case 'in-stock':
      return darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800';
    case 'low-stock':
      return darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800';
    case 'out-of-stock':
      return darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800';
    default:
      return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'in-stock': return 'In Stock';
    case 'low-stock': return 'Low Stock';
    case 'out-of-stock': return 'Out of Stock';
    default: return status;
  }
};

const gradientColors = [
  'from-blue-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-green-400 to-teal-500',
  'from-orange-400 to-amber-500',
  'from-indigo-400 to-blue-500',
  'from-cyan-400 to-sky-500',
];

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { data: products, isLoading, error } = useQuery('products', fetchProducts);
  const { darkMode } = useTheme();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close dropdown on Escape
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
        setShowDeleteConfirm(false);
      }
      // Pagination with arrow keys
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
      if (e.key === 'ArrowRight' && filteredProducts && currentPage < Math.ceil(filteredProducts.length / itemsPerPage)) {
        setCurrentPage(prev => prev + 1);
      }
      // Select all with Ctrl+A
      if (e.ctrlKey && e.key === 'a' && filteredProducts) {
        e.preventDefault();
        if (selectedItems.size === filteredProducts.length) {
          setSelectedItems(new Set());
        } else {
          setSelectedItems(new Set(filteredProducts.map(p => p.productId)));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, selectedItems, filteredProducts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    if (openDropdownId !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  // Show toast
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products?.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Sort products
  const sortedProducts = useMemo(() => {
    if (!filteredProducts) return [];
    
    const sorted = [...filteredProducts].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else if (sortField === 'status') {
        aValue = getStockStatus(a.stockLevel);
        bValue = getStockStatus(b.stockLevel);
      } else if (sortField === 'price') {
        aValue = a.discount ? a.price * (1 - a.discount) : a.price;
        bValue = b.discount ? b.price * (1 - b.discount) : b.price;
      } else {
        return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredProducts, sortField, sortDirection]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const totalPages = Math.ceil((sortedProducts?.length || 0) / itemsPerPage);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedItems.size === filteredProducts?.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredProducts?.map(p => p.productId) || []));
    }
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Handle actions
  const handleEdit = (product: Product) => {
    showToastMessage(`Editing ${product.name}`);
    setOpenDropdownId(null);
  };

  const handleDuplicate = (product: Product) => {
    showToastMessage(`Duplicated ${product.name}`);
    setOpenDropdownId(null);
  };

  const handleDelete = (productId: number) => {
    setItemToDelete(productId);
    setShowDeleteConfirm(true);
    setOpenDropdownId(null);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const product = products?.find(p => p.productId === itemToDelete);
      showToastMessage(`Deleted ${product?.name}`);
      setItemToDelete(null);
    }
    setShowDeleteConfirm(false);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
    setOpenDropdownId(null);
  };

  const handleBulkDelete = () => {
    showToastMessage(`Deleted ${selectedItems.size} items`);
    setSelectedItems(new Set());
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <h1 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-light' : 'text-gray-800'}`}>Products</h1>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
            <div className="p-6">
              {/* Loading skeleton */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse mb-4 flex items-center space-x-4">
                  <div className={`h-12 w-12 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  <div className="flex-1 space-y-2">
                    <div className={`h-4 rounded w-1/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-4 rounded w-3/4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500 text-center">Failed to fetch products</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}>Products</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-800 text-light border-gray-700' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
              aria-label="Search products"
            />
            <svg 
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          {/* Bulk Action Bar */}
          {selectedItems.size > 0 && (
            <div className={`${darkMode ? 'bg-primary-dark' : 'bg-primary/10'} rounded-lg p-4 flex justify-between items-center animate-fadeIn transition-all duration-200`}>
              <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedItems(new Set())}
                  className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-white hover:bg-gray-100 text-gray-800'} transition-colors duration-150`}
                >
                  Clear
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-150"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transition-colors duration-300`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredProducts?.length && filteredProducts.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer"
                        aria-label="Select all products"
                      />
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Product
                      </span>
                    </th>
                    <th 
                      className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors duration-150"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Name
                        </span>
                        {sortField === 'name' && (
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors duration-150"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Created At
                        </span>
                        {sortField === 'createdAt' && (
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors duration-150"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Status
                        </span>
                        {sortField === 'status' && (
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left cursor-pointer hover:bg-gray-800/50 transition-colors duration-150"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                          Amount
                        </span>
                        {sortField === 'price' && (
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'} transition-colors duration-300`}>
                  {paginatedProducts?.map((product, index) => {
                    const status = getStockStatus(product.stockLevel);
                    const shouldPulse = status === 'low-stock' || status === 'out-of-stock';
                    const gradientClass = gradientColors[product.productId % gradientColors.length];
                    
                    return (
                      <tr 
                        key={product.productId}
                        className={`transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(product.productId)}
                            onChange={() => handleSelectItem(product.productId)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer"
                            aria-label={`Select ${product.name}`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${gradientClass} p-2 flex items-center justify-center transition-all duration-200`}>
                            <img 
                              src={`/${product.imgName}`} 
                              alt={product.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className={`text-sm font-medium ${darkMode ? 'text-light' : 'text-gray-900'} transition-colors duration-300`}>
                              {product.name}
                            </div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300 line-clamp-1`}>
                              {product.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'} transition-colors duration-300`}>
                            {new Date(product.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(status, darkMode)} transition-all duration-200 ${shouldPulse ? 'animate-pulse' : ''}`}
                          >
                            {getStatusLabel(status)}
                            <span className="ml-2">({product.stockLevel})</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            {product.discount ? (
                              <div>
                                <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} line-through mr-2`}>
                                  ${product.price.toFixed(2)}
                                </span>
                                <span className={`text-sm font-semibold ${darkMode ? 'text-primary' : 'text-primary'}`}>
                                  ${(product.price * (1 - product.discount)).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className={`text-sm font-semibold ${darkMode ? 'text-light' : 'text-gray-900'}`}>
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === product.productId ? null : product.productId);
                            }}
                            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors duration-150`}
                            aria-label="Actions menu"
                          >
                            <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openDropdownId === product.productId && (
                            <div 
                              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 z-50 transform transition-all duration-150 ease-out origin-top-right`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => handleViewDetails(product)}
                                  className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-150`}
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleEdit(product)}
                                  className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-150`}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDuplicate(product)}
                                  className={`w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-150`}
                                >
                                  Duplicate
                                </button>
                                <button
                                  onClick={() => handleDelete(product.productId)}
                                  className={`w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 ${darkMode ? 'hover:bg-red-900/20' : ''} transition-colors duration-150`}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className={`px-6 py-4 flex items-center justify-between border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedProducts.length)}</span> of{' '}
                <span className="font-medium">{sortedProducts.length}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                      : `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-white hover:bg-gray-100 text-gray-800'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`
                  } transition-colors duration-150`}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? `${darkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                      : `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-white hover:bg-gray-100 text-gray-800'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`
                  } transition-colors duration-150`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <div 
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl transition-colors duration-300`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors duration-300`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className={`${darkMode ? 'bg-gradient-to-t from-gray-700 to-gray-800' : 'bg-gradient-to-t from-gray-100 to-white'} rounded-lg mb-6 p-4`}>
              <img 
                src={`/${selectedProduct.imgName}`} 
                alt={selectedProduct.name}
                className="w-full h-auto object-contain max-h-[400px]"
              />
            </div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4 transition-colors duration-300`}>
              {selectedProduct.name}
            </h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-lg mb-4 transition-colors duration-300`}>
              {selectedProduct.description}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price:</span>
                <div className="font-semibold">
                  {selectedProduct.discount ? (
                    <>
                      <span className="text-gray-500 line-through text-sm mr-2">${selectedProduct.price.toFixed(2)}</span>
                      <span className="text-primary">${(selectedProduct.price * (1 - selectedProduct.discount)).toFixed(2)}</span>
                    </>
                  ) : (
                    <span className={darkMode ? 'text-light' : 'text-gray-900'}>${selectedProduct.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock:</span>
                <div>
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(getStockStatus(selectedProduct.stockLevel), darkMode)}`}>
                    {getStatusLabel(getStockStatus(selectedProduct.stockLevel))} ({selectedProduct.stockLevel})
                  </span>
                </div>
              </div>
              <div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>SKU:</span>
                <div className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-900'}`}>{selectedProduct.sku}</div>
              </div>
              <div>
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Created:</span>
                <div className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-900'}`}>
                  {new Date(selectedProduct.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-md w-full shadow-xl transition-colors duration-300`}>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}>
              Confirm Delete
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-light' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} transition-colors duration-150`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-fadeIn">
          <div className={`${darkMode ? 'bg-gray-800 text-light' : 'bg-white text-gray-800'} rounded-lg shadow-lg p-4 flex items-center space-x-3`}>
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}