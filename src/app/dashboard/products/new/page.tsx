import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddProductClient from "./AddProductClient";

export const metadata = {
    title: 'Tambah Produk Baru - Belio Seller',
};

export default async function NewProductPage() {
    const session = await getSession();
    if (!session.userId) redirect("/");

    const supplier = await prisma.supplier.findFirst({
        where: { userId: session.userId }
    });

    if (!supplier) redirect("/");

    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#1F2937]">Tambah Produk Baru</h1>
                    <p className="text-[#6B7280] text-sm mt-1">Lengkapi informasi dasar, foto, dan variasi produk Anda.</p>
                </div>
            </div>

            <AddProductClient categories={categories} />
        </div>
    );
}
