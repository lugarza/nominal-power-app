import './App.css';
import { useRef, useState } from 'react';
import ReactMapboxGl from 'react-mapbox-gl';
import DrawControl from 'react-mapbox-gl-draw';
import Geocoder from 'react-mapbox-gl-geocoder';

import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";


const accessToken = 'pk.eyJ1IjoibHVnYXJ6YSIsImEiOiJja3ZpcTB4MnQyY3hnMzBwMXpvY2hsMDJnIn0.91hW0Z_WIsZNywLN6mEEFw';
const Map = ReactMapboxGl({
  accessToken,
  logoPosition: 'top-right',
});


function App() {
  const map = useRef(null);

  const [nominalPower, setNominalPower] = useState(0);
  const [lng, setLng] = useState(-155.9794816);
  const [lat, setLat] = useState(19.6099322);
  const [zoom, setZoom] = useState(19);
  const [geoCode, setGeoCode] = useState('');


  const handleDraw = ({ features }) => {
    /** MapBox GL Draw features includes coordinates for drawn
     * polygon. using `calculateArea` from (https://stackoverflow.com/questions/62323834/calculate-polygon-area-javascript)
     * to calculate area. Area multiplied by multiplyer to simulate nominal power calculation.
     * 
     * 
     */

    const multiplyer = 12000000000;

    function calculateArea(coords) {
      let area = 0;

      for (let i = 0; i < coords.length; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[(i + 1) % coords.length];

        area += x1 * y2 - x2 * y1
      }

      return Math.abs(area) / 2;
    }

    const area = calculateArea(features[0].geometry.coordinates[0]);


    setNominalPower(area * multiplyer);
  };

  const handleLocateClick = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log("position", position);
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
    });
  }

  const onSelected = (viewport, item) => {
    console.log(item);
    setGeoCode(item.place_name);
    setLng(item.center[0]);
    setLat(item.center[1]);
  }

  const handleMapMove = ({ transform }) => {
    setLng(transform.center.lng);
    setLat(transform.center.lat);
  }

  return (
    <div className="inner">
      <h1>Nominal Power Estimator</h1>
      <div>

        <p>Enter an address to get started.</p>
        <form>
          <label>
            Enter Address:
          </label>
          <Geocoder
            mapboxApiAccessToken={accessToken}
            hideOnSelect={true}
            value={geoCode}
            onSelected={onSelected}
          />
          <button type="button" onClick={handleLocateClick}>Locate Me</button>
        </form>
      </div>
      <div>
        <p>Draw a polygon around your estimated solar installation.</p>
        <Map
          style='mapbox://styles/mapbox/streets-v11' // eslint-disable-line
          containerStyle={{
            height: "30vh",
            width: "100vw",
            maxWidth: "400px"
          }}
          center={[lng, lat]}
          zoom={[zoom]}
          onMoveEnd={handleMapMove}
        >
          <DrawControl onDrawCreate={handleDraw} onDrawUpdate={handleDraw} />
        </Map>

      </div>
      <div className="nominal-power-result-container">
        <p>Nominal Power:</p>
        <p>~{Math.floor(nominalPower)}V</p>
      </div>
    </div>
  );
}

export default App;
