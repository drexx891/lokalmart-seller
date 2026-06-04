"use client";

export default function Topbar() {
    return (
        <header className="h-[72px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 sticky top-0 z-40 shrink-0 shadow-sm">
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input 
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-[#F9FAFB] placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#1A3C6E] focus:border-[#1A3C6E] sm:text-sm transition-colors" 
                        placeholder="Cari pesanan, produk, atau nama pelanggan..." 
                        type="search" 
                    />
                </div>
            </div>

            <div className="flex items-center gap-6 ml-4">
                <button className="relative text-gray-400 hover:text-[#1A3C6E] transition-colors">
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] text-white font-bold items-center justify-center">3</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </button>

                <div className="h-8 w-px bg-gray-200"></div>

                <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-[#333] group-hover:text-[#1A3C6E] transition-colors">Toko Jaya Abadi</div>
                        <div className="text-xs text-[#888]">Penjual Aktif</div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Toko+Jaya+Abadi&background=e0e7ff&color=1e3a8a&rounded=true" alt="Toko Jaya Abadi" />
                    </div>
                </div>
            </div>
        </header>
    );
}
