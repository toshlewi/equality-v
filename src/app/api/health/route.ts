import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'unknown',
        uptime: process.uptime()
      }
    };

    // Check database connection
    try {
      await connectDB();
      health.checks.database = 'connected';
    } catch (error) {
      health.checks.database = 'disconnected';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Health check failed' },
      { status: 503 }
    );
  }
}
