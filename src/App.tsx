import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import styled from "styled-components";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

// Replace with your actual Mapbox access token
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

interface SwimmingSpot {
  id: string;
  name: string;
  transparency: number;
  cleanliness: 'low' | 'medium' | 'high';
  longitude: number;
  latitude: number;
}

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`;

function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [spots, setSpots] = useState<SwimmingSpot[]>([]);
  const [newSpot, setNewSpot] = useState<Partial<SwimmingSpot> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2,
    });

    map.current.on('click', (e) => {
      setNewSpot({
        longitude: e.lngLat.lng,
        latitude: e.lngLat.lat,
      });
      setIsDialogOpen(true);
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    spots.forEach((spot) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = getColorByTransparency(spot.transparency);
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';

      new mapboxgl.Marker(el)
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h3>${spot.name}</h3><p>Transparency: ${spot.transparency}m</p><p>Cleanliness: ${spot.cleanliness}</p>`
          )
        )
        .addTo(map.current!);
    });
  }, [spots]);

  const handleSaveSpot = () => {
    if (newSpot && newSpot.name && newSpot.transparency && newSpot.cleanliness) {
      const spot: SwimmingSpot = {
        id: Date.now().toString(),
        name: newSpot.name,
        transparency: newSpot.transparency,
        cleanliness: newSpot.cleanliness,
        longitude: newSpot.longitude!,
        latitude: newSpot.latitude!,
      };
      setSpots([...spots, spot]);
      setIsDialogOpen(false);
      setNewSpot(null);
    }
  };

  const getColorByTransparency = (transparency: number): string => {
    if (transparency > 10) return '#00ff00';
    if (transparency > 5) return '#ffff00';
    return '#ff0000';
  };

  return (
    <AppContainer>
      <MapContainer ref={mapContainer} />
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Add New Swimming Spot</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Place Name"
            fullWidth
            value={newSpot?.name || ''}
            onChange={(e) => setNewSpot({ ...newSpot, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Water Transparency (meters)"
            type="number"
            fullWidth
            value={newSpot?.transparency || ''}
            onChange={(e) => setNewSpot({ ...newSpot, transparency: Number(e.target.value) })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Cleanliness</InputLabel>
            <Select
              value={newSpot?.cleanliness || ''}
              onChange={(e) => setNewSpot({ ...newSpot, cleanliness: e.target.value as 'low' | 'medium' | 'high' })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSpot}>Save</Button>
        </DialogActions>
      </Dialog>
    </AppContainer>
  );
}

export default App;
