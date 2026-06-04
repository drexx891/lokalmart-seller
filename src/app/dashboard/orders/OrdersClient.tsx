"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
    const [activeTab, setActiveTab] = useState("Semua");
    const [orders, setOrders] = useState(initialOrders);
    const [isProcessing, setIsProcessing] = useState(false);

    const tabs = [
        "Semua", 
        "Belum Bayar", 
        "Perlu Dikirim", 
        "Sedang Dikirim", 
        "Selesai", 
        "Dibatalkan", 
        "Pengembalian"
    ];

    // Filter order berdasarkan tab aktif
    const filteredOrders = orders.filter(order => {
        if (activeTab === "Semua") return true;
        if (activeTab === "Belum Bayar" && order.status === "pending") return true;
        if (activeTab === "Perlu Dikirim" && order.status === "paid") return true;
        if (activeTab === "Sedang Dikirim" && order.status === "shipped") return true;
        if (activeTab === "Selesai" && order.status === "delivered") return true;
        if (activeTab === "Dibatalkan" && order.status === "cancelled") return true;
        return false;
    });

    const handleAturPengiriman = async (orderId: string) => {
        setIsProcessing(true);
        const loading = toast.loading("Memproses pengaturan pengiriman...");
        
        try {
            const { processShipment } = await import('../../actions');
            const res = await processShipment(orderId);
            
            toast.dismiss(loading);
            if (res.success) {
                toast.success("Berhasil! Nomor Resi telah digenerate.");
                
                // Update local state to reflect changes instantly
                setOrders(prev => prev.map(o => 
                    o.id === orderId 
                        ? { ...o, status: "shipped", resiNumber: res.resiNumber } 
                        : o
                ));
            } else {
                toast.error(res.message || "Gagal mengatur pengiriman.");
            }
        } catch (e) {
            toast.dismiss(loading);
            toast.error("Terjadi kesalahan.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCetakResi = (orderId: string, resiNumber: string) => {
        toast.success(`Mencetak label pengiriman untuk resi ${resiNumber}... (Simulasi)`);
    };

    const handleSelesaikanPesanan = async (orderId: string) => {
        setIsProcessing(true);
        const loading = toast.loading("Menyelesaikan pesanan...");
        
        try {
            const { completeOrder } = await import('../../actions');
            const res = await completeOrder(orderId);
            
            toast.dismiss(loading);
            if (res.success) {
                toast.success("Pesanan Selesai! Dana akan diteruskan ke Saldo Penjual.");
                setOrders(prev => prev.map(o => 
                    o.id === orderId ? { ...o, status: "delivered" } : o
                ));
            } else {
                toast.error(res.message || "Gagal menyelesaikan pesanan.");
            }
        } catch (e) {
            toast.dismiss(loading);
            toast.error("Terjadi kesalahan.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-[#E5E7EB] overflow-x-auto scrollbar-hide">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                            activeTab === tab 
                                ? 'border-[#F5A623] text-[#F5A623]' 
                                : 'border-transparent text-[#666] hover:text-[#333]'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Filter / Search Bar */}
            <div className="p-4 bg-gray-50/50 flex gap-4">
                <div className="relative flex-1 md:max-w-md">
                    <input 
                        type="text"
                        placeholder="Cari No. Pesanan, Nama Pembeli, Resi..."
                        className="w-full border border-[#D1D5DB] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#1A3C6E]"
                    />
                </div>
                <button className="bg-white border border-[#D1D5DB] px-4 py-2 rounded-lg text-sm font-semibold text-[#333] hover:bg-gray-50">
                    Cari
                </button>
            </div>

            {/* Order List */}
            <div className="p-4 space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-700">Belum Ada Pesanan</h3>
                        <p className="text-sm text-gray-500">Tidak ada pesanan di kategori ini.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="border border-[#E5E7EB] rounded-xl overflow-hidden hover:border-[#D1D5DB] transition-colors">
                            <div className="bg-gray-50/80 px-4 py-3 flex justify-between items-center border-b border-[#E5E7EB]">
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="font-bold text-[#1F2937]">{order.user?.name || "Pelanggan"}</div>
                                    <div className="text-[#888] flex items-center gap-2">
                                        No. Pesanan: <span className="font-mono text-[#333] font-semibold">{order.id.slice(-8).toUpperCase()}</span>
                                    </div>
                                    {order.resiNumber && (
                                        <div className="text-[#888] flex items-center gap-2">
                                            Resi: <span className="font-mono text-[#1A3C6E] font-bold">{order.resiNumber}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm font-bold">
                                    {order.status === 'pending' && <span className="text-red-600 bg-red-50 px-2 py-1 rounded">Belum Dibayar</span>}
                                    {order.status === 'paid' && <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded">Perlu Dikirim</span>}
                                    {order.status === 'shipped' && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded">Sedang Dikirim</span>}
                                    {order.status === 'delivered' && <span className="text-green-600 bg-green-50 px-2 py-1 rounded">Selesai</span>}
                                </div>
                            </div>
                            
                            <div className="p-4 flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    {order.items.map((item: any) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                                                {item.product.imageUrl ? (
                                                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-[#333] text-sm md:text-base line-clamp-1">{item.product.name}</h4>
                                                {item.selectedOptions && (
                                                    <p className="text-xs text-gray-500 mt-1">Variasi: {JSON.stringify(item.selectedOptions)}</p>
                                                )}
                                                <p className="text-sm text-[#666] mt-1">x{item.quantity}</p>
                                            </div>
                                            <div className="text-right font-bold text-[#1A3C6E]">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="w-full md:w-56 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#E5E7EB] pt-4 md:pt-0 md:pl-6 shrink-0">
                                    <div>
                                        <div className="text-xs text-[#888] mb-1">Total Pesanan</div>
                                        <div className="text-xl font-black text-[#F5A623]">
                                            Rp {order.totalAmount.toLocaleString('id-ID')}
                                        </div>
                                        <div className="text-xs text-[#888] mt-2">
                                            Kurir: <span className="font-semibold text-[#333]">{order.courier || "Reguler"}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 md:mt-0 flex flex-col gap-2">
                                        {order.status === 'paid' && (
                                            <button 
                                                onClick={() => handleAturPengiriman(order.id)}
                                                disabled={isProcessing}
                                                className="w-full bg-[#1A3C6E] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#2A5FA0] transition-colors disabled:opacity-70"
                                            >
                                                Atur Pengiriman
                                            </button>
                                        )}
                                        {order.status === 'shipped' && (
                                            <>
                                                <button 
                                                    onClick={() => handleCetakResi(order.id, order.resiNumber)}
                                                    className="w-full bg-white border border-[#1A3C6E] text-[#1A3C6E] py-2.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
                                                >
                                                    Cetak Resi
                                                </button>
                                                {/* Button Selesaikan ini hanya untuk mockup, di aslinya pembeli yg konfirmasi */}
                                                <button 
                                                    onClick={() => handleSelesaikanPesanan(order.id)}
                                                    disabled={isProcessing}
                                                    className="w-full bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition-colors mt-2"
                                                >
                                                    [SIMULASI] Paket Diterima
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'pending' && (
                                            <button className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-lg text-sm font-bold cursor-not-allowed">
                                                Menunggu Pembayaran
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
