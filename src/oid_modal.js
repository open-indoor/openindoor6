class oid_modal {
    static get_instance() {
        if (oid_modal.singleton === undefined)
            oid_modal.singleton = new oid_modal();
        return oid_modal.singleton;
    }
    constructor() {
        let self = this;
        // Modal container
        this.my_modal = document.createElement("div");
        this.my_modal.setAttribute("id", "myModal");

        // Modal content
        let modal_content = document.createElement('div');
        modal_content.setAttribute("class", "modal-content");

        //   <div class="modal-header">
        //     <span class="close">&times;</span>
        //     <h2>Modal Header</h2>
        //   </div>

        // Modal header
        this.modal_header = document.createElement('div');
        this.modal_header.setAttribute("class", "modal-header");
        // this.modal_header.innerHTML = 'Some text in the Modal Body';

        // Modal Body
        this.modal_body = document.createElement('div');
        this.modal_body.setAttribute("class", "modal-body");
        this.modal_body.innerHTML = 'Some text in the Modal Body';

        // Close cross
        let close_cross = document.createElement('span');
        close_cross.setAttribute("class", "close");
        close_cross.innerHTML = '&times;'
        close_cross.onclick = function() {
            self.my_modal.style.display = "none";
        }

        this.modal_header.appendChild(close_cross);
        modal_content.appendChild(this.modal_header);
        modal_content.appendChild(this.modal_body);
        this.my_modal.appendChild(modal_content);
        // Body
        document.body.appendChild(this.my_modal)

        // Display modal
        this.my_modal.style.display = "block";
    }
    open() {
        this.my_modal.style.display = "block";
        return this;
    }
    close() {
        this.my_modal.style.display = "none";
    }
    setHTML(html) {
        this.modal_body.innerHTML = html;
        return this;
    }
}

// function oid_modal() {


//     return
// }

export default oid_modal;


// let modal = document.getElementById("myModal");
// console.log('modal:', modal);

// let expandingList = document.createElement('ul', { is : 'expanding-list' })



// <div id="myModal" class="modal">

// <!-- Modal content -->
// <div class="modal-content">
//   <div class="modal-header">
//     <span class="close">&times;</span>
//     <h2>Modal Header</h2>
//   </div>
//   <div class="modal-body">
//     <p>Some text in the Modal Body</p>
//     <p>Some other text...</p>
//   </div>
//   <div class="modal-footer">
//     <h3>Modal Footer</h3>
//   </div>
// </div>

// </div>



// this._info.textContent = "Drag and drop here your local indoor data from .osm or .geojson files";
// this._container = document.createElement("div");
// this._container.className = "marquee";
// this._container.appendChild(this._info);
// return this._container;