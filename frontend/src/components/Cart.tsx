import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { darkMode } = useTheme();
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const subtotal = getCartTotal();
  const discountAmount = subtotal * appliedDiscount;
  const shipping = cartItems.length > 0 ? 10 : 0;
  const grandTotal = subtotal - discountAmount + shipping;

  const handleApplyCoupon = () => {
    // Example coupon codes
    if (couponCode.toLowerCase() === 'save5') {
      setAppliedDiscount(0.05);
      setCouponMessage('5% discount applied!');
    } else if (couponCode.toLowerCase() === 'save10') {
      setAppliedDiscount(0.10);
      setCouponMessage('10% discount applied!');
    } else if (couponCode.trim() === '') {
      setCouponMessage('Please enter a coupon code');
    } else {
      setAppliedDiscount(0);
      setCouponMessage('Invalid coupon code');
    }
  };

  const handleUpdateCart = () => {
    // Trigger any cart updates if needed
    setCouponMessage('Cart updated!');
    setTimeout(() => setCouponMessage(''), 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <svg
              className={`w-24 h-24 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
              Your cart is empty
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Add some products to get started!
            </p>
            <Link
              to="/products"
              className="bg-primary hover:bg-accent text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-20 pb-16 px-4 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-8 transition-colors duration-300`}>
          Shopping Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Table */}
          <div className="lg:w-2/3">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden transition-colors duration-300`}>
              {/* Table Header */}
              <div className={`grid grid-cols-12 gap-4 p-4 ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-600'} font-semibold text-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="col-span-1 text-center">S. No</div>
                <div className="col-span-2 text-center">Product Image</div>
                <div className="col-span-3">Product Name</div>
                <div className="col-span-2 text-center">Unit Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-1 text-center">Total</div>
                <div className="col-span-1 text-center">Remove</div>
              </div>

              {/* Cart Items */}
              {cartItems.map((item, index) => (
                <div
                  key={item.productId}
                  className={`grid grid-cols-12 gap-4 p-4 items-center border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-colors duration-300`}
                >
                  {/* S. No */}
                  <div className={`col-span-1 text-center ${darkMode ? 'text-light' : 'text-gray-800'}`}>
                    {index + 1}
                  </div>

                  {/* Product Image */}
                  <div className="col-span-2 flex justify-center">
                    <div className={`w-20 h-20 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg p-2 transition-colors duration-300`}>
                      <img
                        src={`/${item.imgName}`}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Product Name */}
                  <div className={`col-span-3 ${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                    {item.name}
                  </div>

                  {/* Unit Price */}
                  <div className={`col-span-2 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    ${item.price.toFixed(2)}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex justify-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className={`w-16 text-center px-2 py-1 rounded-lg border ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-light'
                          : 'bg-white border-gray-300 text-gray-800'
                      } focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                    />
                  </div>

                  {/* Total */}
                  <div className={`col-span-1 text-center ${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className={`p-2 ${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} transition-colors`}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Coupon and Update Cart */}
              <div className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className={`flex-1 sm:w-64 px-4 py-2 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-light placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                    } focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    Apply Coupon
                  </button>
                </div>
                <button
                  onClick={handleUpdateCart}
                  className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto"
                >
                  Update Cart
                </button>
              </div>

              {couponMessage && (
                <div className={`px-4 pb-4 ${appliedDiscount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {couponMessage}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 transition-colors duration-300`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} mb-6 text-center border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} pb-4`}>
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subtotal</span>
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Discount({Math.round(appliedDiscount * 100)}%)
                    </span>
                    <span className="text-red-500 font-medium">
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Shipping</span>
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-medium`}>
                    ${shipping.toFixed(2)}
                  </span>
                </div>

                <div className={`flex justify-between pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={`${darkMode ? 'text-light' : 'text-gray-800'} font-bold text-lg`}>
                    Grand Total
                  </span>
                  <span className="text-primary font-bold text-lg">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button className="w-full bg-primary hover:bg-accent text-white py-3 rounded-lg font-medium mt-6 transition-colors">
                Proceed To Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
