import { XYZ, TileJSON } from "ol/source";
import TileLayer from "ol/layer/Tile.js";
import TileGrid from "ol/tilegrid/TileGrid";
import {getTopLeft} from "ol/extent";
import {createXYZ} from "ol/tilegrid";
import { transformExtent, get as getProjection } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import {fromExtent} from "ol/geom/Polygon";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import {LinearRing, Polygon} from "ol/geom";
import LayerGroup from "ol/layer/Group";
import ImageLayer from "ol/layer/Image";
import {Raster as RasterSource, Stamen} from 'ol/source';

import { viridis, meteocool_classic } from "./colormaps.js"
import Stroke from "ol/style/Stroke";


var whenMapIsReady = (map, callback) => {
  if (map.get("ready")) {
    callback();
  } else {
    map.once("change:ready", whenMapIsReady.bind(null, map, callback));
  }
};

/**
 * Manages the reflectivity + forecast layers shown on the map.
 */
export class LayerManager {
  constructor (map, mainTileUrl, opacity, enableIOSHooks) {
    //this.numForecastLayers = numForecastLayers;
    //this.forecastLayers = new Array(numForecastLayers);
    this.forecastDownloaded = false;
    this.mainLayer = false;
    this.map = map;
    this.numInFlightTiles = 0;
    this.appHandlers = [];
    this.mainTileUrl = mainTileUrl;
    this.opacity = opacity;
    this.currentForecastNo = -1;
    this.playPaused = false;
    this.enableIOSHooks = enableIOSHooks;
    this.cmap = viridis;

    if (enableIOSHooks) {
      this.appHandlers.push((handler, action) => {
        if (handler in window.webkit.messageHandlers) { window.webkit.messageHandlers[handler].postMessage(action); }
      });
    }

    this.baseURL = "https://s3-meteocool.diecktator.xyz/radar";

    fetch(mainTileUrl)
        .then(response => response.json())
        .then(obj => this.processReflectivity(obj));
  }

