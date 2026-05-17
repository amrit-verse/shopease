import { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../api/products";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency } from "../utils/formatCurrency";
import ImageWithFallback from "./ImageWithFallback";

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const out = product.countInStock <= 0;
  const handleAdd = useCallback(() => {
    addItem(product, 1);
    toast(`${product.name} added to cart`);
  }, [addItem, product, toast]);

  return (
    <div className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      <Link to={`/products/${product._id}`} className="block">
        <div className="aspect-square w-full bg-gray-100 overflow-hidden">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs uppercase tracking-wider text-gray-400">
          {product.category}
        </span>
        <Link
          to={`/products/${product._id}`}
          className="font-medium text-gray-900 hover:text-indigo-700 line-clamp-2"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(product.price)}
          </span>
          <button
            disabled={out}
            onClick={handleAdd}
            className="text-sm font-medium px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {out ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
