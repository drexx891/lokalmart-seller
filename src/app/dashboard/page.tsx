import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: 'Dashboard - Belio Seller Center',
};

export default async function DashboardHome() {
    const session = await getSession();
    if (!session.userId) redirect("/");

    const supplier = await prisma.supplier.findFirst({
        where: { userId: session.userId }
    });

    if (!supplier) redirect("/");

    // === GATHER METRICS ===
    const [
        totalOrders,
        unpaidOrders,
        toShipOrders,
        shippedOrders,
        completedOrders,
        allProducts,
        lowStockProducts
    ] = await Promise.all([
        prisma.order.count({ where: { items: { some: { product: { supplierId: supplier.id } } } } }),
        prisma.order.count({ where: { items: { some: { product: { supplierId: supplier.id } } }, status: 'pending' } }),
        prisma.order.count({ where: { items: { some: { product: { supplierId: supplier.id } } }, status: 'paid' } }),
        prisma.order.count({ where: { items: { some: { product: { supplierId: supplier.id } } }, status: 'shipped' } }),
        prisma.order.count({ where: { items: { some: { product: { supplierId: supplier.id } } }, status: 'delivered' } }),
        prisma.product.count({ where: { supplierId: supplier.id } }),
        prisma.product.findMany({ where: { supplierId: supplier.id, stock: { lt: 5 } }, take: 5 }),
    ]);

    // Calculate revenue (Mock calculation for demonstration)
    const revenueQuery = await prisma.orderItem.aggregate({
        where: { product: { supplierId: supplier.id }, order: { status: 'delivered' } },
        _sum: { price: true, quantity: true }
    });
    const totalRevenue = revenueQuery._sum.price || 0; // simplified
    const itemsSold = revenueQuery._sum.quantity || 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
                <div>
                    <h1 className="text-2xl font-black text-[#1F2937] tracking-tight">Selamat datang, {supplier.companyName}!</h1>
                    <p className="text-[#6B7280] text-sm mt-1 font-medium">Berikut adalah rangkuman performa toko Anda hari ini.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border-2 border-[#D1D5DB] text-[#333] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                        Lihat Toko
                    </button>
                    <Link href="/dashboard/products/new" className="bg-gradient-to-r from-[#F5A623] to-[#E09612] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Tambah Produk
                    </Link>
                </div>
            </div>

            {/* To-Do List Cepat (Action Center) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F5A623]"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        Status Pesanan (Yang Perlu Dilakukan)
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/dashboard/orders?tab=unpaid" className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-gray-200 group">
                        <span className="text-3xl font-black text-gray-700 mb-1 group-hover:scale-110 transition-transform">{unpaidOrders}</span>
                        <span className="text-sm font-bold text-gray-500 text-center">Belum Bayar</span>
                    </Link>
                    <Link href="/dashboard/orders?tab=toship" className="flex flex-col items-center justify-center p-5 bg-red-50 rounded-xl cursor-pointer hover:bg-red-100 transition-all border border-red-100 group relative">
                        {toShipOrders > 0 && <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>}
                        <span className="text-3xl font-black text-red-600 mb-1 group-hover:scale-110 transition-transform">{toShipOrders}</span>
                        <span className="text-sm font-bold text-red-800 text-center">Perlu Dikirim</span>
                    </Link>
                    <Link href="/dashboard/orders?tab=shipped" className="flex flex-col items-center justify-center p-5 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-all border border-blue-100 group">
                        <span className="text-3xl font-black text-blue-600 mb-1 group-hover:scale-110 transition-transform">{shippedOrders}</span>
                        <span className="text-sm font-bold text-blue-800 text-center">Sedang Dikirim</span>
                    </Link>
                    <Link href="/dashboard/orders?tab=done" className="flex flex-col items-center justify-center p-5 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100 transition-all border border-green-100 group">
                        <span className="text-3xl font-black text-green-600 mb-1 group-hover:scale-110 transition-transform">{completedOrders}</span>
                        <span className="text-sm font-bold text-green-800 text-center">Pesanan Selesai</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Kolom Info Bisnis Utama */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Financial Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-[#1A3C6E] to-[#2A5FA0] p-6 rounded-2xl shadow-md text-white relative overflow-hidden group">
                            <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 translate-x-4 -translate-y-4">
                                <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                            </div>
                            <div className="relative z-10">
                                <div className="text-sm text-blue-200 mb-1 font-semibold flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
                                    Pendapatan Selesai
                                </div>
                                <div className="text-3xl font-black mb-4 tracking-tight">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalRevenue)}
                                </div>
                                <div className="text-xs font-medium text-blue-100 bg-black/20 inline-block px-3 py-1 rounded-full backdrop-blur-sm">
                                    Bulan Ini
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB] flex flex-col justify-center">
                            <div className="text-sm text-gray-500 mb-1 font-semibold">Saldo Seller Tersedia</div>
                            <div className="text-3xl font-black text-[#1F2937] mb-4">Rp 0</div>
                            <div>
                                <button className="text-sm font-bold text-[#1A3C6E] bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                    Tarik Dana
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sales Performance Chart (Stylized SVG) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-[#1F2937]">Performa Penjualan</h2>
                            <select className="text-sm border border-[#D1D5DB] rounded-lg px-3 py-1.5 bg-gray-50 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer">
                                <option>7 Hari Terakhir</option>
                                <option>30 Hari Terakhir</option>
                            </select>
                        </div>
                        
                        <div className="flex-1 min-h-[250px] relative border-b border-l border-gray-100 ml-8 mb-6 mt-4">
                            {/* Grid Lines */}
                            <div className="absolute w-full border-t border-dashed border-gray-100 bottom-[20%]"></div>
                            <div className="absolute w-full border-t border-dashed border-gray-100 bottom-[40%]"></div>
                            <div className="absolute w-full border-t border-dashed border-gray-100 bottom-[60%]"></div>
                            <div className="absolute w-full border-t border-dashed border-gray-100 bottom-[80%]"></div>
                            
                            {/* SVG Line Graph */}
                            <svg className="w-full h-full absolute inset-0 preserve-3d overflow-visible" preserveAspectRatio="none">
                                {/* Soft Shadow */}
                                <path d="M0,200 L50,180 L100,190 L150,150 L200,160 L250,90 L300,110 L350,50 L400,60 L450,20 L500,40" fill="none" stroke="#F5A623" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 blur-sm translate-y-2" />
                                {/* Main Line */}
                                <path d="M0,200 L50,180 L100,190 L150,150 L200,160 L250,90 L300,110 L350,50 L400,60 L450,20 L500,40" fill="none" stroke="#F5A623" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                {/* Gradient Fill */}
                                <path d="M0,200 L50,180 L100,190 L150,150 L200,160 L250,90 L300,110 L350,50 L400,60 L450,20 L500,40 L500,250 L0,250 Z" fill="url(#salesGradient)" className="opacity-30" />
                                
                                {/* Data Points */}
                                <circle cx="250" cy="90" r="4" fill="white" stroke="#F5A623" strokeWidth="3" />
                                <circle cx="350" cy="50" r="4" fill="white" stroke="#F5A623" strokeWidth="3" />
                                <circle cx="450" cy="20" r="4" fill="white" stroke="#F5A623" strokeWidth="3" />
                                
                                <defs>
                                    <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#F5A623" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            
                            {/* Y-Axis Labels */}
                            <div className="absolute -left-12 bottom-0 text-[10px] text-gray-400 font-bold">0</div>
                            <div className="absolute -left-12 bottom-[20%] text-[10px] text-gray-400 font-bold">1K</div>
                            <div className="absolute -left-12 bottom-[40%] text-[10px] text-gray-400 font-bold">2K</div>
                            <div className="absolute -left-12 bottom-[60%] text-[10px] text-gray-400 font-bold">3K</div>
                            <div className="absolute -left-12 bottom-[80%] text-[10px] text-gray-400 font-bold">4K</div>
                            <div className="absolute -left-12 top-0 text-[10px] text-gray-400 font-bold">5K</div>
                        </div>
                        
                        {/* X-Axis Labels */}
                        <div className="flex justify-between px-6 text-xs text-gray-400 font-bold mt-auto">
                            <span>Sen</span>
                            <span>Sel</span>
                            <span>Rab</span>
                            <span>Kam</span>
                            <span>Jum</span>
                            <span>Sab</span>
                            <span>Min</span>
                        </div>
                    </div>
                </div>

                {/* Kolom Sidebar Kanan */}
                <div className="space-y-6">
                    {/* Ringkasan Inventaris */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
                        <h2 className="text-sm font-bold text-[#1F2937] mb-4 flex items-center gap-2 uppercase tracking-wider text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                            Katalog Anda
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-2xl font-black text-[#1A3C6E]">{allProducts}</div>
                                <div className="text-xs text-gray-500 font-semibold mt-1">Total Produk</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="text-2xl font-black text-[#1A3C6E]">{itemsSold}</div>
                                <div className="text-xs text-gray-500 font-semibold mt-1">Barang Terjual</div>
                            </div>
                        </div>

                        {/* Peringatan Stok */}
                        <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">Peringatan Stok Habis</h3>
                        {lowStockProducts.length > 0 ? (
                            <div className="space-y-3">
                                {lowStockProducts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 border border-red-100 bg-red-50/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-md border border-gray-200 flex-shrink-0 overflow-hidden">
                                                <img src={p.imageUrl || ''} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
                                                <div className="text-xs font-bold text-red-600">Sisa {p.stock}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-24 flex-col text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                <div className="text-xs font-bold text-gray-500">Stok semua produk aman!</div>
                            </div>
                        )}
                        <Link href="/dashboard/products" className="block text-center text-[#1A3C6E] text-xs font-bold mt-4 hover:underline">Kelola Produk &rarr;</Link>
                    </div>

                    {/* Bantuan & Edukasi Seller */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="indigo" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        </div>
                        <h2 className="text-sm font-bold text-indigo-900 mb-2">Edukasi Seller</h2>
                        <p className="text-xs text-indigo-700 mb-4 leading-relaxed font-medium">Tingkatkan penjualan Anda hingga 300% dengan mengikuti panduan foto produk yang menarik dan deskripsi SEO-friendly.</p>
                        <button className="text-xs font-bold bg-white text-indigo-600 px-4 py-2 rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors relative z-10">
                            Pelajari Sekarang
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
