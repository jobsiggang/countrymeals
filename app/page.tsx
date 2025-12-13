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
        const res = await fetch('/api/schools?limit=100');
        const data = await res.json();
        setSchools(data.schools || []);
      } catch (error) {
        console.error('학교 데이터 로드 실패:', error);
      }
    };

    fetchSchools();
  }, []);

  // 카카오맵 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services`;
    script.async = true;
    script.onload = () => {
      if (!mapContainer.current || !window.kakao) return;

      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 8
      };

      const mapInstance = new window.kakao.maps.Map(mapContainer.current, options);
      setMap(mapInstance);
    };

    document.head.appendChild(script);
  }, []);

  // 마커 표시
  useEffect(() => {
    if (!map || schools.length === 0 || !window.kakao) return;

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
