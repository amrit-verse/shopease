import { useEffect, useState } from "react";
import {
  apiCreateProduct, apiDeleteProduct, apiListProducts,
  apiUpdateProduct, type Product,
} from "../api/products";
import { apiMyOrders, apiUpdateOrderStatus, type Order, ORDER_STATUS_STEPS, type OrderStatus } from "../api/orders";
import ImageWithFallback from "../components/ImageWithFallback";
import { formatCurrency } from "../utils/formatCurrency";

type Form = {
  name: string; description: string; price: string;
  image: string; category: string; countInStock: string;
};

const emptyForm: Form = { name: "", description: "", price: "", image: "", category: "General", countInStock: "0" };

export default function AdminPage() {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const loadProducts = () => {
    setLoading(true);
    apiListProducts().then(setProducts).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  const loadOrders = () => {
    setLoading(true);
    // Admin would ideally have a "all orders" endpoint; using mine for now
    apiMyOrders().then(setOrders).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (tab === "products") loadProducts();
    else loadOrders();
  }, [tab]);

  const startEdit = (p: Product) => {
    setEditingId(p._id);
    setForm({ name: p.name, description: p.description, price: String(p.price), image: p.image, category: p.category, countInStock: String(p.countInStock) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const resetForm = () => { setEditingId(null); setForm(emptyForm); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = { name: form.name, description: form.description, price: Number(form.price), image: form.image, category: form.category, countInStock: Number(form.countInStock) };
      if (editingId) await apiUpdateProduct(editingId, payload);
      else await apiCreateProduct(payload);
      resetForm();
      loadProducts();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try { await apiDeleteProduct(id); loadProducts(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete"); }
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setStatusUpdating(orderId);
    try {
      const updated = await apiUpdateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: updated.status } : o)));
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to update status"); }
    finally { setStatusUpdating(null); }
  };

  const field = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">Admin Dashboard</h1>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(["products", "orders"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab === t ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-600 hover:text-gray-900"}`}
          >{t}</button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-800 px-3 py-2 text-sm">{error}</div>}

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-5 space-y-3 h-fit">
            <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Edit product" : "Add new product"}</h2>
            {["name", "description", "image"].map((f) => (
              <div key={f}>
                <label className="block text-sm text-gray-700 mb-1 capitalize">{f === "image" ? "Image URL" : f}</label>
                {f === "description"
                  ? <textarea rows={3} value={(form as Record<string, string>)[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className={field} />
                  : <input value={(form as Record<string, string>)[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className={field} placeholder={f === "image" ? "https://…" : ""} required={f === "name"} />}
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Price</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={field} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Stock</label>
                <input required type="number" min="0" value={form.countInStock} onChange={(e) => setForm({ ...form, countInStock: e.target.value })} className={field} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={field} />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-indigo-400">
                {submitting ? "Saving…" : editingId ? "Save changes" : "Add product"}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>}
            </div>
          </form>

          <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All products ({products.length})</h2>
            </div>
            {loading ? <div className="p-6 text-gray-500">Loading…</div> : products.length === 0 ? <div className="p-6 text-gray-500">No products yet.</div> : (
              <ul className="divide-y divide-gray-100">
                {products.map((p) => (
                  <li key={p._id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.category} · {p.countInStock} in stock</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{formatCurrency(p.price)}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(p)} className="text-sm px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="text-sm px-2 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Manage order statuses. Update status to simulate real-time tracking progress.</p>
          {loading ? <div className="text-gray-500">Loading…</div> : orders.length === 0 ? <div className="text-gray-500 bg-white border border-gray-200 rounded-lg p-6">No orders found.</div> : (
            orders.map((o) => (
              <div key={o._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex-1 text-sm text-gray-700">
                    <span className="font-mono text-xs text-gray-500">#{o._id.slice(-8)}</span>
                    <span className="mx-2 text-gray-400">·</span>
                    <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                    <span className="mx-2 text-gray-400">·</span>
                    <span className="font-semibold">{formatCurrency(o.totalAmount)}</span>
                    {o.trackingId && <span className="ml-2 font-mono text-indigo-600 text-xs">{o.trackingId}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600 font-medium">Status:</label>
                    <select
                      value={o.status}
                      disabled={statusUpdating === o._id}
                      onChange={(e) => handleStatusChange(o._id, e.target.value as OrderStatus)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {[...ORDER_STATUS_STEPS, "Cancelled"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {statusUpdating === o._id && <span className="text-xs text-gray-500">Saving…</span>}
                  </div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {o.items.map((it) => (
                    <li key={it.product} className="px-5 py-2 flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={it.image}
                          alt={it.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <span className="flex-1 truncate">{it.name}</span>
                      <span className="text-gray-500">×{it.qty}</span>
                      <span>{formatCurrency(it.price * it.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
