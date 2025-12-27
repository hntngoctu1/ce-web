import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Fetch all data in parallel
    const [
      user,
      profile,
      orders,
      recentOrders,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, createdAt: true },
      }),
      prisma.customerProfile.findUnique({
        where: { userId },
        select: { loyaltyPoints: true },
      }),
      prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          orderStatus: true,
          createdAt: true,
          items: { select: { id: true } },
        },
      }),
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          total: true,
          orderStatus: true,
          createdAt: true,
          items: { select: { id: true } },
        },
      }),
    ]);

    // Calculate stats
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Count by status
    const ordersByStatus = {
      pending: orders.filter(o => o.orderStatus === 'PENDING_CONFIRMATION' || o.orderStatus === 'PENDING').length,
      confirmed: orders.filter(o => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PACKING').length,
      shipped: orders.filter(o => o.orderStatus === 'SHIPPED').length,
      delivered: orders.filter(o => o.orderStatus === 'DELIVERED').length,
    };

    // Calculate monthly spending for last 6 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySpending: { month: string; amount: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const amount = monthOrders.reduce((sum, o) => sum + Number(o.total), 0);
      monthlySpending.push({
        month: monthNames[date.getMonth()],
        amount,
      });
    }

    // Format recent orders
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt.toISOString(),
      total: Number(order.total),
      status: order.orderStatus,
      itemCount: order.items.length,
    }));

    return NextResponse.json({
      user: {
        name: user?.name || 'Customer',
        email: user?.email || '',
        memberSince: user?.createdAt?.toISOString() || now.toISOString(),
      },
      stats: {
        totalOrders,
        totalSpent,
        pendingOrders: ordersByStatus.pending,
        deliveredOrders: ordersByStatus.delivered,
        avgOrderValue,
        loyaltyPoints: profile?.loyaltyPoints || 0,
      },
      recentOrders: formattedRecentOrders,
      monthlySpending,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

