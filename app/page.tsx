'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

interface School {
  _id: string;
  schoolName: string;
  schoolLevel: string;
  address: string;
  phoneNumber: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
}

// Leaflet 동적 임포트
const MapComponent = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // 학교 데이터 로드
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        console.log('학교 데이터 로드 시작');
        const res = await fetch('/api/schools?limit=100');
        console.log('응답 상태:', res.status);
        const data = await res.json();
        console.log('로드된 학교 수:', data.schools?.length || 0);
        setSchools(data.schools || []);
      } catch (error) {
        console.error('학교 데이터 로드 실패:', error);
      }
    };

    fetchSchools();
  }, []);


  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-blue-600">학교 급식 정보</h1>
          <p className="text-gray-600 text-sm">지도에서 학교를 클릭하여 상세 정보를 확인하세요</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <MapComponent
              schools={schools}
              onSchoolSelect={setSelectedSchool}
            />
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              {selectedSchool ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {selectedSchool.schoolName}
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">학교 등급</p>
                      <p className="text-sm text-gray-700">{selectedSchool.schoolLevel}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">주소</p>
                      <p className="text-sm text-gray-700">{selectedSchool.address}</p>
                    </div>
                    {selectedSchool.phoneNumber && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase">전화</p>
                        <p className="text-sm text-gray-700">{selectedSchool.phoneNumber}</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">지도에서 마커를 클릭하면</p>
                  <p className="text-gray-500 text-sm">학교 정보가 표시됩니다</p>
                  <p className="text-gray-400 text-xs mt-4">({schools.length}개 학교)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
