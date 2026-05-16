import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalQty } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [bumping, setBumping] = useState(false);
  const prevQty = useRef(totalQty);
  useEffect(() => {
    if (totalQty > prevQty.current) {
      setBumping(true);
      const t = setTimeout(() => setBumping(false), 350);
      return () => clearTimeout(t);
    }
    prevQty.current = totalQty;
  }, [totalQty]);

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"}`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-indigo-700"
          >
            <span className="inline-block h-8 w-8 rounded-md bg-indigo-600 text-white flex items-center justify-center">
              S
            </span>
            <span className="hidden sm:inline">ShopEase</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" className={linkClass} end>
              Shop
            </NavLink>
            {user?.isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
            {user && (
              <NavLink to="/orders" className={linkClass}>
                Orders
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/cart"
              className="relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m0 0a2 2 0 104 0m6 0a2 2 0 104 0"
                />
              </svg>
              <span className="ml-1 hidden sm:inline">Cart</span>
              {totalQty > 0 && (
                <span
                  className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-indigo-600 rounded-full transition-transform ${
                    bumping ? "scale-125" : "scale-100"
                  }`}
                >
                  {totalQty}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:block text-sm text-gray-700">
                  Hi, <span className="font-medium">{user.name}</span>
                </span>
                <button
                  onClick={() => {
                    logout();
                    toast("Signed out", "info");
                    navigate("/");
                  }}
                  className="text-sm font-medium text-gray-700 hover:text-indigo-700 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-700 px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
