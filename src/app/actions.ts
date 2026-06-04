"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, getSession } from "@/lib/auth";

// --- IMPLEMENTASI REAL AUTH & OTP (MOCK API PIHAK KETIGA) ---

export async function sendOtpCode(phone: string, channel: string) {
    try {
        if (!phone || phone.length < 9) {
            return { success: false, message: "Nomor handphone tidak valid." };
        }

        // Generate 6 digit OTP acak
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Simpan ke database
        await (prisma as any).verificationCode.create({
            data: {
                phone,
                code: otpCode,
                channel,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Kedaluwarsa 5 menit
            }
        });

        // Di sini kita akan memanggil API Pihak Ketiga aslinya (Twilio/Fonnte).
        // Karena belum ada API Key, kita cetak ke console server (Mocking).
        console.log(`\n\n[MOCK OTP SERVICE] MENGIRIM KODE OTP!`);
        console.log(`Penerima: +62${phone}`);
        console.log(`Metode: ${channel}`);
        console.log(`KODE RAHASIA: ${otpCode}`);
        console.log(`----------------------------------------\n\n`);

        return { success: true, mockOtp: otpCode }; // Mengirimkan mockOtp agar bisa ditampilkan di UI
    } catch (error: unknown) {
        console.error("Gagal mengirim OTP", error);
        return { success: false, message: "Terjadi kesalahan sistem saat mengirim kode OTP." };
    }
}

export async function verifyPhoneAndLogin(phone: string, otpCodeInput: string) {
    try {
        if (!phone || phone.length < 9) {
            return { success: false, message: "Nomor handphone tidak valid." };
        }

        // Cek OTP di database
        const validOtp = await (prisma as any).verificationCode.findFirst({
            where: {
                phone,
                code: otpCodeInput,
                used: false,
                expiresAt: { gt: new Date() } // belum kedaluwarsa
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!validOtp) {
            return { success: false, message: "Kode OTP salah atau sudah kedaluwarsa." };
        }

        // Tandai OTP telah digunakan
        await (prisma as any).verificationCode.update({
            where: { id: validOtp.id },
            data: { used: true }
        });

        // Cari user dengan nomor HP ini
        let user: any = await prisma.user.findFirst({
            where: { phone },
            include: { supplier: true }
        });

        // Jika tidak ada, buat akun baru
        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone,
                    name: "Seller " + phone.slice(-4),
                    email: `seller-${phone}@belio.com`, // Email dummy karena email wajib unique di skema
                    role: "user" // Role awal user biasa, nanti di-upgrade ke supplier
                }
            });
        }

        // Buat Sesi (Login)
        const session = await getSession();
        session.userId = user.id;
        session.role = user.role;
        await session.save();

        const isExistingSeller = !!(user as any).supplier || user.role === 'supplier';

        return { success: true, isExistingSeller };
    } catch (error: unknown) {
        return { success: false, message: (error as Error).message };
    }
}

export async function mockGoogleLogin() {
    try {
        // Cari user pertama yang memiliki peran supplier (agar bisa login otomatis pakai Google)
        let user = await prisma.user.findFirst({
            where: { role: "supplier" },
            include: { supplier: true }
        });

        if (!user) {
            // Kalau belum ada supplier, cari user biasa dan jadikan supplier
            user = await prisma.user.findFirst({
                where: { email: { not: undefined } },
                include: { supplier: true }
            });
            
            if (!user) {
                // Buat user dummy jika DB kosong
                user = await prisma.user.create({
                    data: {
                        name: "Google User",
                        email: "googleuser@example.com",
                        phone: "081111111111",
                        role: "user"
                    },
                    include: { supplier: true }
                });
            }
        }

        // Buat Sesi (Login)
        const session = await getSession();
        session.userId = user.id;
        session.role = user.role;
        await session.save();

        const isExistingSeller = !!(user as any).supplier || user.role === 'supplier';
        return { success: true, isExistingSeller };
    } catch (error: unknown) {
        return { success: false, message: (error as Error).message };
    }
}

export async function verifySocialLoginToken(provider: string, token: string) {
    try {
        // DI SINI ADALAH TEMPAT UNTUK MEMVALIDASI FIREBASE TOKEN (API KEY DIBUTUHKAN NANTI)
        // const decodedToken = await admin.auth().verifyIdToken(token);
        // const email = decodedToken.email;
        
        console.log(`[MOCK OAUTH] Memvalidasi token dari ${provider}...`);
        
        // Mocking: Asumsikan validasi berhasil
        return { success: true, message: "Token valid" };
    } catch (error: unknown) {
        return { success: false, message: "Token OAuth tidak valid." };
    }
}

