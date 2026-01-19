import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return course categories from enum
    const categories = [
      { value: 'SC', label: 'Science Core' },
      { value: 'SE', label: 'Science Elective' },
      { value: 'GR', label: 'General Requirement' },
      { value: 'PC', label: 'Program Core' },
      { value: 'PE', label: 'Program Elective' },
      { value: 'HC', label: 'Humanities Core' },
      { value: 'HE', label: 'Humanities Elective' },
      { value: 'CP', label: 'Capstone Project' },
      { value: 'CT', label: 'Credit Transfer' },
      { value: 'NN', label: 'Non-credit' },
      { value: 'OC', label: 'Other Category' },
    ];

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
