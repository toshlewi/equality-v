import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    user.password = await hashPassword(password);
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.lastPasswordChange = new Date();
    await user.save();

    return NextResponse.json({ success: true, message: 'Password has been reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to reset password' }, { status: 500 });
  }
}