var Configurator = (function() {     

    var Configurator = function(model) {
        // interface with API         
        // takes model arg for future API planning
        this.data = this.getOptions(model);

        // event listener for selecting options
        var options = document.querySelector('.options');
        options.addEventListener('click', toggleOption, false);

        setConstants(this.data);

        displayOptions(this.data);

        total(this.data);

        new Injector(document, 'disclaimer').inject(this.data.disclaimer);    

        // toggle prices
        var priceToggle = document.getElementById('price-toggle');
        priceToggle.onclick = function(e) {
            var toggleOff = true;
            if (priceToggle.innerHTML === 'Show Prices') { toggleOff = false; } 
            priceToggle.innerHTML = (toggleOff ? 'Show Prices' : 'Hide Prices');
            var optionPrices = document.getElementsByClassName('price');
            for (var i = 0; i < optionPrices.length; i++) {                    
                optionPrices[i].style.visibility = (toggleOff ? 'hidden' : 'visible');                    
            }
        };            

    };

    Configurator.prototype = (function() {
        // public method
        var getOptions = function(arg) {
            var xhr;

            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                // IE6, IE5
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }

            // specify the type of request
            xhr.open('GET', arg, false);

            // send the request to the server
            xhr.send();

            // parse the returned data
            if ('JSON' in window) {
                var data = JSON.parse(xhr.responseText);
            } else {
                // code for OLDER VERSIONS OF IE
                // todo: eval needs to be secured
                var data = eval(xhr.responseText);
            }

            // return the data
            return data;

        };

        // make this method public
        return {
            getOptions: getOptions
        };

    })();

    // private method
    function setConstants(data) {
        var currencyCode = data.currency_code;
        new Injector(document, 'base-price').inject(currencyCode + data.base_price);    
        new Injector(document, 'inspect-prep-price').inject(currencyCode + data.inspect_prep_price);    
        new Injector(document, 'delivery-price').inject(currencyCode + data.personal_delivery_price);    
    }

    // private method
    function displayOptions(data) {
        var currencyCode = data.currency_code;

        // loop thru options
        for (key in data.options) {
          if (data.options.hasOwnProperty(key)) {
            var toDOM = false;
            var currency = false;
            // check if it meets UI criteria
            if (data.options[key].price === 0 && data.options[key].no_ui === undefined && data.options[key].is_default === true) {
                toDOM = true;
                currency = true;
            } else if (data.options[key].price > 0) {
                toDOM = true;                    
            }
            if (toDOM === true) {
                // get the template
                var optionTemplate = document.getElementById('option-template').innerHTML,
                    // create an element to inject the template
                    optionSite = document.createElement('li');
                // inject the template
                optionSite.innerHTML = optionTemplate;

                new Injector(optionSite, 'name').inject(data.options[key].name);    
                new Injector(optionSite, 'price').inject((currency ? '-' : currencyCode + data.options[key].price));    

                // append the template to the DOM
                document.getElementsByClassName("options")[0].appendChild(optionSite);     
            }           
          }
        }
    }

    // private method
    // todo: improve this
    function toggleOption(e) {
        if (e.target !== e.currentTarget && e.target.className === 'checkbox__check') {
            var price = Number(e.target.parentElement.parentElement.nextSibling.children[0].innerHTML.substr(1));
            if (e.target.parentElement.className == 'checkbox checkbox--selected') {
                e.target.parentElement.className = 'checkbox';
                e.target.parentElement.parentElement.parentElement.className = '';
                subtract(price);
            } else {
                e.target.parentElement.className = 'checkbox checkbox--selected';    
                e.target.parentElement.parentElement.parentElement.className = 'active';
                add(price);
            }       
            
        }
        e.stopPropagation();
    }

    // private method
    function total(data) {
        var currencyCode = data.currency_code,
            total = data.base_price + data.inspect_prep_price + data.personal_delivery_price;
        new Injector(document, 'total-price').inject(currencyCode + total);            
        return total;
    }

    // private method
    function add(val) {
        var total = document.getElementsByClassName('total-price')[0].innerHTML,
            currencyCode = total.charAt(0),
            total = Number(total.substr(1));        
        total = total + val;
        new Injector(document, 'total-price').inject(currencyCode + total);            
    }

    // private method
    function subtract(val) {
        var total = document.getElementsByClassName('total-price')[0].innerHTML,
            currencyCode = total.charAt(0),
            total = Number(total.substr(1));        
        total = total - val;
        new Injector(document, 'total-price').inject(currencyCode + total);    
    }

    return Configurator;

})();


/**
* Injector Constructor
*/
var Injector = function(template, attr, index) {
    this.template = template,
    this.attr = attr,
    this.index = index || 0;
};
Injector.prototype.inject = function(data) {
    var elem = this.template.getElementsByClassName(this.attr)[this.index] || this.template.getElementById(this.attr);
    elem.textContent = data;
    // elem.innerHTML = data;
    // elem.firstChild.nodeValue = data;
    // elem.innerText = data;
}       

// Instantiate Configurator
var config = new Configurator('/options');     