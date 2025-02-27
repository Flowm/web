<script>
    import {
        createEventDispatcher,
        onDestroy
    } from 'svelte';
    const dispatch = createEventDispatcher();
    const close = () => dispatch('close');

    let modal;

    const handle_keydown = e => {
        if (e.key === 'Escape') {
            close();
            return;
        }

        if (e.key === 'Tab') {
            // trap focus
            const nodes = modal.querySelectorAll('*');
            const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

            let index = tabbable.indexOf(document.activeElement);
            if (index === -1 && e.shiftKey) index = 0;

            index += tabbable.length + (e.shiftKey ? -1 : 1);
            index %= tabbable.length;

            tabbable[index].focus();
            e.preventDefault();
        }
    };

    const previously_focused = typeof document !== 'undefined' && document.activeElement;

    if (previously_focused) {
        onDestroy(() => {
            previously_focused.focus();
        });
    }

</script>

<svelte:window on:keydown={handle_keydown} />

<div class="modal-background" on:click={close}></div>

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
    <slot name="header">about meteocool</slot>
    <hr>
    <slot>
        <p>
            <a href="https://itunes.apple.com/app/meteocool-rain-radar/id1438364623"><img src="assets/ios-app-store.png"
                    alt="ios app store link" class="appstore-logo" style="width: 49%; float: left;"></a>
            <a href="https://play.google.com/store/apps/details?id=com.meteocool"><img class="appstore-logo"
                    alt="google play app store" src="assets/google-play-store.png" style="width: 49%"></a>
        </p>
        <p>meteocool is a free GIS visualisation &amp; aggregation platform with focus on severe weather. Optimized for
            mobile devices, you can use it to both chase or avoid upcoming weather - that’s up to you.</p>
        <p>meteocool currently uses radar data provided by DWD and realtime lightning information from the awesome
            blitzortung.org project.</p>
        <h2>Features</h2>
        <ul>
            <li><strong>Automatic Map Updates:</strong> the biggest inconvenience with most weather radar visualisations
                is out-of-date data. Meteocool notifies its clients as soon as new radar data becomes available and the
                client tries to be transparent about the dataset age. Say goodbye to hammering F5!</li>
            <li><strong>Live Lightning Strikes:</strong> new lightning strikes are displayed instantly, giving you an
                even better feeling for the cloud formation’s intensity, trajectory and speed.</li>
            <li><strong>Push Notifications:</strong> get notified about incoming rain up to 60 minutes in advance. Works
                in any modern browser and on iOS.</li>
            <li><strong>Dark Mode:</strong> great for HUD-like displays and general night time usage.</li>
            <li><strong>Progressive Web App:</strong> responsive, connectivity independent and app-like. Add a shortcut
                to your iOS or Android Home Screen to use meteocool in “app mode”.</li>
            <li><strong>iOS &amp; Android Apps:</strong> native iOS and Android apps provide battery-efficient
                background location services to allow for accurate rain notifications without user interaction.</li>
        </ul>
        <h2>Credits & Help</h2>
        <p>
            <p>meteocool is maintained by <a href="https://unimplemented.org/">Valentin Dornauer</a>. Jonas is still looking for his place, for now he's paying.<br>This project would not have been possible without the help from a few great people:</p>
            <img src="assets/volunteers.png" class="volunteers" alt="not actually the volunteers">
            <ul>
                <li>iOS App: Thanks to <a href="https://mauracher.eu/">Florian Mauracher</a>, <a href="https://github.com/nina2244">Nina Loser</a></li>
                <li>Android App: maintained by <a href="https://github.com/Wheedman">Jeremias Wiedmann</a></li>
                <li>Honorable mentions: <a href="https://github.com/NessArt">NessArt</a>
                <li>Icons and adapted artwork made by <a href="http://www.freepik.com" title="Freepik"
                        rel="noreferrer">Freepik</a> (Logo, iOS Onboarding) and Egor Rumyantsev from <a
                        href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> (licensed by <a
                        href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0"
                        rel="noreferrer">CC 3.0 BY</a>)</li>
            </ul>
            <p>Want to help as well? Check out <a href="https://github.com/meteocool" rel="noreferrer">meteocool on GitHub</a> especially our <a href="https://github.com/meteocool/web">web frontend</a>, <a
                    href="https://github.com/meteocool/ios">iOS</a> and <a
                    href="https://github.com/meteocool/android">Android</a> repositories.
            </p>
            <h2>other things</h2>
            <ul>
                <li><a href="mailto:support@meteocool.com">contact us for questions or if you want to send money our way</a>
                </li>
                <li><a href="/privacy.html">privacy policy</a></li>
            </ul>
    </slot>
    <hr>
    <!-- svelte-ignore a11y-autofocus -->
    <sl-button autofocus on:click={close}>close</sl-button>
</div>

<style>
    .modal-background {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3);
    }

    .modal {
        position: absolute;
        /* left: 50%; */
        /* top: 50%; */
        width: calc(100vw - 4em);
        max-width: 32em;
        max-height: calc(100vh - 4em);
        overflow: auto;
        /* transform: translate(-50%,-50%); */
        transform: translate(100%);
        padding: 1em;
        border-radius: 0.2em;
        background: white;
    }

    .appstore-logo {
        width: 200px;
        height: auto;
    }

</style>
