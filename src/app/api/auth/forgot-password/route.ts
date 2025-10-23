import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email'; // We'll create this
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if the email doesn't exist
      return NextResponse.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpiry = passwordResetExpiry;
    await user.save();

    // Send email with reset link
    const resetUrl = `${process.env.NEXTAUTH_URL}/admin/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return NextResponse.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });

  } catch (error) {
    console.error('Forgot password error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}