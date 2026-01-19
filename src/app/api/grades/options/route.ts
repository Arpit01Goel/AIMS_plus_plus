import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/grades/options - Get available grade options
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return grades matching the Prisma Grade enum
    const grades = [
      { value: 'A', label: 'A' },
      { value: 'A_MINUS', label: 'A-' },
      { value: 'B', label: 'B' },
      { value: 'B_MINUS', label: 'B-' },
      { value: 'C', label: 'C' },
      { value: 'C_MINUS', label: 'C-' },
      { value: 'D', label: 'D' },
      { value: 'E', label: 'E' },
      { value: 'F', label: 'F' },
      { value: 'I', label: 'I (Incomplete)' },
      { value: 'W', label: 'W (Withdrawn)' },
      { value: 'S', label: 'S (Satisfactory)' },
      { value: 'U', label: 'U (Unsatisfactory)' },
    ];

    return NextResponse.json({ grades });
  } catch (error) {
    console.error('Grade options API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
