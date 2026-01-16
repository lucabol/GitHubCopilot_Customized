import { useQuery } from 'react-query';
import axios from 'axios';
import { api } from '../../api/config';
import { useTheme } from '../../context/ThemeContext';

interface Stats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalInventoryValue: number;
}

const fetchStats = async (): Promise<Stats> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.products}/stats`);
  return data;
};

export default function ProductStats() {
  const { darkMode } = useTheme();
  const { data: stats, isLoading } = useQuery('productStats', fetchStats, {
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md animate-pulse`}>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'text-blue-600',
      bgColor: darkMode ? 'bg-blue-900/20' : 'bg-blue-50'
    },
    {
      label: 'In Stock',
      value: stats.inStock,
      icon: '✅',
      color: 'text-green-600',
      bgColor: darkMode ? 'bg-green-900/20' : 'bg-green-50'
    },
    {
      label: 'Low Stock',
      value: stats.lowStock,
      icon: '⚠️',
      color: 'text-yellow-600',
      bgColor: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
    },
    {
      label: 'Out of Stock',
      value: stats.outOfStock,
      icon: '❌',
      color: 'text-red-600',
      bgColor: darkMode ? 'bg-red-900/20' : 'bg-red-50'
    },
    {
      label: 'Total Value',
      value: `$${stats.totalInventoryValue.toFixed(2)}`,
      icon: '💰',
      color: 'text-purple-600',
      bgColor: darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.label}
            </span>
            <span className={`text-2xl ${stat.bgColor} rounded-lg p-2`}>{stat.icon}</span>
          </div>
          <div className={`text-3xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
