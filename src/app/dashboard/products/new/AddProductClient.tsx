"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function AddProductClient({ categories }: { categories: any[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [hasVariations, setHasVariations] = useState(false);
    const [variations, setVariations] = useState([{ name: "", options: [""] }]);

    const addVariationOption = (varIndex: number) => {
        const newVars = [...variations];
        newVars[varIndex].options.push("");
        setVariations(newVars);
    };

    const updateVariationOption = (varIndex: number, optIndex: number, value: string) => {
        const newVars = [...variations];
        newVars[varIndex].options[optIndex] = value;
        setVariations(newVars);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loading = toast.loading("Menyimpan produk...");

        try {
            const formData = new FormData(e.currentTarget);
            
            // Format Custom Options if variations exist
            if (hasVariations) {
                const customOptions = variations.map(v => ({
                    name: v.name || "Variasi",
                    options: v.options.filter(o => o.trim() !== "").map(o => ({ label: o, priceDelta: 0 }))
                })).filter(v => v.options.length > 0);
                
                formData.append('customOptions', JSON.stringify(customOptions));
            }

            const { createProduct } = await import('../../../actions');
            const res = await createProduct(formData);
            
            toast.dismiss(loading);
            if (res.success) {
                toast.success("Produk berhasil ditambahkan!");
                window.location.href = "/dashboard/products";
            } else {
                toast.error(res.message || "Gagal menyimpan produk.");
            }
        } catch (e) {
            toast.dismiss(loading);
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
            {/* 1. Informasi Dasar */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 border-b border-[#E5E7EB] bg-gray-50/50">
                    <h2 className="text-lg font-bold text-[#1F2937]">Informasi Dasar</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-semibold text-[#4B5563] pt-2">Foto Produk <span className="text-red-500">*</span></label>
                        <div className="md:col-span-3 flex gap-4">
                            {/* Main Photo Upload Box */}
                            <div className="w-24 h-24 border-2 border-dashed border-[#1A3C6E] rounded-xl flex flex-col items-center justify-center text-[#1A3C6E] bg-blue-50/50 cursor-pointer hover:bg-blue-50 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                <span className="text-[10px] font-bold mt-1">Foto Utama</span>
                            </div>
                            <div className="w-24 h-24 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </div>
                            <input type="hidden" name="imageUrl" value="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" />
                            {/* Real implementation would use file upload to Cloudinary/Firebase */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-semibold text-[#4B5563] pt-2">Nama Produk <span className="text-red-500">*</span></label>
                        <div className="md:col-span-3">
                            <input required type="text" name="name" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A3C6E] transition-all" placeholder="Contoh: Sepatu Sneakers Pria Hitam" />
                            <p className="text-xs text-gray-500 mt-1.5">Maksimal 100 karakter. Disarankan menyertakan Merek, Jenis, dan Warna.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-semibold text-[#4B5563] pt-2">Kategori <span className="text-red-500">*</span></label>
                        <div className="md:col-span-3">
                            <select required name="categoryId" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A3C6E] bg-white">
                                <option value="">Pilih Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-semibold text-[#4B5563] pt-2">Deskripsi Produk <span className="text-red-500">*</span></label>
                        <div className="md:col-span-3">
                            <textarea required name="description" rows={5} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A3C6E] transition-all" placeholder="Tulis deskripsi lengkap mengenai produk Anda..."></textarea>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Informasi Penjualan */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 border-b border-[#E5E7EB] bg-gray-50/50">
                    <h2 className="text-lg font-bold text-[#1F2937]">Informasi Penjualan</h2>
                </div>
                <div className="p-6 space-y-6">
                    
                    {/* Variasi Toggle */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-semibold text-[#4B5563]">Variasi</label>
                        <div className="md:col-span-3">
                            <button 
                                type="button" 
                                onClick={() => setHasVariations(!hasVariations)}
                                className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                {hasVariations ? "Hapus Variasi" : "Aktifkan Variasi (Warna, Ukuran)"}
                            </button>
                        </div>
                    </div>

                    {hasVariations ? (
                        <div className="bg-gray-50 border border-dashed border-gray-300 p-6 rounded-xl space-y-6">
                            {variations.map((v, vIdx) => (
                                <div key={vIdx} className="space-y-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-24 text-sm text-gray-600 font-semibold">Nama Variasi</div>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Warna" 
                                            value={v.name}
                                            onChange={(e) => {
                                                const newVars = [...variations];
                                                newVars[vIdx].name = e.target.value;
                                                setVariations(newVars);
                                            }}
                                            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm" 
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-24 text-sm text-gray-600 font-semibold pt-2">Pilihan</div>
                                        <div className="flex-1 flex flex-wrap gap-2">
                                            {v.options.map((opt, oIdx) => (
                                                <input 
                                                    key={oIdx}
                                                    type="text" 
                                                    placeholder="Contoh: Merah" 
                                                    value={opt}
                                                    onChange={(e) => updateVariationOption(vIdx, oIdx, e.target.value)}
                                                    className="w-32 border border-gray-300 rounded-md px-3 py-1.5 text-sm" 
                                                />
                                            ))}
                                            <button type="button" onClick={() => addVariationOption(vIdx)} className="w-8 h-8 rounded-md border border-dashed border-[#1A3C6E] text-[#1A3C6E] flex items-center justify-center hover:bg-blue-50">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="text-xs text-gray-500 mt-2">*Harga dan Stok di bawah akan menjadi nilai default untuk semua variasi di atas.</div>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-semibold text-[#4B5563] pt-2">Harga <span className="text-red-500">*</span></label>
                        <div className="md:col-span-3 relative">
                            <span className="absolute left-4 top-2.5 text-gray-500 text-sm font-semibold">Rp</span>
                            <input required type="number" name="price" className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A3C6E]" placeholder="0" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-semibold text-[#4B5563] pt-2">Stok <span className="text-red-500">*</span></label>
                        <div className="md:col-span-3">
                            <input required type="number" name="stock" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A3C6E]" placeholder="0" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Pengiriman */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 border-b border-[#E5E7EB] bg-gray-50/50">
                    <h2 className="text-lg font-bold text-[#1F2937]">Pengiriman</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-semibold text-[#4B5563] pt-2">Berat <span className="text-red-500">*</span></label>
                        <div className="md:col-span-3 relative">
                            <input required type="number" name="weight" className="w-full border border-gray-300 rounded-lg pr-12 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1A3C6E]" placeholder="Berat produk..." />
                            <span className="absolute right-4 top-2.5 text-gray-500 text-sm font-semibold">Gram</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <label className="text-sm font-semibold text-[#4B5563] pt-2">Pre-Order</label>
                        <div className="md:col-span-3 flex items-center gap-4 pt-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" value="" className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A3C6E]"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Ya, saya butuh waktu memproses pesanan</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Float Action Bar */}
            <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-[#E5E7EB] p-4 flex justify-end gap-3 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <button type="button" onClick={() => window.history.back()} className="px-6 py-2.5 rounded-xl text-sm font-bold border border-gray-300 text-[#333] hover:bg-gray-50 transition-colors">
                    Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 rounded-xl text-sm font-bold bg-[#1A3C6E] text-white hover:bg-[#2A5FA0] transition-colors shadow-md disabled:opacity-70 flex items-center gap-2">
                    {isSubmitting && <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    Simpan & Tampilkan
                </button>
            </div>
        </form>
    );
}
