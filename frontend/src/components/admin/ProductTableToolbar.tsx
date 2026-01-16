import { useTheme } from '../../context/ThemeContext';

interface ProductTableToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onExport: (format: 'csv' | 'json') => void;
  onImport: () => void;
  onNewProduct: () => void;
  onColumnSettings: () => void;
}

export default function ProductTableToolbar({
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  onExport,
  onImport,
  onNewProduct,
  onColumnSettings
}: ProductTableToolbarProps) {
  const { darkMode } = useTheme();

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-md mb-6`}>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, description, or SKU..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full px-4 py-2 pl-10 ${
              darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-300'
            } rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
            aria-label="Search products"
          />
          <svg
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
              showFilters
                ? 'bg-primary text-white'
                : darkMode
                ? 'bg-gray-700 text-light hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            aria-label="Toggle filters"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
                darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              aria-label="Export"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10`}>
              <div className="py-1">
                <button
                  onClick={() => onExport('csv')}
                  className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-light hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => onExport('json')}
                  className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-light hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>

          {/* Import Button */}
          <button
            onClick={onImport}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
              darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            aria-label="Import"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span className="hidden sm:inline">Import</span>
          </button>

          {/* Column Settings */}
          <button
            onClick={onColumnSettings}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
              darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            aria-label="Column settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <span className="hidden sm:inline">Columns</span>
          </button>

          {/* New Product Button */}
          <button
            onClick={onNewProduct}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors duration-300 flex items-center gap-2"
            aria-label="Add new product"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
