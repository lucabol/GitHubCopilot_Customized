import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Product {
  productId: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  unit: string;
  imgName: string;
  stockLevel: number;
  supplierId: number;
  discount?: number;
  createdAt: string;
  updatedAt: string;
  lastStockUpdate: string;
}

interface ProductTableRowProps {
  product: Product;
  selected: boolean;
  onSelect: (productId: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
  onDuplicate: (product: Product) => void;
  onInlineUpdate: (productId: number, field: string, value: any) => void;
  supplierName: string;
}

export default function ProductTableRow({
  product,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onInlineUpdate,
  supplierName
}: ProductTableRowProps) {
  const { darkMode } = useTheme();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<any>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock <= 10) return { label: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const stockStatus = getStockStatus(product.stockLevel);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleStartEdit = (field: string, currentValue: any) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingField && editValue !== null) {
      onInlineUpdate(product.productId, editingField, editValue);
      setEditingField(null);
      setEditValue(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue(null);
  };

  return (
    <>
      <tr
        className={`${
          selected ? (darkMode ? 'bg-primary/20' : 'bg-primary/10') : ''
        } ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors cursor-pointer`}
        onContextMenu={handleContextMenu}
        onClick={() => setShowContextMenu(false)}
      >
        {/* Checkbox */}
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(product.productId)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </td>

        {/* ID */}
        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {product.productId}
        </td>

        {/* Name */}
        <td className={`px-4 py-3 text-sm font-medium ${darkMode ? 'text-light' : 'text-gray-900'}`}>
          {product.name}
        </td>

        {/* SKU */}
        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {product.sku}
        </td>

        {/* Price */}
        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {editingField === 'price' ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(parseFloat(e.target.value))}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className={`w-24 px-2 py-1 text-sm ${
                darkMode ? 'bg-gray-700 text-light' : 'bg-white text-gray-800'
              } border border-primary rounded`}
              autoFocus
              step="0.01"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit('price', product.price);
              }}
              className="cursor-pointer hover:text-primary"
            >
              ${product.price.toFixed(2)}
            </span>
          )}
        </td>

        {/* Stock */}
        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {editingField === 'stockLevel' ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(parseInt(e.target.value))}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              className={`w-20 px-2 py-1 text-sm ${
                darkMode ? 'bg-gray-700 text-light' : 'bg-white text-gray-800'
              } border border-primary rounded`}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit('stockLevel', product.stockLevel);
              }}
              className="cursor-pointer hover:text-primary"
            >
              {product.stockLevel}
            </span>
          )}
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className={`h-1 rounded-full ${
                product.stockLevel === 0
                  ? 'bg-red-600'
                  : product.stockLevel <= 10
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }`}
              style={{ width: `${Math.min((product.stockLevel / 100) * 100, 100)}%` }}
            ></div>
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3 text-sm">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}
          >
            {stockStatus.label}
          </span>
        </td>

        {/* Supplier */}
        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {supplierName}
        </td>

        {/* Discount */}
        <td className={`px-4 py-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {product.discount ? `${Math.round(product.discount * 100)}%` : '-'}
        </td>

        {/* Actions */}
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className={`p-1 ${darkMode ? 'text-gray-400 hover:text-light' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              aria-label="Edit product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.productId);
              }}
              className="p-1 text-red-600 hover:text-red-800 transition-colors"
              aria-label="Delete product"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowContextMenu(false)}
          ></div>
          <div
            className={`fixed z-50 w-48 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow-xl border ${
              darkMode ? 'border-gray-600' : 'border-gray-200'
            }`}
            style={{ left: `${contextMenuPos.x}px`, top: `${contextMenuPos.y}px` }}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onEdit(product);
                  setShowContextMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  darkMode ? 'text-light hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Quick Edit
              </button>
              <button
                onClick={() => {
                  onDuplicate(product);
                  setShowContextMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  darkMode ? 'text-light hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Duplicate
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(product.productId.toString());
                  setShowContextMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  darkMode ? 'text-light hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Copy Product ID
              </button>
              <hr className={`my-1 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`} />
              <button
                onClick={() => {
                  onDelete(product.productId);
                  setShowContextMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
