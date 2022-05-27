import centroid from '@turf/centroid';

class oid_popup {

    static get_instance(map) {
        if (oid_popup.singleton === undefined)
            oid_popup.singleton = new oid_popup(map);
        return oid_popup.singleton;
    }
    constructor(map) {
        let self = this;
        this.my_popup = undefined;
        this.map = map;
        // this.my_popup = new maplibregl.Popup({ closeOnClick: true });
    }
    open(feature) {
        console.log('feature:', feature);
        let my_centroid = centroid(feature).geometry.coordinates;
        console.log('my_centroid:', my_centroid);
        if (this.my_popup == null) {
            this.my_popup = new maplibregl.Popup({ closeOnClick: false });
            this.my_popup.addTo(this.map);
        }
        this.my_popup.setLngLat({
            lng: my_centroid[0],
            lat: my_centroid[1]
        });
        return this;
    }
    close() {
        if (this.my_popup != null) {
            this.my_popup.remove();
            this.my_popup = undefined;
        }
    }
    setHTML(html) {
        this.my_popup.setHTML(html);
        return this;
    }
}


export default oid_popup;