export async function registerSeller(formData: FormData) {
    try {
        const user = await getCurrentUser();
        
        if (!user) {
            return { success: false, message: "Silakan masuk (login) ke aplikasi utama Belio terlebih dahulu." };
        }

        const companyName = formData.get("companyName") as string;
        const businessType = formData.get("businessType") as string || "Individu";
        const province = formData.get("province") as string;
        const city = formData.get("city") as string;
        const phone = formData.get("phone") as string || user.phone || "";
        const bankName = formData.get("bankName") as string;
        const bankAccount = formData.get("bankAccount") as string;
        const bankHolder = formData.get("bankHolder") as string;

        if (!companyName || !province || !city || !bankName || !bankAccount || !bankHolder || !phone) {
            return { success: false, message: "Seluruh data wajib diisi." };
        }

        // Cek apakah sudah ada supplier
        const existingSupplier = await prisma.supplier.findUnique({
            where: { userId: user.id }
        });

        if (existingSupplier) {
            return { success: false, message: "Anda sudah terdaftar sebagai penjual." };
        }

        // Gunakan transaksi agar update role user dan pembuatan profil supplier sukses bersamaan
        await prisma.$transaction([
            prisma.supplier.create({
                data: {
                    userId: user.id,
                    companyName,
                    businessType,
                    province,
                    city,
                    bankName,
                    bankAccount,
                    bankHolder,
                    verified: false
                }
            }),
            prisma.user.update({
                where: { id: user.id },
                data: { 
                    role: "supplier",
                    phone: phone
                }
            })
        ]);

        // Update session
        const session = await getSession();
        if (session.userId) {
            session.role = "supplier";
            await session.save();
        }

        return { success: true, message: "Pendaftaran Berhasil" };
    } catch (error: unknown) {
        return { success: false, message: (error as Error).message };
    }
}

// --- FASE 1: MANAJEMEN PESANAN (SHOPEE STYLE) ---

export async function processShipment(orderId: string) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'supplier') {
            return { success: false, message: "Akses ditolak. Anda bukan penjual." };
        }

        // Generate Resi Dummy (Contoh: JNT-123456789)
        const dummyResi = `JNT-${Math.floor(100000000 + Math.random() * 900000000)}`;

        await prisma.order.update({
            where: { id: orderId },
            data: { 
                status: 'shipped',
                resiNumber: dummyResi
            }
        });

        // Tambah histori tracking
        await (prisma as any).orderTracking.create({
            data: {
                orderId,
                status: 'shipped',
                description: `Pesanan telah diserahkan ke kurir. No Resi: ${dummyResi}`
            }
        });

        return { success: true, resiNumber: dummyResi };
    } catch (error: unknown) {
        return { success: false, message: "Gagal mengatur pengiriman." };
    }
}

export async function completeOrder(orderId: string) {
    try {
        // Hanya untuk simulasi, aslinya ini dipicu oleh pembeli atau cron job
        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'delivered' }
        });

        await (prisma as any).orderTracking.create({
            data: {
                orderId,
                status: 'delivered',
                description: `Pesanan telah diterima oleh pembeli.`
            }
        });

        return { success: true };
    } catch (error: unknown) {
        return { success: false, message: "Gagal menyelesaikan pesanan." };
    }
}

// --- FASE 2: MANAJEMEN PRODUK (SHOPEE STYLE) ---

export async function createProduct(formData: FormData) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'supplier') {
            return { success: false, message: "Akses ditolak." };
        }

        const supplier = await prisma.supplier.findFirst({
            where: { userId: user.id }
        });

        if (!supplier) {
            return { success: false, message: "Toko tidak ditemukan." };
        }

        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const categoryId = formData.get('categoryId') as string;
        const price = parseInt(formData.get('price') as string);
        const stock = parseInt(formData.get('stock') as string);
        const imageUrl = formData.get('imageUrl') as string;
        const customOptionsStr = formData.get('customOptions') as string;
        
        let customOptions = null;
        if (customOptionsStr) {
            customOptions = JSON.parse(customOptionsStr);
        }

        await prisma.product.create({
            data: {
                supplierId: supplier.id,
                name,
                description,
                categoryId,
                price,
                stock,
                imageUrl,
                customOptions,
                unit: "Pieces", // default unit
            }
        });

        return { success: true };
    } catch (error: unknown) {
        return { success: false, message: "Gagal menyimpan produk." };
    }
}