  processReflectivity(obj) {
    Object.keys(obj).forEach(k => {
      if (k === "reflectivity") {
        let reflectivitySource = new XYZ({
          url: this.baseURL + "/" + obj[k].tileID + "/{z}/{x}/{-y}.png",
          attributions: ["© DWD"],
          crossOrigin: 'anonymous',
          minZoom: 6,
          maxZoom: 8,
        });
        let reflectivityLayer = new TileLayer({
          source: reflectivitySource,
        });
        // Disable browser upsampling
        reflectivityLayer.on("prerender", (evt) => {
          evt.context.imageSmoothingEnabled = false;
          evt.context.msImageSmoothingEnabled = false;
        });

        let dwdExtent = fromExtent(transformExtent([-180, -90, 180, 90], "EPSG:4326", "EPSG:3857"));
        dwdExtent.appendLinearRing(new LinearRing([ [ 1034618.938519631396048, 5915667.128509047441185 ], [ 1030687.188906410243362, 5912215.195942271500826 ], [ 1013147.529199799522758, 5899572.989446562714875 ], [ 994504.746862779487856, 5888691.544213188812137 ], [ 974930.541431539459154, 5879662.355275601148605 ], [ 954603.25781180197373, 5872560.834361313842237 ], [ 933706.542002218426205, 5867445.971471977420151 ], [ 912428.006043823435903, 5864360.079555860720575 ], [ 890957.901027443469502, 5863328.61641129758209 ], [ 869487.796011063153856, 5864360.079555860720575 ], [ 848209.260052668163553, 5867445.971471977420151 ], [ 827312.544243085198104, 5872560.834361313842237 ], [ 806985.260623347130604, 5879662.355275601148605 ], [ 787411.055192107218318, 5888691.544213188812137 ], [ 768768.272855087067001, 5899572.989446562714875 ], [ 751228.61314847599715, 5912215.195942271500826 ], [ 734955.776891155401245, 5926511.014207645319402 ], [ 720104.105594884604216, 5942338.168196578510106 ], [ 706817.217490458046086, 5959559.891965288668871 ], [ 695226.646405057399534, 5978025.685513207688928 ], [ 685450.492430707905442, 5997572.200586714781821 ], [ 677592.096314958529547, 6018024.267069960013032 ], [ 671738.752716278308071, 6039196.069835996255279 ], [ 667960.480801692116074, 6060892.484486170113087 ], [ 666308.873992781038396, 6082910.578176631592214 ], [ 666816.053823290276341, 6105041.278650861233473 ], [ 669493.755658842390403, 6127071.210630105808377 ], [ 674332.57622026768513, 6148784.69386934582144 ], [ 681301.414202155196108, 6169965.891530902124941 ], [ 690347.135539236594923, 6190401.091195970773697 ], [ 701394.493812140310183, 6209881.094034541398287 ], [ 714346.333706682082266, 6228203.680671948008239 ], [ 718830.624748334288597, 6233364.324402661062777 ], [ 706550.010630112257786, 6233952.942671443335712 ], [ 684342.147880969801918, 6237166.002830564975739 ], [ 662530.292433175025508, 6242492.039749210700393 ], [ 641309.135831821127795, 6249887.570016100071371 ], [ 620869.382232033880427, 6259291.94366452191025 ], [ 601396.398882367415354, 6270627.579310413450003 ], [ 583068.851256607915275, 6283800.278230023570359 ], [ 566057.321687204996124, 6298699.625929260626435 ], [ 550522.912197898724116, 6315199.491326851770282 ], [ 536615.834481606259942, 6333158.634996920824051 ], [ 524473.992622156394646, 6352421.438911398872733 ], [ 514221.567199763376266, 6372818.770689545199275 ], [ 505967.612812569481321, 6394168.99539197050035 ], [ 499804.684724321530666, 6416279.147271575406194 ], [ 495807.514210545166861, 6438946.272495603188872 ], [ 494031.756082412961405, 6461958.951570763252676 ], [ 494512.835636734729633, 6485099.006947807967663 ], [ 497264.925688778166659, 6508143.396996513009071 ], [ 502280.08713220176287, 6530866.292220837436616 ], [ 509527.608351670438424, 6553041.32328593172133 ], [ 518953.579493312106933, 6574443.983290696516633 ], [ 530480.7367929299362, 6594854.158967427909374 ], [ 544008.609628053498454, 6614058.757441716268659 ], [ 547312.018261955236085, 6617871.461642012931406 ], [ 546434.596501753898337, 6620135.178081293590367 ], [ 540072.489714985596947, 6642844.942062200047076 ], [ 535934.005260594072752, 6666132.609746533446014 ], [ 534077.440351404598914, 6689781.360593722201884 ], [ 534540.384285894921049, 6713567.211690621450543 ], [ 537338.624328397214413, 6737260.947090916335583 ], [ 542465.215830458095297, 6760630.242858301848173 ], [ 549889.754552908474579, 6783441.978082964196801 ], [ 559557.890128419152461, 6805464.714479131624103 ], [ 571391.118995031225495, 6826471.318791628815234 ], [ 585286.89265352638904, 6846241.693479917943478 ], [ 601119.072550216689706, 6864565.572445821948349 ], [ 614869.588413286604919, 6877579.601438967511058 ], [ 613923.090057758265175, 6878128.447226099669933 ], [ 594165.470159664750099, 6892259.99574982188642 ], [ 575812.168583642342128, 6908250.643883948214352 ], [ 559036.512549231876619, 6925967.4579749815166 ], [ 544000.672464070725255, 6945261.284342084079981 ], [ 530854.145706296549179, 6965967.425407014787197 ], [ 519732.221943148993887, 6987906.457717430777848 ], [ 510754.441942314791959, 7010885.209391250275075 ], [ 504023.066355445422232, 7034697.914189579896629 ], [ 499621.575793363095727, 7059127.558198044076562 ], [ 497613.228515657829121, 7083947.432804184965789 ], [ 498039.707013396080583, 7108922.904164253734052 ], [ 500919.889404163870495, 7133813.404554545879364 ], [ 506248.785561161697842, 7158374.644855793565512 ], [ 513996.680896528763697, 7182361.03995777387172 ], [ 524108.532322692859452, 7205528.330229302868247 ], [ 536503.660736227058806, 7227636.372625338844955 ], [ 551075.782056280062534, 7248452.064873445779085 ], [ 567693.414133234182373, 7267752.355994206853211 ], [ 586200.689574911841191, 7285327.286770080216229 ], [ 606418.594733383739367, 7300982.995364836417139 ], [ 628146.642967297928408, 7314544.616819019429386 ], [ 651164.976268187514506, 7325859.001279508695006 ], [ 675236.874048555735499, 7334797.175131677649915 ], [ 700111.632150249206461, 7341256.472088329493999 ], [ 725527.759885550942272, 7345162.267909379675984 ], [ 751216.429164320928976, 7346469.262665678746998 ], [ 776905.098443091032095, 7345162.267909379675984 ], [ 802321.226178392535076, 7341256.472088329493999 ], [ 827195.984280085889623, 7334797.175131677649915 ], [ 851267.882060454576276, 7325859.001279508695006 ], [ 874286.21536134427879, 7314544.616819025017321 ], [ 895404.006050553871319, 7301363.568234083242714 ], [ 901380.883528896374628, 7312042.905819948762655 ], [ 916101.773367664893158, 7333089.449946608394384 ], [ 932892.322736997972243, 7352605.45204989053309 ], [ 951595.137704708264209, 7370378.211295932531357 ], [ 972029.321302869240753, 7386211.275037438608706 ], [ 993992.161474133143201, 7399927.393066463992 ], [ 1017261.257339915959165, 7411371.289253149181604 ], [ 1041597.062490764074028, 7420412.172644982114434 ], [ 1066745.807760969735682, 7426945.91298345848918 ], [ 1092442.750200615962967, 7430896.812344959937036 ], [ 1118415.680731448577717, 7432218.915115583688021 ], [ 1144388.611262281192467, 7430896.812344959937036 ], [ 1170085.553701927652583, 7426945.91298345848918 ], [ 1195234.298972133081406, 7420412.172644982114434 ], [ 1196066.34187742928043, 7420102.890214405022562 ], [ 1217338.72891775239259, 7433391.275656569749117 ], [ 1240707.217845698352903, 7444886.53832324128598 ], [ 1265147.634086077800021, 7453968.159941430203617 ], [ 1290404.992093054577708, 7460531.428221510723233 ], [ 1316213.257936361711472, 7464500.21832468919456 ], [ 1342298.880266592139378, 7465828.313904590904713 ], [ 1368384.502596822800115, 7464500.21832468919456 ], [ 1394192.768440129701048, 7460531.428221510723233 ], [ 1419450.126447107410058, 7453968.159941430203617 ], [ 1443890.542687485925853, 7444886.53832324128598 ], [ 1467259.031615432351828, 7433391.275656569749117 ], [ 1489314.925710159121081, 7419613.885299709625542 ], [ 1509834.815652309684083, 7403710.488430583849549 ], [ 1528615.107311347266659, 7385859.283012529835105 ], [ 1545474.157770077232271, 7366257.750858470797539 ], [ 1560253.969050650019199, 7345119.681556571274996 ], [ 1572821.434140769764781, 7322672.091158382594585 ], [ 1583069.144494694191962, 7299152.109350265003741 ], [ 1590915.780740413814783, 7274803.901939982548356 ], [ 1596306.118423829786479, 7249875.686605322174728 ], [ 1599210.68805051012896, 7224616.889719106256962 ], [ 1599625.133439975325018, 7199275.481398406438529 ], [ 1599625.133439975325018, 7199275.481398401781917 ], [ 1597569.314652259927243, 7174095.515359135344625 ], [ 1595968.776583794038743, 7165239.524620308540761 ], [ 1616995.876144452486187, 7159785.174455946311355 ], [ 1640541.542319286148995, 7151051.536561622284353 ], [ 1663059.774268160341308, 7139995.088071800768375 ], [ 1684319.475638647563756, 7126741.200518824160099 ], [ 1704105.853911628481001, 7111438.807595373131335 ], [ 1722222.860614689532667, 7094258.042285269126296 ], [ 1738495.243691925657913, 7075387.62378201354295 ], [ 1752770.19105189316906, 7055032.065936120226979 ], [ 1764918.558709936682135, 7033408.778513951227069 ], [ 1774835.69019908644259, 7010745.129106691107154 ], [ 1782441.845447808271274, 6987275.52761649992317 ], [ 1787682.266706310678273, 6963238.587485665455461 ], [ 1790526.916135046863928, 6938874.408876425586641 ], [ 1790969.924320558086038, 6914422.019488244317472 ], [ 1790969.924320558086038, 6914422.019488244317472 ], [ 1789028.791378911118954, 6890116.999181521125138 ], [ 1784743.382686693686992, 6866189.305534233339131 ], [ 1778174.759961272357032, 6842861.309249337762594 ], [ 1769403.885752265807241, 6820346.041199623607099 ], [ 1758530.235767284641042, 6798845.646979603916407 ], [ 1745670.349179211538285, 6778550.040172884240746 ], [ 1738911.35020713834092, 6769856.127115071751177 ], [ 1747392.621542889392003, 6754814.079461007378995 ], [ 1757006.790042384993285, 6732929.802809027954936 ], [ 1764391.912162004038692, 6710260.221148143522441 ], [ 1769493.731977954041213, 6687035.224133369512856 ], [ 1772281.772632200038061, 6663486.425016510300338 ], [ 1772748.863544642459601, 6639844.69828749075532 ], [ 1772748.863544642226771, 6639844.69828749075532 ], [ 1770910.427869613282382, 6616337.882662231102586 ], [ 1766803.568475664127618, 6593188.666855124756694 ], [ 1760485.989816757850349, 6570612.668030012398958 ], [ 1752034.790895995451137, 6548816.706206171773374 ], [ 1741545.161420152522624, 6527997.272343869321048 ], [ 1729129.009511503856629, 6508339.183399415574968 ], [ 1714913.545259168371558, 6490014.414308406412601 ], [ 1699039.840191427618265, 6473181.094559726305306 ], [ 1681661.378623238764703, 6457982.655660158954561 ], [ 1662942.612924028653651, 6444547.115238323807716 ], [ 1643057.531161746010184, 6432986.483667270280421 ], [ 1622188.242375179892406, 6423396.279771087691188 ], [ 1607685.208630376961082, 6418347.241939059458673 ], [ 1609639.036302623804659, 6409524.508620967157185 ], [ 1612371.575711237965152, 6386750.401097802445292 ], [ 1612859.871034595416859, 6363879.216726845130324 ], [ 1612859.871034595416859, 6363879.216726845130324 ], [ 1611117.435732414480299, 6341131.424123068340123 ], [ 1607178.805848014773801, 6318722.779104541055858 ], [ 1601098.546289034420624, 6296862.445784752257168 ], [ 1592950.126475643599406, 6275751.298935756087303 ], [ 1582824.695239518769085, 6255580.4069929048419 ], [ 1570829.781617949483916, 6236529.690868929959834 ], [ 1558185.441126402467489, 6220184.028992302715778 ], [ 1565071.132847265340388, 6199238.066600726917386 ], [ 1569932.592904944904149, 6177395.873023238964379 ], [ 1572619.933281696867198, 6155236.557746439240873 ], [ 1573123.931532915681601, 6132977.095658869482577 ], [ 1573123.931532915681601, 6132977.095658864825964 ], [ 1571456.62830265564844, 6110832.096231625415385 ], [ 1567650.561408694600686, 6089011.795369282364845 ], [ 1561757.837863700231537, 6067720.211519875563681 ], [ 1553849.074218478519469, 6047153.471548604778945 ], [ 1544012.233348981710151, 6027498.3069735057652 ], [ 1532351.382944447221234, 6008930.717152826488018 ], [ 1518985.397720499429852, 5991614.792909303680062 ], [ 1504046.623979607131332, 5975701.691839309409261 ], [ 1487679.521739452844486, 5961328.75511318910867 ], [ 1470039.296378878178075, 5948618.754837102256715 ], [ 1451290.528708188794553, 5937679.26091468334198 ], [ 1431605.809622353175655, 5928602.116717250086367 ], [ 1411164.383082381915301, 5921463.013646592386067 ], [ 1390150.799112427281216, 5916321.155766343697906 ], [ 1368753.576803245814517, 5913219.007010377012193 ], [ 1347163.875972731970251, 5912182.114984688349068 ], [ 1325574.175142217660323, 5913219.007010377012193 ], [ 1304176.952833036193624, 5916321.155766343697906 ], [ 1283163.368863081792369, 5921463.013646592386067 ], [ 1262721.942323110532016, 5928602.116717250086367 ], [ 1262529.655583682935685, 5928690.739583590999246 ], [ 1260170.715606413083151, 5926991.885866511613131 ], [ 1241468.821321735857055, 5916078.062433745712042 ], [ 1221832.977773934602737, 5907022.125033508986235 ], [ 1201442.031395633006468, 5899899.641472334973514 ], [ 1180480.132498363265768, 5894769.721217359416187 ], [ 1159135.399133186787367, 5891674.76148178242147 ], [ 1137598.58934341929853, 5890640.270186190493405 ], [ 1116061.779553651344031, 5891674.76148178242147 ], [ 1094717.046188475098461, 5894769.721217359416187 ], [ 1073755.14729120512493, 5899899.641472334973514 ], [ 1053364.200912904459983, 5907022.125033513642848 ], [ 1034618.938519631396048, 5915667.128509047441185 ] ]))

        let greyOverlay = new VectorLayer({
          title: "Radar 1km Germany",
          displayInLayerSwitcher: false,
          zIndex: 2,
          source: new VectorSource({
            features: [new Feature({
              geometry: dwdExtent,
              name: "DarkOverlay",
            })],
          }),
          style: new Style({
            fill: new Fill({
              color: "rgba(0, 0, 0, 0.1)",
            }),
          }),
        });

        let rasterRadar = new RasterSource({
          sources: [reflectivityLayer],
          operation: function (pixels, data) {
            let dbz = pixels[0][0];
            if (dbz >= data.cmapLength) {
              dbz = data.cmapLength-1;
            }
            pixels[0][0] = data.cmap[dbz][0];
            pixels[0][1] = data.cmap[dbz][1];
            pixels[0][2] = data.cmap[dbz][2];
            pixels[0][3] = data.cmap[dbz][3];
            return pixels[0];
          },
        });
        rasterRadar.on('beforeoperations', (event) => {
          event.data["cmap"] = this.cmap;
          event.data["cmapLength"] = this.cmap.length;
        });

        let rasterRadarImageLayer = new ImageLayer({
          zIndex: 3,
          source: rasterRadar,
        });
        rasterRadarImageLayer.setExtent(transformExtent([2.8125, 45, 19.6875, 56.25], 'EPSG:4326', 'EPSG:3857'));

        let radarLg = new LayerGroup({
          title: "Radar Composite",
          openInLayerSwitcher: false,
          layers: [rasterRadarImageLayer, greyOverlay]
        });
        this.map.addLayer(radarLg);

        var control = document.getElementById("cmap");
        control.addEventListener('input', () => {
            if (control.value === "meteocool_classic") {
              this.cmap = meteocool_classic;
            } else {
              this.cmap = viridis;
            }
          rasterRadar.changed();
        });

      }
    });
  }

