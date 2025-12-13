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

interface MapProps {
  schools: School[];
  onSchoolSelect: (school: School) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function Map({ schools, onSchoolSelect }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [kakaoLoaded, setKakaoLoaded] = useState(false);

  // 카카오맵 SDK 로드
  useEffect(() => {
    if (typeof window === 'undefined' || kakaoLoaded) return;

    if (window.kakao && window.kakao.maps) {
      console.log('✅ 카카오맵 SDK 이미 로드됨');
      setKakaoLoaded(true);
      return;
    }

    const script = document.createElement('script');
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ 카카오맵 SDK 로드 완료');
      setKakaoLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ 카카오맵 SDK 로드 실패');
    };
    
    document.head.appendChild(script);
  }, [kakaoLoaded]);

  // 지도 초기화
  useEffect(() => {
    if (!kakaoLoaded || !mapContainer.current || map.current) return;
    if (!window.kakao || !window.kakao.maps) return;

    console.log('카카오맵 지도 초기화 시작');

    try {
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978),
        level: 8,
      };

      map.current = new window.kakao.maps.Map(mapContainer.current, options);
      console.log('✅ 카카오맵 지도 생성 완료');
    } catch (err) {
      console.error('❌ 지도 생성 중 에러:', err);
    }
  }, [kakaoLoaded]);

  // 마커 표시
  useEffect(() => {
    if (!map.current || schools.length === 0 || !window.kakao) return;

    console.log('마커 생성 시작:', schools.length);

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.kakao.maps.LatLngBounds();
    let hasValidMarker = false;

    schools.forEach((school) => {
      const [lng, lat] = school.location.coordinates;

      try {
        const position = new window.kakao.maps.LatLng(lat, lng);

        const marker = new window.kakao.maps.Marker({
          position,
          title: school.schoolName,
        });

        const infowindow = new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-size: 12px;">
              <strong>${school.schoolName}</strong><br/>
              ${school.address}
            </div>
          `,
        });

        // 마커 클릭 이벤트
        window.kakao.maps.event.addListener(marker, 'click', () => {
          infowindow.open(map.current, marker);
          onSchoolSelect(school);
        });

        marker.setMap(map.current);
        markersRef.current.push(marker);
        bounds.extend(position);
        hasValidMarker = true;
      } catch (err) {
        console.error(`마커 생성 실패 (${school.schoolName}):`, err);
      }
    });

    // 모든 마커가 보이도록 지도 범위 설정
    if (hasValidMarker && map.current) {
      try {
        map.current.setBounds(bounds);
      } catch (err) {
        console.error('지도 범위 설정 실패:', err);
      }
    }

    console.log('✅ 마커 생성 완료:', markersRef.current.length);
  }, [schools, onSchoolSelect]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-96 lg:h-[600px] rounded-lg shadow-lg bg-gray-200"
      style={{ minHeight: '400px' }}
    />
  );
}
