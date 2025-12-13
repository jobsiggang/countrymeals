'use client';

import { useEffect, useRef, useState } from 'react';

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

declare global {
  interface Window {
    kakao: any;
  }
}

export default function Home() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
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

  // 카카오맵 초기화
  useEffect(() => {
    console.log('카카오맵 초기화 시작');
    
    if (typeof window === 'undefined') return;

    const initMap = () => {
      if (!mapContainer.current) {
        console.error('mapContainer가 없습니다');
        return;
      }
      if (!window.kakao || !window.kakao.maps) {
        console.warn('window.kakao가 없습니다, 재시도 예정...');
        // 재시도 (최대 30회, 총 15초)
        setTimeout(initMap, 500);
        return;
      }

      try {
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 8
        };

        const mapInstance = new window.kakao.maps.Map(mapContainer.current, options);
        console.log('✅ 지도 생성 완료');
        setMap(mapInstance);
      } catch (err) {
        console.error('지도 생성 중 에러:', err);
      }
    };

    // 카카오맵 SDK 로드 대기
    initMap();
  }, []);

  // 마커 표시
  useEffect(() => {
    console.log('마커 표시 시작 - map:', !!map, 'schools:', schools.length, 'kakao:', !!window.kakao);
    
    if (!map || schools.length === 0 || !window.kakao) return;

    console.log('마커 생성 시작');
    markers.forEach((marker) => marker.setMap(null));

    const newMarkers: any[] = [];
    const bounds = new window.kakao.maps.LatLngBounds();

    schools.forEach((school) => {
      const [lng, lat] = school.location.coordinates;
      const position = new window.kakao.maps.LatLng(lat, lng);

      const marker = new window.kakao.maps.Marker({
        position,
        title: school.schoolName
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedSchool(school);
      });

      marker.setMap(map);
      newMarkers.push(marker);
      bounds.extend(position);
    });

    console.log('마커 생성 완료:', newMarkers.length);
    map.setBounds(bounds);
    setMarkers(newMarkers);
  }, [map, schools]);

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
            <div
              ref={mapContainer}
              className="w-full h-96 lg:h-[600px] rounded-lg shadow-lg bg-gray-200"
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
