<script>
    import Map from './Map.svelte';
    import Logo from './Logo.svelte';
    import {LayerManager} from "./lib/LayerManager";
    import {NanobarWrapper} from "./lib/NanobarWrapper.js"

    import * as Sentry from "@sentry/browser";
    import {Integrations} from "@sentry/tracing";
    import {Settings} from "./lib/Settings";
    import View from "ol/View";
    import {RadarCapability} from "./lib/RadarCapability";
    import {SatelliteCapability} from "./lib/SatelliteCapability";
    import {WeatherCapability} from "./lib/WeatherCapability";
    import NowcastPlayback from "./NowcastPlayback.svelte";

    Sentry.init({
        dsn: 'https://ee86f8a6a22f4b7fb267b01e22c07d1e@o347743.ingest.sentry.io/5481137',
        integrations: [
            new Integrations.BrowserTracing(),
        ],
        tracesSampleRate: 1.0,
    });

    import '@shoelace-style/shoelace/dist/shoelace/shoelace.css';
    import {
        SlAlert,
        SlButton,
        SlIconButton,
        SlIcon,
        SlSpinner,
        setAssetPath, defineCustomElements,
    } from '@shoelace-style/shoelace';
    setAssetPath(document.currentScript.src);
    customElements.define('sl-button', SlButton);
    customElements.define('sl-icon', SlIcon);
    customElements.define('sl-icon-button', SlIconButton);
    customElements.define('sl-spinner', SlSpinner);
    customElements.define('sl-alert', SlAlert);

    let baseUrl = "https://api.ng.meteocool.com/api/";
    //baseUrl = "http://localhost:5000/api/";
    window.settings = new Settings({
        mapRotation: {
            type: 'boolean',
            default: false,
            cb: (value) => {
                const newView = new View({
                    center: map.getView().getCenter(),
                    zoom: map.getView().getZoom(),
                    minzoom: 5,
                    enableRotation: value,
                });
                lm.forEachMap((map) => map.setView(newView));
            },
        },
        mapBaseLayer: {
            type: 'string',
            default: 'topographic',
            cb: (value) => {
                lm.switchBaseLayer(value);
            },
        },
        radarColorMapping: {
            type: 'string',
            default: 'classic',
            cb: (val) => window.updateColormap ? window.updateColormap(val) : true,
        },
        capability: {
            type: 'string',
            default: 'radar',
        },
    });

    const nb = new NanobarWrapper();
    export const radar = new RadarCapability({"nanobar": nb, "tileURL": baseUrl + "radar/"});
    export let lm = new LayerManager({
        baseURL: baseUrl + "tiles/",
        settings: window.settings,
        nanobar: nb,
        capabilities: {
            "radar": radar,
            "satellite": new SatelliteCapability({"nanobar": nb}),
            "weather": new WeatherCapability(nb),
        },
    });
    export let device = document.currentScript.getAttribute('device');
    window.lm = lm;

    if (device == "ios" && "webkit" in window) {
        window.webkit.messageHandlers["scriptHandler"].postMessage("requestSettings");
    }
</script>

<style>
	:global(body) {
		margin: 0;
        padding: 0;
        overflow: hidden;
	}

    :global(.nanobar) {
        width: 100%;
        height: 4px;
        z-index: 9999;
        top:0
    }
    :global(.bar) {
        width: 0;
        height: 100%;
        background: rgb(135, 202, 214);
        border-radius: 2px;
        height: 2px;
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
        box-shadow: 0 0 3px rgb(135, 202, 214);
    }

    :global(.sl-toast-stack) {
        bottom: calc(env(safe-area-inset-top) + max(100px, 10%));
        top: auto;
    }

</style>

{#if device !== 'ios'}
<Logo />
{/if}
<div id="nanobar" />
<Map layerManager={lm} />
<NowcastPlayback cap={radar} nowcast={radar.nowcast} />
