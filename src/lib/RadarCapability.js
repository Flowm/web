import { dwdLayer, greyOverlay } from '../layers/radar';
import { Nowcast } from './Nowcast';
import { reportError } from './Toast';

// eslint-disable-next-line import/prefer-default-export
export class RadarCapability {
  constructor(options) {
    this.layer = null;
    this.map = options.map;
    this.nanobar = options.nanobar;
    this.url = options.tileURL;

    this.numInFlightTiles = 0;
    window.radar = this;

    this.nowcast = new Nowcast({ nanobar: this.nanobar, map: this.map });

    this.nanobar.start(this.url);
    fetch(this.url)
      .then((response) => response.json())
      .then((obj) => {
        const newRadarLayer = this.processRadar(obj.radar);
        this.nowcast.processNowcast(obj.nowcast, obj.radar.upstream_time, obj.radar.processed_time, newRadarLayer);
      })
      .then(() => this.nanobar.finish(this.url))
      .catch((error) => {
        this.nanobar.finish(this.url);
        reportError(error);
      });
  }

  processRadar(obj) {
    const newLayer = dwdLayer(obj.tile_id, { mainLayer: true })[0];
    newLayer.setOpacity(0.85);
    if (this.map) {
      if (this.layer) {
        if (this.layer.getId() === newLayer.getId()) {
          return this.layer;
        }
        this.map.removeLayer(this.layer);
      }
      this.map.addLayer(newLayer);
    }
    this.layer = newLayer;
    return this.layer;
  }

  setTarget(target) {
    this.map.setTarget(target);
  }

  setMap(map) {
    this.map = map;
    this.map.addLayer(greyOverlay());
    if (this.layer) {
      this.map.addLayer(this.layer);
    }
    this.nowcast.setMap(map);
  }

  getMap() {
    return this.map;
  }
}
