import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Define order statuses in a constant (or enum if needed in a larger project)
const ORDER_STATUSES = ["CONFIRMED", "PREPARING"];

// GET orders for kitchen (queue)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(token);

    if (!user || (user.role !== "KITCHEN" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optionally: Pagination support
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
    const pageSize = 10; // You can adjust this to your preference

    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ORDER_STATUSES,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { createdAt: "asc" }, // Oldest first (queue order)
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching kitchen orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
