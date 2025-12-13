// lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
}

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string)
      .then((mongoose) => mongoose)
      .catch((error) => {
        console.error('MongoDB 연결 실패:', error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// School 스키마
const schoolSchema = new mongoose.Schema({
  sdSchulCode: { type: String, unique: true, required: true },
  atptOfcdcScCode: String,
  schoolName: { type: String, required: true, index: true },
  schoolLevel: String,
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  phoneNumber: String,
  homepageUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const School = mongoose.models.School || mongoose.model('School', schoolSchema);
