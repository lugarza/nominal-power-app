import './App.css';
import { useState } from 'react';
import ReactMapboxGl from 'react-mapbox-gl';
import DrawControl from 'react-mapbox-gl-draw';
import Geocoder from 'react-mapbox-gl-geocoder';
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationArrow, faSpinner } from '@fortawesome/free-solid-svg-icons'

const accessToken = 'pk.eyJ1IjoibHVnYXJ6YSIsImEiOiJja3ZpcTB4MnQyY3hnMzBwMXpvY2hsMDJnIn0.91hW0Z_WIsZNywLN6mEEFw';

const Map = ReactMapboxGl({
  accessToken,
  logoPosition: 'top-right',
});

function App() {
  const [initialLocationName, setInitialLocationName] = useState('Cliff House, 1090 Point Lobos, San Francisco, California 94121, United States');
  const [nominalPower, setNominalPower] = useState(0);
  const [center, setCenter] = useState([-122.513987, 37.7784925]);
  const [zoom, setZoom] = useState(19);
  const [geoCode, setGeoCode] = useState('');
  const [hasDrawn, setHasDrawn] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  
  const handleDraw = ({ features }) => {
    /** MapBox GL Draw `features` includes coordinates 
     * for drawn polygon. using `calculateArea` 
     * from (https://stackoverflow.com/questions/62323834/calculate-polygon-area-javascript)
     * to calculate area. Area multiplied by multiplyer to simulate nominal power calculation.
     */

    const coords = features[0].geometry.coordinates[0];
    let area = 0;

    for (let i = 0; i < coords.length; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[(i + 1) % coords.length];

      area += x1 * y2 - x2 * y1
    }

    area = Math.abs(area) / 2;

    const multiplyer = 12000000000;
    //arbitrary multiplier to simulate
    //nominal power calculation

    setNominalPower(area * multiplyer);

    //set flag when user has drawn to remove
    //hint text, show nominal power results
    setHasDrawn(true);
  }

  //handler for address search
  const onSelected = (viewport, item) => {
    setGeoCode(item.place_name);
    setCenter(item.center);
    console.log(item.place_name, item.center)
  }

  const handleMapMove = ({ transform }) => {
    setCenter(transform.center);
  }

  const handleMapZoom = ({ transform }) => {
    setZoom(transform.zoom);
  }

  const handleLocateClick = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition((position) => {
      setCenter([position.coords.longitude, position.coords.latitude]);
      setInitialLocationName(`${position.coords.longitude}, ${position.coords.latitude}`)
      setIsLocating(false);
    });
  }

  return (
    <div className="map__container">

      <Map
        style='mapbox://styles/mapbox/streets-v11' // eslint-disable-line
        containerStyle={{
          height: "100vh",
          width: "100vw",
          position: "absolute",
          top: 0,
          left: 0,
        }}
        center={center}
        onMoveEnd={handleMapMove}
        onZoomEnd={handleMapZoom}
        zoom={[zoom]}
      >
        <DrawControl 
          controls={{polygon: true, trash: true}}
          displayControlsDefault={false}
          onDrawUpdate={handleDraw} 
          onDrawCreate={handleDraw}
          defaultMode={'draw_polygon'}
        />
      </Map>
      <div className="calculator__container">

        <h1>Nominal Power Calculator</h1>
        <label className="geocoder__label">Address
          <Geocoder
            viewport={{}}                
            mapboxApiAccessToken={accessToken}
            initialInputValue={initialLocationName}
            hideOnSelect={true}
            value={geoCode}
            onSelected={onSelected}
            updateInputOnSelect={true}
          />
          <button title="Locate Me" onClick={handleLocateClick} className="geocoder__locate-button">
            {!isLocating && (<FontAwesomeIcon icon={faLocationArrow} />)}
            {isLocating && (<FontAwesomeIcon icon={faSpinner} spin/>)}
          </button>
        </label>

        <div className="nominal-power-result-container">
          {!hasDrawn && (<div>
            <p>Find your property using the map. Then, draw a rectangle around your solar installation to see your nominal power estimation.</p>
          </div>)}
          {hasDrawn && (<div>
            <p>Nominal Power:</p>
            <p className="nominal-total">~{Math.floor(nominalPower)}V</p>
          </div>)}
        </div>
      </div>
    </div>
  );
}

export default App;