  //hook (handler, action) {
  //  // console.log("emitting event " + action + " to handler: " + handler);
  //  this.appHandlers.forEach((h) => {
  //    h(handler, action);
  //  });
  //}

  //playInProgress () {
  //  return this.currentForecastNo !== -1 && !this.playPaused;
  //}

  //getInFlightTiles () {
  //  return this.numInFlightTiles;
  //}

  //smartDownloadAndPlay () {
  //  if (this.playInProgress()) {
  //    clearTimeout(this.activeForecastTimeout);
  //    document.getElementById("nowcastIcon").src = "./player-play.png";
  //    document.getElementById("nowcastIcon").style.display = "";
  //    this.playPaused = true;
  //    return;
  //  }

  //  if (!this.forecastDownloaded) {
  //    document.getElementById("nowcastIcon").style.display = "none";
  //    document.getElementById("nowcastLoading").style.display = "";
  //    this.downloadForecast(() => {
  //      document.getElementById("nowcastLoading").style.display = "none";
  //      document.getElementById("nowcastIcon").style.display = "";
  //      document.getElementById("nowcastIcon").src = "./player-pause.png";
  //      this.playForecast();
  //    });
  //  } else {
  //    document.getElementById("nowcastIcon").style.display = "";
  //    document.getElementById("nowcastIcon").src = "./player-pause.png";
  //    this.playForecast();
  //  }
  //}

