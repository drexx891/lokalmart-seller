"use client";

import { useState } from "react";
import { BANK_OPTIONS } from "@/lib/indonesiaLocations";
import { registerSeller } from "./actions";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterSellerPage() {
    // step 0 = Halaman awal (Login/Register Gateway ala Lazada)
    // step 1 = Tipe Penjual
    // step 2 = Dokumen ID
    // step 3 = Dokumen Bank
    const [step, setStep] = useState(0);
    const [isLoginMode, setIsLoginMode] = useState(false);
    
    // Auth State
    const [authMethod, setAuthMethod] = useState("phone"); // 'phone', 'google', 'apple', 'facebook'
    const [authStep, setAuthStep] = useState("phone"); // 'phone', 'select_otp', 'input_otp'
    const [otpChannel, setOtpChannel] = useState(""); // 'WhatsApp', 'SMS', 'Panggilan Telepon'
    const [otpCode, setOtpCode] = useState("");
    
    // State form
    const [phone, setPhone] = useState("");
    const [businessType, setBusinessType] = useState("Individu"); 
    
    // Dokumen ID
    const [idType, setIdType] = useState("KTP");
    const [idName, setIdName] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [idFile, setIdFile] = useState<File | null>(null);

    // Dokumen Bank
    const [bankType, setBankType] = useState("Lokal");
    const [bankName, setBankName] = useState("");
    const [bankAccount, setBankAccount] = useState("");
    const [bankHolder, setBankHolder] = useState("");
    const [bankFile, setBankFile] = useState<File | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLoginNext = () => {
        if (!phone || phone.length < 9) {
            return toast.error("Masukkan nomor handphone yang valid.");
        }
        setAuthMethod("phone");
        setAuthStep("select_otp");
    };

    const handleSocialLogin = async (method: string) => {
        const loadingToast = toast.loading(`Masuk dengan ${method}...`);
        try {
            const { mockGoogleLogin } = await import('./actions');
            const result = await mockGoogleLogin();
            toast.dismiss(loadingToast);
            if (result.success) {
                if (result.isExistingSeller) {
                    toast.success("Login berhasil! Mengalihkan ke Dasbor...", { duration: 2000 });
                    window.location.href = "/dashboard";
                } else {
                    toast.success("Berhasil! Silakan lengkapi pendaftaran toko Anda.");
                    setAuthMethod(method);
                    setStep(1); // Langsung lompat ke form pendaftaran jika belum jadi supplier
                }
            } else {
                toast.error("Gagal login dengan " + method);
            }
        } catch (e) {
            toast.dismiss(loadingToast);
            toast.error("Terjadi kesalahan sistem.");
        }
    };

    const handleSelectOtpChannel = async (channel: string) => {
        setOtpChannel(channel);
        setAuthStep("input_otp");
        const loadingToast = toast.loading(`Mengirim kode OTP via ${channel}...`);
        
        try {
            const { sendOtpCode } = await import('./actions');
            const result = await sendOtpCode(phone, channel);
            
            toast.dismiss(loadingToast);
            if (result.success) {
                // Untuk keperluan testing/development, kita tampilkan kode OTP langsung di layar!
                toast.success(`Kode OTP Anda: ${result.mockOtp}`, { duration: 8000, style: { background: '#1A3C6E', color: '#fff', fontWeight: 'bold' } });
            } else {
                toast.error(result.message || "Gagal mengirim OTP");
                setAuthStep("select_otp");
            }
        } catch (e) {
            toast.dismiss(loadingToast);
            toast.error("Terjadi kesalahan.");
            setAuthStep("select_otp");
        }
    };

    const handleVerifyOtp = async () => {
        if (authMethod !== "phone" && (!phone || phone.length < 9)) {
            return toast.error("Masukkan nomor handphone yang valid.");
        }
        if (otpCode.length < 6) {
            return toast.error("Masukkan 6 digit kode OTP.");
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading("Memverifikasi OTP...");
        
        try {
            const { verifyPhoneAndLogin } = await import('./actions');
            const result = await verifyPhoneAndLogin(phone, otpCode);
            
            toast.dismiss(loadingToast);
            
            if (result.success) {
                toast.success("Verifikasi berhasil!");
                if (result.isExistingSeller) {
                    toast.loading("Mengalihkan ke Dasbor...");
                    window.location.href = "/dashboard";
                } else {
                    setStep(1);
                }
            } else {
                toast.error(result.message || "Gagal masuk.");
            }
        } catch (e) {
            toast.dismiss(loadingToast);
            toast.error("Terjadi kesalahan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            if (!idName || !idNumber) return toast.error("Informasi ID wajib diisi lengkap");
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        if (!bankName || !bankAccount || !bankHolder) return toast.error("Data rekening wajib diisi lengkap");
        
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("businessType", businessType);
        formData.append("phone", phone);
        formData.append("email", "seller@belio.com");
        formData.append("companyName", idName + " Store"); 
        formData.append("province", "DKI Jakarta");
        formData.append("city", "Jakarta Selatan");
        formData.append("bankName", bankName);
        formData.append("bankAccount", bankAccount);
        formData.append("bankHolder", bankHolder);

        const result = await registerSeller(formData);
        if (result.success) {
            toast.success("Pendaftaran Berhasil! Mengalihkan ke Dasbor...");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);
        } else {
            toast.error(result.message || "Pendaftaran gagal");
            setIsSubmitting(false);
        }
    };

    // Halaman Gateway Awal (Step 0)
    if (step === 0) {
        return (
            <div className="min-h-screen bg-white font-sans flex flex-col text-[#333333]">
                <Toaster position="top-center" />
                
                {/* Topbar Simple */}
                <header className="bg-white h-[72px] flex items-center justify-between px-8 md:px-16 shadow-sm border-b border-[#E5E7EB] shrink-0 sticky top-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1A3C6E] to-[#2A5FA0] rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-white font-black text-xl">B</span>
                        </div>
                        <span className="text-2xl font-bold text-[#1A3C6E] tracking-tight">Belio <span className="font-light text-[#666]">Seller Center</span></span>
                    </div>
                    <div className="text-sm">
                        {isLoginMode ? "Belum punya akun?" : "Sudah menjadi penjual?"} <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-[#1A3C6E] font-bold hover:underline">{isLoginMode ? "Daftar di sini" : "Masuk di sini"}</button>
                    </div>
                </header>

                <div className="flex-1 flex w-full">
                    {/* Kiri: Banner Promosi (disembunyikan di mobile) */}
                    <div className="hidden lg:flex flex-col flex-1 bg-gradient-to-br from-[#1A3C6E] to-[#0D2342] text-white p-16 relative overflow-hidden items-center justify-center text-center">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}></div>
                        
                        <div className="relative z-10 max-w-lg">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl mx-auto mb-8 flex items-center justify-center border border-white/20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                            </div>
                            <h1 className="text-4xl font-extrabold mb-6 leading-tight">Jangkau Jutaan Pembeli di Seluruh Indonesia</h1>
                            <p className="text-lg text-blue-100/80 mb-10 leading-relaxed">
                                Buka tokomu sekarang dengan 0% komisi untuk 30 hari pertama. Gratis ongkir se-Indonesia dan nikmati dukungan penuh dari tim Belio.
                            </p>
                            
                            <div className="flex gap-4 justify-center">
                                <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20 backdrop-blur-sm">
                                    <h3 className="font-bold text-[#F5A623] text-2xl">0%</h3>
                                    <p className="text-xs text-blue-100">Komisi Awal</p>
                                </div>
                                <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20 backdrop-blur-sm">
                                    <h3 className="font-bold text-[#F5A623] text-2xl">24/7</h3>
                                    <p className="text-xs text-blue-100">Dukungan</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kanan: Form Pendaftaran (mengadopsi layout login/register) */}
                    <div className="flex-1 bg-[#F9FAFB] lg:bg-white flex items-center justify-center p-6 md:p-12">
                        <div className="w-full max-w-[420px] bg-white p-8 rounded-3xl lg:rounded-none lg:p-0 shadow-xl lg:shadow-none border border-[#E5E7EB] lg:border-none">
                            
                            <h2 className="text-3xl font-bold text-[#1A3C6E] mb-2">{isLoginMode ? "Masuk ke Dasbor" : "Buat Akun Penjual"}</h2>
                            <p className="text-[#666] mb-8 text-sm">{isLoginMode ? "Selamat datang kembali! Masukkan nomor Anda untuk melanjutkan." : "Gunakan nomor HP atau email untuk mendaftar. Langkah awal untuk kesuksesan bisnismu."}</p>
                            
                            {authStep === 'input_otp' ? (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="bg-blue-50 text-[#1A3C6E] p-4 rounded-xl text-sm border border-blue-100 mb-6">
                                        Kode OTP 6-digit telah dikirim melalui <strong>{otpChannel}</strong> ke nomor +62{phone}.
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="block text-sm font-semibold text-[#333]">Kode OTP</label>
                                            <button className="text-sm text-[#1A3C6E] font-bold hover:underline">Kirim Ulang</button>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="Masukkan 6 Digit OTP" 
                                            className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E] text-center tracking-widest text-xl font-bold font-mono"
                                        />
                                    </div>

                                    <button 
                                        onClick={handleVerifyOtp} 
                                        disabled={isSubmitting}
                                        className="w-full mt-4 bg-[#1A3C6E] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2A5FA0] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                                    </button>
                                    
                                    <button 
                                        onClick={() => setAuthStep("select_otp")} 
                                        className="w-full mt-2 bg-white text-[#666] py-3 rounded-xl font-bold text-sm border border-[#D1D5DB] hover:bg-gray-50 transition-colors"
                                    >
                                        Ubah Metode Verifikasi
                                    </button>
                                </div>
                            ) : authStep === 'select_otp' ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <h3 className="text-lg font-bold text-[#1A3C6E] mb-2">Pilih Metode Verifikasi</h3>
                                    <p className="text-sm text-[#666] mb-4">Pilih cara pengiriman kode OTP untuk nomor +62{phone}</p>
                                    
                                    <button onClick={() => handleSelectOtpChannel('WhatsApp')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#D1D5DB] hover:bg-[#F0FDF4] hover:border-green-400 transition-colors">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-[#333]">WhatsApp</div>
                                            <div className="text-xs text-[#888]">Lebih cepat dan direkomendasikan</div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </button>

                                    <button onClick={() => handleSelectOtpChannel('SMS')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#D1D5DB] hover:bg-[#EFF6FF] hover:border-blue-400 transition-colors">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-[#333]">SMS Biasa</div>
                                            <div className="text-xs text-[#888]">Pastikan pulsa Anda mencukupi</div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </button>

                                    <button onClick={() => handleSelectOtpChannel('Panggilan Telepon')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#D1D5DB] hover:bg-[#F5F3FF] hover:border-purple-400 transition-colors">
                                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-[#333]">Panggilan Telepon</div>
                                            <div className="text-xs text-[#888]">Robot kami akan menelepon Anda</div>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </button>
                                    
                                    <button 
                                        onClick={() => setAuthStep("phone")} 
                                        className="w-full mt-4 text-[#666] py-3 rounded-xl font-bold text-sm hover:underline transition-colors"
                                    >
                                        Kembali
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
                                    {authMethod !== 'phone' && (
                                        <div className="bg-blue-50 text-[#1A3C6E] p-4 rounded-xl text-sm border border-blue-100 mb-6">
                                            Anda mendaftar menggunakan akun {authMethod.charAt(0).toUpperCase() + authMethod.slice(1)}. Untuk keamanan, harap tautkan dan verifikasi nomor handphone Anda.
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-semibold text-[#333] mb-2">Negara / Wilayah</label>
                                        <select className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E] bg-white appearance-none text-[#333]">
                                            <option>Indonesia</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#333] mb-2">Nomor Telepon</label>
                                        <div className="flex relative">
                                            <div className="absolute left-0 top-0 bottom-0 px-4 flex items-center justify-center border-r border-[#D1D5DB] bg-[#F3F4F6] rounded-l-xl text-[#666] font-semibold text-sm">
                                                +62
                                            </div>
                                            <input 
                                                type="text" 
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                                placeholder="81234567890" 
                                                className="w-full border border-[#D1D5DB] rounded-xl pl-[72px] pr-4 py-3 focus:outline-none focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E] transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Slider Puzzle Mockup */}
                                    <div className="h-12 bg-[#F3F4F6] border border-[#D1D5DB] rounded-xl flex items-center justify-center relative overflow-hidden group cursor-not-allowed mt-2">
                                        <div className="absolute left-1 top-1 bottom-1 w-12 bg-white rounded-lg shadow-sm border border-[#E5E7EB] flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
                                        </div>
                                        <span className="text-xs text-[#888] ml-8 font-semibold tracking-wide">Geser untuk memverifikasi</span>
                                    </div>

                                    <button 
                                        onClick={handleLoginNext} 
                                        className="w-full mt-4 bg-[#F5A623] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#E09612] transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                                    >
                                        Selanjutnya
                                    </button>
                                    
                                    <div className="relative flex items-center justify-center mt-8 mb-6">
                                        <div className="absolute w-full h-px bg-[#E5E7EB]"></div>
                                        <span className="relative bg-white px-4 text-xs text-[#888] font-semibold">{isLoginMode ? "ATAU MASUK DENGAN" : "ATAU DAFTAR DENGAN"}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                        <button onClick={() => handleSocialLogin('google')} className="h-12 border border-[#D1D5DB] rounded-xl flex items-center justify-center hover:bg-[#F9FAFB] transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4"/></svg>
                                        </button>
                                        <button onClick={() => handleSocialLogin('apple')} className="h-12 border border-[#D1D5DB] rounded-xl flex items-center justify-center hover:bg-[#F9FAFB] transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M17.527 10.925c-.046-2.585 2.124-3.834 2.221-3.896-1.196-1.748-3.056-1.981-3.71-2.008-1.58-.158-3.088.924-3.893.924-.8 0-2.039-.906-3.336-.883-1.688.026-3.242.977-4.116 2.483-1.76 3.033-.448 7.514 1.282 9.987.842 1.206 1.84 2.561 3.14 2.515 1.246-.051 1.73-.801 3.237-.801 1.503 0 1.933.801 3.235.772 1.344-.025 2.198-1.222 3.032-2.43 1.018-1.468 1.439-2.894 1.46-2.972-.03-.013-2.791-1.062-2.852-4.491zM15.419 4.606c.691-.827 1.157-1.979 1.029-3.13-.988.04-2.19.653-2.903 1.493-.564.654-1.127 1.833-.974 2.964 1.1.085 2.158-.493 2.848-1.327z" fill="#000"/></svg>
                                        </button>
                                        <button onClick={() => handleSocialLogin('facebook')} className="h-12 border border-[#D1D5DB] rounded-xl flex items-center justify-center hover:bg-[#F9FAFB] transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" fill="#1877F2"/></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Tiga Langkah Pendaftaran
    return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans flex flex-col text-[#333333]">
            <Toaster position="top-center" />
            
            {/* Topbar Belio */}
            <header className="bg-white h-[72px] flex items-center justify-between px-8 shadow-sm shrink-0 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1A3C6E] to-[#2A5FA0] rounded-lg flex items-center justify-center shadow-inner">
                        <span className="text-white font-black text-xl">B</span>
                    </div>
                    <span className="text-xl font-bold text-[#1A3C6E] tracking-tight">Belio <span className="font-light text-[#666]">Seller Center</span></span>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold">
                    <span className="text-[#666] hidden md:block">Login sebagai: +62{phone}</span>
                    <button onClick={() => setStep(0)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Keluar</button>
                </div>
            </header>

            <div className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-6 mt-2">
                
                {/* Left Content Area (Form) */}
                <div className="flex-1 flex flex-col gap-6">
                    
                    {/* Header Banner */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB] flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#1A3C6E]/5 rounded-full flex items-center justify-center text-[#1A3C6E]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-[#1F2937] mb-1">Mulai bangun tokomu sekarang!</h1>
                            <p className="text-[#6B7280]">Ceritakan pada kami tentang bisnismu untuk mulai berjualan di Belio.</p>
                        </div>
                    </div>

                    {/* Step 1: Tipe Penjual */}
                    {step === 1 && (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E7EB] animate-in fade-in duration-500">
                            <h2 className="text-xl font-bold mb-6 text-[#1F2937]">Tipe Penjual</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <label className={`relative p-6 border-[2.5px] rounded-xl cursor-pointer transition-all hover:border-[#F5A623] hover:shadow-md ${businessType === 'Individu' ? 'border-[#F5A623] bg-[#F5A623]/5' : 'border-[#E5E7EB] bg-white'}`}>
                                    <input type="radio" name="businessType" value="Individu" className="absolute top-6 right-6 w-5 h-5 accent-[#F5A623]" checked={businessType === 'Individu'} onChange={() => setBusinessType('Individu')} />
                                    <div className="w-14 h-14 bg-blue-100/50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-[#1F2937]">Penjual Individu</h3>
                                    <p className="text-sm text-[#6B7280]">Saya berjualan/menjual menggunakan nama saya sendiri. (Membutuhkan KTP pribadi)</p>
                                    <a href="#" className="text-[#1A3C6E] text-xs font-bold mt-4 inline-block hover:underline">Lihat persyaratan</a>
                                </label>
                                
                                <label className={`relative p-6 border-[2.5px] rounded-xl cursor-pointer transition-all hover:border-[#F5A623] hover:shadow-md ${businessType === 'Perusahaan' ? 'border-[#F5A623] bg-[#F5A623]/5' : 'border-[#E5E7EB] bg-white'}`}>
                                    <input type="radio" name="businessType" value="Perusahaan" className="absolute top-6 right-6 w-5 h-5 accent-[#F5A623]" checked={businessType === 'Perusahaan'} onChange={() => setBusinessType('Perusahaan')} />
                                    <div className="w-14 h-14 bg-indigo-100/50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 text-[#1F2937]">Penjual Korporat</h3>
                                    <p className="text-sm text-[#6B7280]">Saya terdaftar sebagai Penjual Korporat. (Membutuhkan NIB/NPWP Badan Usaha)</p>
                                    <a href="#" className="text-[#1A3C6E] text-xs font-bold mt-4 inline-block hover:underline">Lihat persyaratan</a>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Dokumen ID */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* Upload Area */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E7EB]">
                                <h2 className="text-xl font-bold mb-6 text-[#1F2937]">Unggah Dokumen ID</h2>
                                
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold mb-3 text-[#1F2937]"><span className="text-red-500">*</span> Jenis ID <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg></label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="idType" value="KTP" checked={idType === 'KTP'} onChange={() => setIdType('KTP')} className="w-5 h-5 accent-[#1A3C6E]" />
                                            <span>KTP</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="idType" value="Passport" checked={idType === 'Passport'} onChange={() => setIdType('Passport')} className="w-5 h-5 accent-[#1A3C6E]" />
                                            <span>Passport</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-1 text-[#1F2937]"><span className="text-red-500">*</span> Unggah Dokumen ID <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg></label>
                                    <p className="text-xs text-[#888] mb-4">Ukuran antara 330x330 dan 5000x5000 px, dan ukuran gambar di bawah 10M. Silakan unggah foto yang serupa dengan contoh.</p>
                                    
                                    <div className="flex flex-col md:flex-row gap-6 bg-[#F9FAFB] p-6 rounded-xl border border-[#E5E7EB]">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-semibold mb-3">Unggah Dokumen ID</span>
                                            <div className="w-48 h-48 border border-[#D1D5DB] rounded-xl flex flex-col items-center justify-center bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer relative overflow-hidden group shadow-sm">
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                                                {idFile ? (
                                                    <div className="text-center p-4">
                                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </div>
                                                        <span className="text-sm font-semibold text-green-600 line-clamp-2">{idFile.name}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 bg-[#EBF2FA] text-[#1A3C6E] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                        </div>
                                                        <span className="text-sm text-[#666] text-center px-4">Seret atau Klik untuk<br/>Mengunggah</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col items-center md:items-start justify-center">
                                            <span className="text-sm text-blue-600 hover:underline cursor-pointer mb-3 text-center md:text-left">Anda dapat mengikuti jenis sampel ini. Daftar lengkap di bawah ini.</span>
                                            <div className="w-full h-40 bg-white border border-gray-200 rounded-lg shadow-inner flex items-center justify-center relative overflow-hidden">
                                                {/* KTP Mockup */}
                                                <div className="w-56 h-36 bg-cyan-100 rounded border border-cyan-200 relative p-3">
                                                    <div className="text-[6px] text-center font-bold mb-1">PROVINSI DKI JAKARTA</div>
                                                    <div className="text-[5px] font-bold">NIK : <span className="bg-red-100/50">91061234567890123</span></div>
                                                    <div className="absolute right-3 top-6 w-10 h-14 bg-red-400 rounded-sm"></div>
                                                    <div className="absolute left-2 bottom-2 right-16 space-y-1">
                                                        <div className="h-1 bg-cyan-600/30 w-3/4"></div>
                                                        <div className="h-1 bg-cyan-600/30 w-full"></div>
                                                        <div className="h-1 bg-cyan-600/30 w-5/6"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full md:w-1/3 text-sm text-[#1F2937] leading-relaxed pt-8 md:pt-4">
                                            Silakan siapkan ID yang jelas (paspor untuk orang asing) dengan <strong>Nama Depan dan Belakang</strong>, <strong>Tanggal Lahir dan Tanggal Kedaluwarsa</strong> yang terlihat, tanpa objek yang menutupi.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Area */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E7EB]">
                                <h2 className="text-xl font-bold mb-6 text-[#1F2937]">Verifikasi Informasi ID</h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-[#1F2937]"><span className="text-red-500">*</span> Nama pada ID (Harus persis sama) <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg></label>
                                        <input 
                                            type="text" 
                                            value={idName}
                                            onChange={(e) => setIdName(e.target.value.toUpperCase())}
                                            placeholder="Masukkan persis seperti foto yang diunggah" 
                                            className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E] uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-[#1F2937]"><span className="text-red-500">*</span> Nomor Kartu Identitas atau Nomor Paspor <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg></label>
                                        <input 
                                            type="text" 
                                            value={idNumber}
                                            onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Nomor resmi pada ID" 
                                            className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E] font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Dokumen Bank */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* Upload Area */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E7EB]">
                                <h2 className="text-xl font-bold mb-6 text-[#1F2937]">Unggah Dokumen Bank</h2>
                                
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold mb-3 text-[#1F2937]"><span className="text-red-500">*</span> Jenis dokumen bank</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="bankType" value="Lokal" checked={bankType === 'Lokal'} onChange={() => setBankType('Lokal')} className="w-5 h-5 accent-[#1A3C6E]" />
                                            <span>Rekening bank lokal</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-[#888]">
                                            <input type="radio" name="bankType" value="Ewallet" disabled className="w-5 h-5" />
                                            <span>Penyedia Layanan Pembayaran</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-1 text-[#1F2937]"><span className="text-red-500">*</span> Unggah Dokumen Bank <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg></label>
                                    <p className="text-xs text-[#888] mb-4">Ukuran antara 330x330 dan 5000x5000 px, dan ukuran gambar di bawah 10M. Silakan unggah foto yang serupa dengan contoh.</p>
                                    
                                    <div className="flex flex-col md:flex-row gap-6 bg-[#F9FAFB] p-6 rounded-xl border border-[#E5E7EB]">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-semibold mb-3">Unggah Dokumen Bank</span>
                                            <div className="w-48 h-48 border border-[#D1D5DB] rounded-xl flex flex-col items-center justify-center bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer relative overflow-hidden group shadow-sm">
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" onChange={(e) => setBankFile(e.target.files?.[0] || null)} />
                                                {bankFile ? (
                                                    <div className="text-center p-4">
                                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </div>
                                                        <span className="text-sm font-semibold text-green-600 line-clamp-2">{bankFile.name}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 bg-[#EBF2FA] text-[#1A3C6E] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                        </div>
                                                        <span className="text-sm text-[#666] text-center px-4">Seret atau Klik untuk<br/>Mengunggah</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col items-center">
                                            <span className="text-sm text-blue-600 hover:underline cursor-pointer mb-3 text-center">Anda dapat mengikuti jenis sampel ini. Daftar lengkap di bawah ini.</span>
                                            <div className="w-full h-48 bg-gray-300 rounded-xl relative overflow-hidden flex items-center justify-center">
                                                {/* Buku Rekening Mockup */}
                                                <div className="w-64 h-40 bg-white shadow-lg relative rounded overflow-hidden">
                                                    <div className="h-6 bg-blue-500 w-full mb-4 px-2 py-1 flex justify-end">
                                                        <div className="bg-white text-blue-600 text-[6px] px-1 rounded-sm font-bold flex items-center">Simpedes</div>
                                                    </div>
                                                    <div className="px-4 space-y-2">
                                                        <div className="flex gap-2 text-[8px]"><div className="w-16 font-bold">Kantor Bank</div><div>: Cabang Ps. Turi</div></div>
                                                        <div className="flex gap-2 text-[8px]"><div className="w-16 font-bold">Nomor Rekening</div><div className="border border-red-500 bg-red-100/50 px-1">: 0123-456-789</div></div>
                                                        <div className="flex gap-2 text-[8px]"><div className="w-16 font-bold">Nama</div><div className="border border-red-500 bg-red-100/50 px-1">: Budi Susanto</div></div>
                                                    </div>
                                                    <div className="absolute right-8 bottom-4 text-xl font-signature rotate-[-10deg]">Signature</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full md:w-1/4 text-sm text-[#1F2937] leading-relaxed pt-8 md:pt-4 font-semibold">
                                            Individual seller example
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Area */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E5E7EB]">
                                <h2 className="text-xl font-bold mb-6 text-[#1F2937]">Verifikasi Informasi Bank</h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-[#1F2937]"><span className="text-red-500">*</span> Bank <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg></label>
                                        <select 
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E] bg-white text-[#333]"
                                        >
                                            <option value="">Nama Bank</option>
                                            {BANK_OPTIONS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-[#1F2937]"><span className="text-red-500">*</span> Nama Akun <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg></label>
                                        <input 
                                            type="text" 
                                            value={bankHolder}
                                            onChange={(e) => setBankHolder(e.target.value.toUpperCase())}
                                            placeholder="Nama Depan dan Belakang" 
                                            className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E] uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-[#1F2937]"><span className="text-red-500">*</span> Nomor Akun <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg></label>
                                        <input 
                                            type="text" 
                                            value={bankAccount}
                                            onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Nomor Rekening Bank" 
                                            className="w-full border border-[#D1D5DB] rounded-xl px-4 py-3 focus:outline-none focus:border-[#1A3C6E] focus:ring-1 focus:ring-[#1A3C6E] font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Bottom Action Bar */}
                    <div className="bg-transparent flex justify-end gap-3 sticky bottom-4 z-10 pt-4">
                        <button className="px-6 py-2.5 rounded-lg font-bold text-[#1A3C6E] bg-white border border-[#D1D5DB] hover:bg-gray-50 transition-colors shadow-sm">
                            Simpan Draf
                        </button>
                        {step < 3 ? (
                            <button onClick={handleNext} className="px-8 py-2.5 bg-[#4B84F3] text-white rounded-lg font-bold hover:bg-[#386cd1] transition-colors shadow-sm">
                                Lanjutkan
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2.5 bg-[#4B84F3] text-white rounded-lg font-bold hover:bg-[#386cd1] transition-colors shadow-sm disabled:opacity-70">
                                {isSubmitting ? 'Memproses...' : 'Kirim'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Sidebar (Progress & FAQ) */}
                <div className="w-full lg:w-[280px] flex flex-col gap-6 shrink-0">
                    
                    {/* Progress Tracker (Vertical) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
                        <div className="relative pl-3 space-y-6">
                            <div className="absolute left-[0.875rem] top-3 bottom-3 w-px bg-[#E5E7EB] z-0"></div>
                            
                            <div className="absolute left-[0.875rem] top-3 w-px bg-[#4B84F3] z-0 transition-all duration-500" style={{ height: step === 1 ? '0' : step === 2 ? '50%' : '100%' }}></div>

                            <div className="relative z-10 flex items-center gap-3 cursor-pointer" onClick={() => step > 1 && setStep(1)}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 1 ? 'bg-[#4B84F3]' : 'bg-[#E5E7EB]'}`}>
                                    {step > 1 ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> : <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </div>
                                <span className={`text-sm ${step === 1 ? 'text-[#1F2937] font-semibold' : 'text-[#6B7280]'}`}>Tipe Penjual</span>
                            </div>

                            <div className="relative z-10 flex items-center gap-3 cursor-pointer" onClick={() => step > 2 && setStep(2)}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 2 ? 'bg-[#4B84F3]' : 'bg-[#E5E7EB]'}`}>
                                    {step > 2 ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> : (step === 2 ? <div className="w-1.5 h-1.5 bg-white rounded-full"></div> : null)}
                                </div>
                                <span className={`text-sm ${step === 2 ? 'text-[#1F2937] font-semibold' : 'text-[#6B7280]'}`}>Unggah Dokumen ID</span>
                            </div>

                            <div className="relative z-10 flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${step >= 3 ? 'bg-[#4B84F3]' : 'bg-[#E5E7EB]'}`}>
                                    {step === 3 && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </div>
                                <span className={`text-sm ${step === 3 ? 'text-[#1F2937] font-semibold' : 'text-[#6B7280]'}`}>Unggah Dokumen Bank</span>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Card */}
                    <div className="bg-[#EEF2FF] p-6 rounded-2xl border border-blue-100 text-[#1A3C6E]">
                        <div className="flex items-center gap-2 mb-4 text-[#4B84F3]">
                            <h3 className="font-bold text-lg">FAQ</h3>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto opacity-70"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </div>
                        
                        {step === 1 && (
                            <div className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-bold mb-1 leading-tight">1. Apa bedanya Penjual Individu dan Korporat?</h4>
                                    <p className="opacity-80 text-xs mt-1">Individu cukup menggunakan KTP pribadi. Korporat wajib memiliki dokumen legalitas seperti NIB dan NPWP Badan Usaha.</p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-5 text-sm">
                                <div>
                                    <h4 className="font-bold mb-1 leading-tight">1. Apakah warga negara lokal dapat mengunggah paspor alih-alih kartu identitas?</h4>
                                    <p className="opacity-80 text-xs mt-1">Hanya orang asing yang dapat mengunggah paspor.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1 leading-tight">2. Jika identitas saya buram/tidak jelas, apakah saya bisa mendapatkan persetujuan?</h4>
                                    <p className="opacity-80 text-xs mt-1">Kami membutuhkan informasi yang jelas dan visibilitas penuh dari identitas Anda tanpa ada objek yang menutupinya.</p>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-bold mb-1 leading-tight">1. Rekening siapa yang harus saya gunakan?</h4>
                                    <p className="opacity-80 text-xs mt-1">Sangat disarankan untuk menggunakan rekening bank yang namanya persis sama dengan dokumen identitas yang Anda daftarkan.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                </div>

            </div>
            
        </div>
    );
}
