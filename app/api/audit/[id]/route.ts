import { NextResponse } from 'next/server';
import { getAudit } from '@/lib/storage/audit-store';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Audit ID is required' },
        { status: 400 }
      );
    }

    const audit = getAudit(id);

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error('Error fetching audit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit' },
      { status: 500 }
    );
  }
}