  //switchMainLayer (newLayer) {
  //  // invalidate old forecast
  //  if (this.playInProgress()) {
  //    this.removeForecast();
  //  }
  //  this.stopPlay();
  //  // reset internal forecast state
  //  this.invalidateLayers();

  //  // first add & fetch the new layer, then remove the old one to avoid
  //  // having no layer at all at some point.
  //  this.map.addLayer(newLayer);
  //  this.map.removeLayer(this.mainLayer);
  //  this.mainLayer = newLayer;
  //}

  //// invalidate (i.e. throw away) downloaded forecast stuff AND reset map to a
  //// defined state.
  //invalidateLayers () {
  //  this.forecastDownloaded = false;
  //  //this.forecastLayers.forEach((layer) => {
  //  //  if (layer) {
  //  //    this.map.removeLayer(layer["layer"]);
  //  //    layer = false;
  //  //  }
  //  //});
  //  this.hook("scriptHandler", "forecastInvalid");
  //}

  //setForecastLayer (num) {
  //  //if (num === this.currentForecastNo) { return 1; }
  //  //if (!this.forecastDownloaded) { return 2; }
  //  //if (this.playInProgress()) { return 3; }
  //  ////if (num > this.numForecastLayers - 1) { return 4; }

  //  //this.playPaused = true;

