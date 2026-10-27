import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectToDb from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/auth/login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    await connectToDb();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid Credentials' }, { status: 400 });
    }
