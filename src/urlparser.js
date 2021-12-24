function urlparser(map, statemachine) {
    // https://app-dev.openindoor.io/?source=josm
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    console.log('source:', source);
    let my_url = null;
    if (source == null)
        return;
    if (source !== "josm")
        return;

    console.log("josm source detected");
    let my_geojson = fetch("http://localhost:8432/openindoor.geojson", {
        method: 'GET',
        mode: 'cors',
    }).then(function(response) {
        // if (response.ok) {
        console.log('response.ok:', response.ok)
        console.log('response received')
        console.log('Status:', response.status);
        // console.log('response.text:', response.text());

        return response.json();
        // return response.text();
        // } else {
        //     console.log('Status:', response.status);
        // }
    }).then(function(json) {
        console.log('json:', json);
        statemachine.parse(JSON.stringify(json), "geojson");
        // statemachine.setFloorState();
    }).catch(error => {
        console.log(error); //TypeError: "NetworkError when attempting to fetch resource."
    })

    // let hash = window.location.hash.slice(1)
    // console.log('hash:', hash)
    // let hash_split = hash.split("/")
    //     // ["16.39","-73.9919954", "40.7503787", "59.50", "44.82"]
    // console.log('hash_split:', hash_split)
    // if (hash_split.length > 0) {
    //     let zoom = parseFloat(hash_split[0])
    //     if (!isNaN(zoom)) {
    //         map.setZoom(zoom)
    //     }
    // }
    // if (hash_split.length > 2) {
    //     let lon = parseFloat(hash_split[1])
    //     let lat = parseFloat(hash_split[2])
    //     if (!isNaN(lon) && !isNaN(lat)) {
    //         map.setCenter([lon, lat])
    //     }
    // }
    // if (hash_split.length > 3) {
    //     let pitch = parseFloat(hash_split[3])
    //     if (!isNaN(pitch)) {
    //         map.setPitch(pitch)
    //     }
    // }
    // if (hash_split.length > 4) {
    //     let bearing = parseFloat(hash_split[4])
    //     if (!isNaN(bearing)) {
    //         map.setBearing(bearing)
    //     }
    // }

    // map.on('moveend', function() {
    //     let center = map.getCenter()
    //         // console.log('center:', center)

    //     window.location.hash =
    //         map.getZoom().toFixed(2) +
    //         "/" + center.lng.toFixed(7) +
    //         "/" + center.lat.toFixed(7) +
    //         "/" + map.getPitch().toFixed(2) +
    //         "/" + map.getBearing().toFixed(2);
    // })


    // let osm_id = new URLSearchParams(document.location.search).get('osm_id')
    // if (osm_id !== null) {
    //     console.log("osm_id:", osm_id)
    //     map.on('sourcedata', function() {
    //         let sourceId = "footprint"
    //         if (map.getSource(sourceId) && map.isSourceLoaded(sourceId)) {
    //             // console.log('sourceId:', sourceId);
    //             let features = map.querySourceFeatures(sourceId, {
    //                 sourceLayer: 'building-footprint'
    //             });

    //             console.log(sourceId, 'features loaded:', features);
    //         }
    //     });
    // }
}

export default urlparser