  //  //if (num === -1) {
  //  //  this.map.addLayer(this.mainLayer);
  //  //} else {
  //  //  this.map.addLayer(this.forecastLayers[num]["layer"]);
  //  //}

  //  //if (this.currentForecastNo === -1) {
  //  //  this.map.removeLayer(this.mainLayer);
  //  //} else {
  //  //  this.map.removeLayer(this.forecastLayers[this.currentForecastNo]["layer"]);
  //  //}

  //  //this.currentForecastNo = num;
  //  //return true;
  //}

  //// bring map back to a defined state, without touching the forecast stuff
  //clear () {
  //  this.map.getLayers().forEach((layer) => {
  //    this.map.removeLayer(layer);
  //  });
  //}

  //stopPlay () {
  //  this.currentForecastNo = -1;
  //  this.playPaused = false;
  //  let elem = document.getElementById("nowcastIcon");
  //  if (elem) {
  //    elem.src = "./player-play.png";
  //    elem.style.display = "";
  //    $("#forecastTimeWrapper").css("display", "none");
  //    this.hook("scriptHandler", "playFinished");
  //  }
  //}

  //playForecast (e) {
  //  if (!this.forecastDownloaded) {
  //    console.log("not all forecasts downloaded yet");
  //    return;
  //  }
  //  this.playPaused = false;

