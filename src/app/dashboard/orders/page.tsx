import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrdersClient from "./OrdersClient";

export const metadata = {
    title: 'Pesanan Saya - Belio Seller',
};

export default async function OrdersPage() {
    const session = await getSession();
    if (!session.userId) redirect("/");

    const supplier = await prisma.supplier.findFirst({
        where: { userId: session.userId }
    });

    if (!supplier) redirect("/");

    // Ambil pesanan yang memiliki item dari toko ini
    let orders: any[] = [];
    try {
        orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            supplierId: supplier.id
                        }
                    }
                }
            },
            include: {
                items: {
                    where: { product: { supplierId: supplier.id } },
                    include: { product: true }
                },
                user: true
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error("Gagal mengambil pesanan:", e);
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1F2937]">Pesanan Saya</h1>
                    <p className="text-[#6B7280] text-sm mt-1">Kelola pesanan masuk dan atur pengiriman produk Anda.</p>
                </div>
            </div>

            <OrdersClient initialOrders={orders} />
        </div>
    );
}
