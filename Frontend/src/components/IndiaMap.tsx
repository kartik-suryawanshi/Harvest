import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useToast } from '@/hooks/use-toast';

interface IndiaMapProps {
  onDistrictSelect: (district: string) => void;
  selectedDistrict: string;
  heightClass?: string; // e.g., 'h-64', 'h-96'
  enableLocate?: boolean;
}

// Custom component to handle map clicks for reverse geocoding
const LocationMarker = ({ 
  onLocationSelect, 
  activeIcon 
}: { 
  onLocationSelect: (district: string, lat: number, lng: number) => void;
  activeIcon: Icon;
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [districtName, setDistrictName] = useState<string | null>(null);
  const { toast } = useToast();

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      try {
        toast({
          title: "Locating...",
          description: "Finding district information for this area.",
          duration: 2000,
        });

        // Reverse geocoding using OpenStreetMap Nominatim
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`);
        if (!response.ok) throw new Error('Geocoding failed');
        
        const data = await response.json();
        
        // Ensure the click is within India
        if (data.address?.country_code !== 'in') {
          toast({
            title: "Outside Service Area",
            description: "Please select a location within India.",
            variant: "destructive",
          });
          return;
        }

        // Extract the best location identifier (state_district, county, or city)
        const district = data.address.state_district || data.address.county || data.address.city || data.address.town;
        
        if (district) {
           const cleanName = district.replace(/ District/i, '');
           setDistrictName(cleanName);
           onLocationSelect(cleanName, lat, lng);
        } else {
           toast({
             title: "Unknown District",
             description: "Could not precisely identify the district for this remote area.",
             variant: "destructive"
           });
        }

      } catch (error) {
        toast({
          title: "Geocoding Error",
          description: "Unable to retrieve location data from the map service.",
          variant: "destructive"
        });
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={activeIcon}>
      <Popup>
        <div className="font-medium text-center">
          {districtName ? `${districtName}, India` : 'Selected Location'}
        </div>
      </Popup>
    </Marker>
  );
};

const IndiaMap = ({ onDistrictSelect, selectedDistrict, heightClass = 'h-64', enableLocate = false }: IndiaMapProps) => {
  // Center map on India roughly
  const defaultCenter: [number, number] = [20.5937, 78.9629];

  // Fix Leaflet default icon URLs for Vite builds
  const defaultIcon = useMemo(() => {
    const iconUrl = new URL('leaflet/dist/images/marker-icon.png', import.meta.url).toString();
    const iconRetinaUrl = new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).toString();
    const shadowUrl = new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).toString();
    return new Icon({
      iconUrl,
      iconRetinaUrl,
      shadowUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }, []);

  const activeIcon = useMemo(() => {
    return new Icon({
      iconUrl: defaultIcon.options.iconUrl as string,
      iconRetinaUrl: defaultIcon.options.iconRetinaUrl as string,
      shadowUrl: defaultIcon.options.shadowUrl as string,
      iconSize: [30, 50],
      iconAnchor: [15, 50],
      popupAnchor: [1, -40],
      shadowSize: [50, 50]
    });
  }, [defaultIcon]);

  return (
    <div className={`w-full ${heightClass} rounded-lg overflow-hidden border border-border relative`}>
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000] bg-background/80 backdrop-blur pb-1 pt-1 px-3 rounded-md shadow text-sm font-medium border border-border">
         Click anywhere on the map to select a district
      </div>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        minZoom={4}
        maxZoom={10}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationMarker 
           onLocationSelect={(district) => onDistrictSelect(district)} 
           activeIcon={activeIcon} 
        />

        {enableLocate && (
          <></>
        )}
      </MapContainer>
    </div>
  );
};

export default IndiaMap;