import { useTheme } from '../../context/ThemeContext';

export interface ProductFilters {
  status: string[];
  priceRange: [number, number];
  stockRange: [number, number];
  suppliers: number[];
  dateRange: [string, string];
  onlyDiscounted: boolean;
}

interface ProductFilterPanelProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  suppliers: Array<{ supplierId: number; name: string }>;
  show: boolean;
}

export default function ProductFilterPanel({
  filters,
  onFiltersChange,
  suppliers,
  show
}: ProductFilterPanelProps) {
  const { darkMode } = useTheme();

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleSupplierToggle = (supplierId: number) => {
    const newSuppliers = filters.suppliers.includes(supplierId)
      ? filters.suppliers.filter(s => s !== supplierId)
      : [...filters.suppliers, supplierId];
    onFiltersChange({ ...filters, suppliers: newSuppliers });
  };

  const handleClearAll = () => {
    onFiltersChange({
      status: [],
      priceRange: [0, 1000],
      stockRange: [0, 200],
      suppliers: [],
      dateRange: ['', ''],
      onlyDiscounted: false
    });
  };

  if (!show) return null;

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg p-6 shadow-md mb-6 transition-all duration-300 transform ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
          Filters
        </h3>
        <button
          onClick={handleClearAll}
          className={`text-sm ${darkMode ? 'text-gray-400 hover:text-light' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Stock Status
          </label>
          <div className="space-y-2">
            {['In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
              <label key={status} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                  className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {status}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Price Range
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: [parseFloat(e.target.value) || 0, filters.priceRange[1]]
                  })
                }
                placeholder="Min"
                className={`w-full px-3 py-1.5 text-sm ${
                  darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-300'
                } rounded border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none`}
              />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>-</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    priceRange: [filters.priceRange[0], parseFloat(e.target.value) || 1000]
                  })
                }
                placeholder="Max"
                className={`w-full px-3 py-1.5 text-sm ${
                  darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-300'
                } rounded border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Stock Range */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Stock Level
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.stockRange[0]}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    stockRange: [parseInt(e.target.value) || 0, filters.stockRange[1]]
                  })
                }
                placeholder="Min"
                className={`w-full px-3 py-1.5 text-sm ${
                  darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-300'
                } rounded border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none`}
              />
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>-</span>
              <input
                type="number"
                value={filters.stockRange[1]}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    stockRange: [filters.stockRange[0], parseInt(e.target.value) || 200]
                  })
                }
                placeholder="Max"
                className={`w-full px-3 py-1.5 text-sm ${
                  darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-300'
                } rounded border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none`}
              />
            </div>
          </div>
        </div>

        {/* Supplier Filter */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Suppliers
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {suppliers.map((supplier) => (
              <label key={supplier.supplierId} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.suppliers.includes(supplier.supplierId)}
                  onChange={() => handleSupplierToggle(supplier.supplierId)}
                  className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {supplier.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700 flex items-center">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onlyDiscounted}
            onChange={(e) => onFiltersChange({ ...filters, onlyDiscounted: e.target.checked })}
            className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Show only discounted items
          </span>
        </label>
      </div>
    </div>
  );
}