  //  if (this.currentForecastNo === this.forecastLayers.length - 1) {
  //    // we're past the last downloaded layer, so end the play
  //    this.map.addLayer(this.mainLayer);
  //    this.map.removeLayer(this.forecastLayers[this.currentForecastNo]["layer"]);
  //    this.stopPlay();
  //    $("#forecastTimeWrapper").css("display", "none");
  //    return;
  //  }

  //  if (this.currentForecastNo < 0) {
  //    // play not yet in progress, remove main layer
  //    this.map.removeLayer(this.mainLayer);
  //    this.hook("scriptHandler", "playStarted");
  //    if (!this.enableIOSHooks) {
  //      $("#forecastTimeWrapper").css("display", "block");
  //    }
  //  } else {
  //    // remove previous layer
  //    this.map.removeLayer(this.forecastLayers[this.currentForecastNo]["layer"]);
  //  }
  //  this.currentForecastNo++;
  //  this.map.addLayer(this.forecastLayers[this.currentForecastNo]["layer"]);

  //  if (this.currentForecastNo >= 0) {
  //    let layerTime = (parseInt(this.forecastLayers[this.currentForecastNo]["version"]) + (this.currentForecastNo + 1) * 5 * 60) * 1000;
  //    let dt = new Date(layerTime);
  //    let dtStr = ("0" + dt.getHours()).slice(-2) + ":" + ("0" + dt.getMinutes()).slice(-2);
  //    $(".forecastTimeInner").html(dtStr);
  //    this.hook("layerTimeHandler", layerTime);
  //  }
  //  this.activeForecastTimeout = window.setTimeout(() => { this.playForecast(); }, 600);
  //}

