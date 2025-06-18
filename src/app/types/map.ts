export interface MapValue {
  lat: number;
  lng: number;
  address: string;
}

export interface MapComponentProps {
  value?: MapValue;
  onChange?: (value: MapValue) => void;
  height?: string;
}

export interface MapSearchProps {
  onSelect: (lat: number, lng: number, address: string) => void;
} 