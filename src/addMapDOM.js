function addMapDOM(id) {
    if (document.getElementById(id) != null)
        return;
    const map_div = document.createElement("div")
    map_div.setAttribute("id", "map");
    document.body.appendChild(map_div)
}



export default addMapDOM