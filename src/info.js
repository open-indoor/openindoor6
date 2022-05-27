class Info {
    // static data = undefined;

    static includes(key) {
        return (Info.data == null) || (Info.data.includes(key))
    }

    /* description : 
    <div>
    <img width=128 style="vertical-align:middle" src="https://upload.wikimedia.org/wikipedia/commons/a/a1/Missing_image_icon_with_camera_and_upload_arrow.svg">
    <h1>Lycée J.Delanoue + IFAS</h1>
    </div>
    <hr>
    (description)
    
    name (title)
    image (url's image)
    url (link for external website)
    desc (description text)*/

    // static get_description_data(feature, coord) {
    //     let desc = feature.properties;
    //     let description = '';
    //     let title = undefined;
    //     let link = undefined;
    //     let image = undefined;
    //     let image_desc = '<img width=128 style ="vertical-align:middle" src="https://upload.wikimedia.org/wikipedia/commons/a/a1/Missing_image_icon_with_camera_and_upload_arrow.svg"></img>'
    //     for (let key of Object.keys(desc)) {
    //         if (key === 'name' && Info.includes(key)) {
    //             title = desc[key];
    //         }
    //         if (key === 'ref' && Info.includes(key)) {
    //             let ref = desc[key];
    //         }
    //         if (key === 'url' && Info.includes(key)) {
    //             link = desc[key];
    //         }
    //         if (key === 'image' && Info.includes(key)) {
    //             let image = desc[key];
    //             image_desc = '<img width=128 style="vertical-align:middle" src="' + image + '">';
    //         }
    //         if (key === 'desc' && Info.includes(key)) {
    //             description = '<br>' + desc[key];
    //         }

    //     }
    //     if (link != null) {
    //         image_desc = '<a target="_blank" href="' + link + '">' + image_desc + '</a>';
    //     }
    //     // description = image_desc + description;
    //     if (title != null) {
    //         //let _title = '<h1>' + title + '</h1>';
    //         let _title = '<span style="font-size: 28px; font-family:Open Sans Regular;">' + title + "</span>";
    //         if (link != null) {
    //             _title = '<a target="_blank" href="' + link + '">' + _title + '</a>';
    //         }
    //         _title = "<div>" + image_desc + _title + "</div>";
    //         _title += '<hr>';
    //         description = _title + description;
    //     }
    //     console.log("description:", description)
    //     return description;
    // }

    static get_description_data(feature, coord) {
        let desc = feature.properties;
        let description = '';
        let title = undefined;
        let link = undefined;
        let image = undefined;
        let ref = undefined;
        let image_desc = '<img width=128 style="float: left;" src="https://upload.wikimedia.org/wikipedia/commons/a/a1/Missing_image_icon_with_camera_and_upload_arrow.svg"></img>'
        for (let key of Object.keys(desc)) {
            if (key === 'name' && Info.includes(key)) {
                title = desc[key];
            }
            if (key === 'ref' && Info.includes(key)) {
                ref = desc[key];
            }
            if (key === 'url' && Info.includes(key)) {
                link = desc[key];
            }
            if (key === 'image' && Info.includes(key)) {
                let image = desc[key];
                image_desc = 'img width=128 style="float: left;" src="' + image + '">';
            }
            if (key === 'desc' && Info.includes(key)) {
                description = '<br>' + desc[key];
            }

        }
        if (link != null) {
            image_desc = '<a target="_blank" href="' + link + '">' + image_desc + '</a>';
        }
        // description = image_desc + description;
        if (title != null) {
            //let _title = '<h1>' + title + '</h1>';
            let _title = '<div style="font-size: 22px; font-family:Arial; position:relative; top: 25px; left: 10px;">' + title + "<br></div>";
            if (link != null) {
                _title = '<a target="_blank" href="' + link + '">' + _title + '</a>';
            }
            // _title = image_desc + _title;
            console.log("ref :", ref);
            if (ref != null) {
                // ref = ' <div style="font-size: 19px; font-family: Arial; position: relative;top: 35px; left: 10px;">' + ref + "</div> <br><br> <a href='#' class='Go_to_button'>Go to</a>"
                ref = ' <div style="font-size: 19px; font-family: Arial; position: relative;top: 35px; left: 10px;">' + ref;
                _title += ref;
            }
            _title += '<br><br><br> <hr style="position: relative; bottom: 25px;">';
            description = _title + '<span style = "font-family: Arial ">' + description + '</span>';
        } //Open Sans Regular
        console.log("description:", description)
        return description;
    }

    static get_description(feature, coord) {
        if (Info.data != null) {
            return Info.get_description_data(feature, coord);
        }
        let desc = feature.properties;
        if (desc.geometry != null)
            desc.properties.geometry_type = desc.geometry.type;
        let description = "<ul>";
        let internal_desc = "<ul>";
        let title;
        let link;
        let id;
        let wikidata_link;
        let wikipedia_link;
        for (let key of Object.keys(desc)) {
            if (key === 'id' && Info.includes(key)) {
                id = desc[key];
            } else if (['brand:website', 'contact:website'].includes(key) && Info.includes(key)) {
                link = desc[key];
                description += "<li>";
                description += key + ": ";
                description += '<a target="_blank" href="' + desc[key] + '">'
                description += desc[key];
                description += "</a>"
                description += "</li>";
            } else if (['name', 'brand'].includes(key) && Info.includes(key)) {
                description += "<li>";
                title = desc[key];
                description += key + ": " + desc[key];
                description += "</li>";
            } else if (key === 'brand:wikidata' && Info.includes(key)) {
                wikidata_link = 'https://www.wikidata.org/wiki/' + desc[key];
                description += "<li>";
                description += key + ": ";
                description += '<a target="_blank" href="' + wikidata_link + '">'
                description += desc[key];
                description += "</a>"
                description += "</li>";
            } else if (key === 'brand:wikipedia' && Info.includes(key)) {
                let word = desc[key].replace(/^\w\w\:/g, '');
                console.log('word:', word);
                word = word.replace(/\s/g, '_');
                // console.log('word:', word);
                let language = 'www';
                if (desc[key].match(/^(\w\w)\:.+/g)) {
                    language = desc[key].replace(/^(\w\w)\:.+/g, '$1');
                }
                // console.log('language:', language);
                wikipedia_link = 'https://' + language + '.wikipedia.org/wiki/' + word
                description += "<li>";
                description += key + ": ";
                description += '<a target="_blank" href="' + wikipedia_link + '">'
                description += desc[key];
                description += "</a>"
                description += "</li>";
                // https://en.wikipedia.org/wiki/Kusmi_Tea
            } else if (['min_level', 'max_level', 'gap_level', 'feature_type'].includes(key) && Info.includes(key)) {
                internal_desc += "<li>";
                internal_desc += key + ": " + desc[key];
                internal_desc += "</li>";
            } else if (Info.includes(key)) {
                description += "<li>";
                description += key + ": " + desc[key];
                description += "</li>";
            }
        }
        description += "</ul>";
        internal_desc += "</ul>";
        if (link === undefined) {
            link = (wikipedia_link != null) ? wikipedia_link : wikidata_link;
        }
        if (title == null && id != null) {
            title = id;
        }
        if (title == null && name != null) {
            title = name;
        }
        if (title == null) {
            title = '';
        }
        if (title != null) {
            let _title = '<div style="text-align:center"><h1>' + title + '</h1></div>';
            if (link !== undefined) {
                _title = '<a  target="_blank" href="' + link + '">' + _title + '</a>';
            }
            _title += '<hr>';
            description = _title + description;
        }
        description += '<hr>' + internal_desc;

        // var description = JSON.stringify(desc, null, 4).replace(/\n\r?/g, '<br />');
        // console.log('description:', description);
        return description;
    }
}

export default Info;