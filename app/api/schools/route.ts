// app/api/schools/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB, School } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    const schools = await School.find({})
      .select('_id schoolName schoolLevel address location phoneNumber')
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await School.countDocuments({});

    return NextResponse.json({
      success: true,
      schools,
      total,
      limit,
      skip
    });
  } catch (error) {
    console.error('Schools API 에러:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '서버 에러' },
      { status: 500 }
    );
  }
}