  //removeForecast () {
  //  if (this.currentForecastNo >= 0) {
  //    this.map.removeLayer(this.forecastLayers[this.currentForecastNo]["layer"]);
  //  }
  //  this.hook("scriptHandler", "playFinished");
  //  this.currentForecastNo = -1;
  //}

  //downloadForecast (cb) {
  //  let forecastArrayIdx = 0;

  //  this.layersFinishedCounter = 0;
  //  //for (var ahead = 5; ahead <= 5 * this.numForecastLayers; ahead += 5) {
  //  //  // capture the idx to make it available inside the callback
  //  //  let idx = forecastArrayIdx;

  //  //  /* javascript be like: because who the fuck needs proper printf? */
  //  //  var numStr;
  //  //  if (ahead === 5) {
  //  //    numStr = "05";
  //  //  } else {
  //  //    numStr = ahead.toString();
  //  //  }
  //  //  let url = "https://a.tileserver.unimplemented.org/data/FX_0" + numStr + "-latest.json";

  //  //  $.getJSON({
  //  //    dataType: "json",
  //  //    url: url,
  //  //    success: (data) => {
  //  //      // create new source + transparent layer, which keep track of
  //  //      // downloaded/still not downloaded tiles.
  //  //      var source = new TileJSON({
  //  //        tileJSON: data,
  //  //        crossOrigin: "anonymous",
  //  //        transition: 0
  //  //      });
  //  //      source.on("tileloadstart", () => { ++this.numInFlightTiles; });
  //  //      source.on("tileloadend", () => { --this.numInFlightTiles; });
  //  //      var newLayer = new TileLayer({
  //  //        source: source,
  //  //        opacity: 0
  //  //      });

  //  //      this.forecastLayers[idx] = { "layer": newLayer, "version": data["version"] };
  //  //      // This starts the tile download process:
  //  //      this.map.set("ready", false);
  //  //      this.map.addLayer(newLayer);

  //  //      whenMapIsReady(this.map, () => {
  //  //        this.layersFinishedCounter++;
  //  //        if (this.layersFinishedCounter === this.numForecastLayers) {
  //  //          this.forecastDownloaded = true;
  //  //          console.log("finished all tiles: " + this.layersFinishedCounter);
  //  //          this.forecastLayers.forEach((layer) => {
  //  //            if (layer) {
  //  //              this.map.removeLayer(layer["layer"]);
  //  //              layer["layer"].setOpacity(0.5);
  //  //            }
  //  //          });
  //  //          if (cb) { cb(); }
  //  //        }
  //  //      });
  //  //    }
  //  //  });
  //  //  forecastArrayIdx++;
  //  //}
  //}

  //forecastReady(readyness) {
  //  if (readyness) {
  //    document.getElementById("nowcastLoading").style.display = "none";
  //    document.getElementById("nowcastIcon").style.display = "";
  //    document.getElementById("nowcastIcon").src = "./player-play.png";
  //  } else {
  //    document.getElementById("nowcastLoading").style.display = "";
  //    document.getElementById("nowcastIcon").style.display = "none";
  //  }
  //}

  //processTiles(data) {
  //  // We assume that there is always a reflectivity layer
  //  let newLayer = new TileLayer({
  //    source: new XYZ({
  //      url: this.baseURL + "/" + data["reflectivity"]["tileID"] + "/{z}/{x}/{-y}.png",
  //      maxZoom: 9,
  //      minZoom: 6
  //    }),
  //    opacity: this.opacity
  //  });
  //  newLayer.on("prerender", (evt) => {
  //    // Disable browser up-sampling for satellite maps
  //    evt.context.imageSmoothingEnabled = false;
  //    evt.context.msImageSmoothingEnabled = false;
  //  });
  //  this.switchMainLayer(newLayer);
  //  this.forecastReady(data["forecast"] == true);
  //  this.forecasts = data["forecast"];
  //  //this.hook("timeHandler", data.version.toString());
  //}

  //downloadMainTiles (cb) {
  //  $.getJSON({
  //    dataType: "json",
  //    url: this.mainTileUrl,
  //    success: (data) => {
  //      this.processTiles(data);
  //      if (cb) {
  //        cb(data);
  //      }
  //    }
  //  });
  //}
}

/* vim: set ts=2 sw=2 expandtab: */
