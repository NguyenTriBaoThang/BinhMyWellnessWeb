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

    if (typeof bookingId !== 'string' || !bookingId || !Number.isInteger(Number(rating)) || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng chọn số sao và nhập nội dung đánh giá.' },
        { status: 400 }
      );
    }
    if (Number(rating) < 1 || Number(rating) > 5 || text.trim().length > 2000) {
      return NextResponse.json({ error: 'Số sao phải từ 1 đến 5; đánh giá tối đa 2.000 ký tự.' }, { status: 400 });
    }

    const review = await db.createReview({
      bookingId,
      userId: user.id,
      userName: user.name,
      rating: Number(rating),
      text: text.trim(),
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
    if (typeof reviewId !== 'string' || !reviewId || typeof replyText !== 'string' || !replyText.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng nhập nội dung phản hồi.' },
        { status: 400 }
      );
    }
    if (replyText.trim().length > 2000) {
      return NextResponse.json({ error: 'Phản hồi tối đa 2.000 ký tự.' }, { status: 400 });
    }

    const review = (await db.getReviews()).find((item) => item.id === reviewId);
    if (!review) return NextResponse.json({ error: 'Không tìm thấy đánh giá.' }, { status: 404 });
    if (user.role === 'PROVIDER') {
      const provider = await db.getProviderByUserId(user.id);
      if (!provider || provider.id !== review.providerId) {
        return NextResponse.json({ error: 'Đánh giá này không thuộc nhà vườn của bạn.' }, { status: 403 });
      }
    }

    const updatedReview = await db.replyReview(reviewId, replyText.trim(), user.name);

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: 'Đã gửi phản hồi cho khách hàng thành công!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
