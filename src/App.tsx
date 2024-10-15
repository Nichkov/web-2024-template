import { useState, useEffect, useRef, useCallback } from "react";
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
import { MAPBOX_ACCESS_TOKEN } from './config';

console.log("App component is rendering");
console.log("Mapbox Access Token:", MAPBOX_ACCESS_TOKEN);
console.log("Mapbox GL JS version:", mapboxgl.version);

if (!MAPBOX_ACCESS_TOKEN) {
  console.error("Mapbox access token is missing!");
}

mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

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
  position: relative;
`;

const MapContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
`;

const DebugInfo = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: white;
  padding: 10px;
  z-index: 1000;
`;

function App() {
  console.log("App function component is executing");

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapInitializedRef = useRef(false);
  const [spots, setSpots] = useState<SwimmingSpot[]>([]);
  const [newSpot, setNewSpot] = useState<Partial<SwimmingSpot> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  console.log("Current state:", { spots, newSpot, isDialogOpen, mapInitialized, mapError });

  const initializeMap = useCallback(() => {
    if (mapInitializedRef.current || !mapContainer.current) return;
    console.log("Initializing map");

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [0, 0],
        zoom: 2,
      });

      console.log("Map instance created:", map.current);

      map.current.on('load', () => {
        console.log("Map loaded successfully");
        setMapInitialized(true);
        mapInitializedRef.current = true;
      });

      map.current.on('error', (e) => {
        console.error("Map error:", e);
        setMapError(e.error.message || "An unknown error occurred");
      });

      map.current.on('click', (e) => {
        console.log("Map clicked:", e.lngLat);
        setNewSpot({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
        });
        setIsDialogOpen(true);
      });

      console.log("Map event listeners set up");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(error instanceof Error ? error.message : "An unknown error occurred");
    }
  }, []);

  useEffect(() => {
    initializeMap();
    return () => {
      if (map.current && mapInitializedRef.current) {
        console.log("Removing map");
        map.current.remove();
        mapInitializedRef.current = false;
      }
    };
  }, [initializeMap]);

  useEffect(() => {
    console.log("Spots effect is running, spots count:", spots.length);
    if (!map.current) {
      console.log("Map is not initialized, skipping spots rendering");
      return;
    }

    spots.forEach((spot, index) => {
      console.log(`Rendering spot ${index}:`, spot);
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
        .addTo(map.current);
      console.log(`Spot ${index} added to map`);
    });
  }, [spots]);

  const handleSaveSpot = () => {
    console.log("Saving new spot:", newSpot);
    if (newSpot && newSpot.name && newSpot.transparency && newSpot.cleanliness) {
      const spot: SwimmingSpot = {
        id: Date.now().toString(),
        name: newSpot.name,
        transparency: newSpot.transparency,
        cleanliness: newSpot.cleanliness,
        longitude: newSpot.longitude!,
        latitude: newSpot.latitude!,
      };
      console.log("New spot created:", spot);
      setSpots([...spots, spot]);
      setIsDialogOpen(false);
      setNewSpot(null);
    } else {
      console.log("Cannot save spot, missing required fields");
    }
  };

  const getColorByTransparency = (transparency: number): string => {
    if (transparency > 10) return '#00ff00';
    if (transparency > 5) return '#ffff00';
    return '#ff0000';
  };

  console.log("Rendering App component");
  return (
    <AppContainer>
      <DebugInfo>
        <p>Map Initialized: {mapInitialized ? "Yes" : "No"}</p>
        <p>Number of Spots: {spots.length}</p>
        {mapError && <p style={{ color: 'red' }}>Error: {mapError}</p>}
      </DebugInfo>
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
            onChange={(e) => {
              console.log("Updating spot name:", e.target.value);
              setNewSpot({ ...newSpot, name: e.target.value });
            }}
          />
          <TextField
            margin="dense"
            label="Water Transparency (meters)"
            type="number"
            fullWidth
            value={newSpot?.transparency || ''}
            onChange={(e) => {
              console.log("Updating spot transparency:", e.target.value);
              setNewSpot({ ...newSpot, transparency: Number(e.target.value) });
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Cleanliness</InputLabel>
            <Select
              value={newSpot?.cleanliness || ''}
              onChange={(e) => {
                console.log("Updating spot cleanliness:", e.target.value);
                setNewSpot({ ...newSpot, cleanliness: e.target.value as 'low' | 'medium' | 'high' });
              }}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            console.log("Cancelling new spot");
            setIsDialogOpen(false);
          }}>Cancel</Button>
          <Button onClick={handleSaveSpot}>Save</Button>
        </DialogActions>
      </Dialog>
    </AppContainer>
  );
}

export default App;
