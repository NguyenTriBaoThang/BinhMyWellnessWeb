import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId') || undefined;
    const reviews = await db.getReviews(serviceId);
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập để gửi nhận xét.' },
        { status: 401 }
      );
    }

    const { bookingId, rating, text } = await req.json();

    if (!bookingId || !rating || !text) {
      return NextResponse.json(
        { error: 'Vui lòng chọn số sao và nhập nội dung đánh giá.' },
        { status: 400 }
      );
    }

    const review = await db.createReview({
      bookingId,
      userId: user.id,
      userName: user.name,
      rating: Number(rating),
      text,
    });

    return NextResponse.json({
      success: true,
      review,
      message: 'Cảm ơn bạn đã gửi đánh giá trải nghiệm!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Chỉ nhà vườn mới có quyền phản hồi đánh giá.' },
        { status: 403 }
      );
    }

    const { reviewId, replyText } = await req.json();
    if (!reviewId || !replyText) {
      return NextResponse.json(
        { error: 'Vui lòng nhập nội dung phản hồi.' },
        { status: 400 }
      );
    }

    const review = await db.replyReview(reviewId, replyText, user.name);

    return NextResponse.json({
      success: true,
      review,
      message: 'Đã gửi phản hồi cho khách hàng thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
