import { useTheme } from '../../context/ThemeContext';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkEdit: () => void;
  onBulkDelete: () => void;
  onBulkUpdateStock: () => void;
  onBulkDiscount: () => void;
  onExportSelected: (format: 'csv' | 'json') => void;
}

export default function BulkActionBar({
  selectedCount,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  onBulkUpdateStock,
  onBulkDiscount,
  onExportSelected
}: BulkActionBarProps) {
  const { darkMode } = useTheme();

  if (selectedCount === 0) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-2xl border-t-4 border-primary z-50 transition-all duration-300 transform ${
        selectedCount > 0 ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ height: '60px' }}
    >
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Selection Count */}
        <div className="flex items-center gap-4">
          <span className={`font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
          <button
            onClick={onClearSelection}
            className={`text-sm ${darkMode ? 'text-gray-400 hover:text-light' : 'text-gray-600 hover:text-gray-800'} transition-colors`}
          >
            Clear Selection
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBulkEdit}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
              darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            aria-label="Bulk edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={onBulkUpdateStock}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
              darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            aria-label="Update stock"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="hidden sm:inline">Stock</span>
          </button>

          <button
            onClick={onBulkDiscount}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
              darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            aria-label="Apply discount"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="hidden sm:inline">Discount</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative group">
            <button
              className={`px-4 py-2 rounded-lg transition-colors duration-300 flex items-center gap-2 ${
                darkMode ? 'bg-gray-700 text-light hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              aria-label="Export selected"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className={`absolute bottom-full right-0 mb-2 w-40 rounded-lg shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
              <div className="py-1">
                <button
                  onClick={() => onExportSelected('csv')}
                  className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-light hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => onExportSelected('json')}
                  className={`block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-light hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Export as JSON
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onBulkDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300 flex items-center gap-2"
            aria-label="Delete selected"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
