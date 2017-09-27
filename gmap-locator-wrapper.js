/** 
* @fileOverview 
* @description
* libreria per la ricerca e utilizzo della localizzazione su una mappa Google di un indirizzo.
*
* Utilizzata nelle pagine degli immobili per impostare la Lotitudine e Longitudine in base alla localizzazione sulla mappa.
* [GmapLocatorWrapper]{@link module:GmapLocatorWrapper}
*/
/**
 * @module GmapLocatorWrapper
 * @description
 * utilità per la localizzazione sulla mappa di un indirizzo
 *
 * Crea una finestra per la ricerca di un indirizzo e la geolocalizzazione dello stesso attraverso le Api Google Maps
 * @requires lodash 3.10.0  
 * @example
<!DOCTYPE html>
<html>

  <head>
    <script data-require="jquery@1.11.0" data-semver="1.11.0" src="//cdnjs.cloudflare.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <link rel="stylesheet" href="style.css" />
    <script src="https://maps.googleapis.com/maps/api/js?v=3.17"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.0/lodash.js"></script>
    <script src="gmap-locator-wrapper.js"></script>
    <script>
	  function updateSelectedLocation(e, marker) {
            if (marker) {
                $('#lat').val(marker.position.lat());
                $('#lng').val(marker.position.lng());
            }
            var route = _.find(e.selected_address.address_components, function (address) {
                return _.any(address.types, function (type) { return type == 'route' });
            });
            if (route) {
                $('#address').val(route.long_name);
            }
            var number = _.find(e.selected_address.address_components, function (address) {
                return _.any(address.types, function (type) { return type == 'street_number' });
            });
            if (number) {
                $('#address-number'].HtmlID).val(number.long_name);
            }
            var postal_code = _.find(e.selected_address.address_components, function (address) {
                return _.any(address.types, function (type) { return type == 'postal_code' });
            });
            if (postal_code) {
                $('#zip-code').val(postal_code.long_name);
            }
        }
      function initializeLocator() {
        var options = {
          address: "", //start address search string
          latitude: null, //alternatively provide lat e lng for reverse geocoding
          longitude: null,
          //styling: via classes:
          classes: {
            div_wrapper: "", 
            command_panel: "", 
            address_text: "", 
            address_button: "", 
            select_button: "", 
            map_div :""
          },
          //or via inline styles:
          styles: {
            div_wrapper: {"min-height": "500px", margin: 0, padding: 0}, 
            command_panel: {
              "position": "relative", 
              "border-radius":"2px 0 0 2px",
              "box-sizing": "border-box",
              "-moz-box-sizing": "border-box",
              "outline": "none",
              "box-shadow": "0 2px 6px rgba(0, 0, 0, 0.3)",
              "z-index": 5, 
              "background-color": "#fff", 
              "padding": "1px 1px 1px 10px", 
              "border": "1px solid #999", 
              "font-family": "'Roboto','sans-serif'", 
              "line-height": "30px"
            }, 
            address_text: {"font-size": "15px",
              "padding": "0 11px 0 13px",
              "text-overflow": "ellipsis",
              "margin-left": "12px",
              "width": "40%"
            }, 
            address_button:{"font-size": "15px"}, 
            select_button:{"font-size": "15px"}, 
            map_div :""
          },
          map:{zoom: 18}
        };
        // init the object :
        // param1: css selector to an existing element: the map will be appended inside the element
        // param2: config options 
        var maplocator = new GMapLocatorWrapper("#panel-map-container", options);
        // use .load() and .unload() to show and hide the map
        $("#open-map").click(function(){
          if(maplocator.isLoaded()){
            maplocator.unload();
          }else{
            maplocator.load();
          }
        });
        // map locator triggers 2 gmap events: 
        //  1.   'markerplaced' every time an address is selected and a marker shown
        google.maps.event.addListener(maplocator, 'markerplaced', function(e, marker) {
          console.log(e);
          console.log(marker);
          updateSelectedLocation(e, marker);
        });
        //  1.   'location_selected' when the user chooses the 'use selected location' button
        google.maps.event.addListener(maplocator, 'location_selected', function(e, marker) {
          
          updateSelectedLocation(e, marker);
          maplocator.unload();
        });
      }
      google.maps.event.addDomListener(window, 'load', initializeLocator);    
    </script>
  </head>

  <body>
    <input type="button" id="open-map" value="open map" />
    <div id="panel-map-container">
      
    </div>
	<input type="text" id="lat" name="latitude" />
	<input type="text" id="lng" name="longitude" />
	<input type="text" id="address" name="address" />
	<input type="text" id="address-number" name="address_number" />
	<input type="text" id="zip-code" name="zip" />
  </body>

</html>

  



*/



/** @class */
var GMapLocatorWrapper = function(containerSelector, opts){
	/** @var */
  this._id = _.uniqueId();
	/** @var */
  this._div_wrapper = "map-wrapper-" + this._id;
	/** @var */
  this._div_panel = "map-panel-" + this._id;
	/** @var */
  this._text_address = "map-address-" + this._id;
	/** @var */
  this._button_search = "map-search-" + this._id;
	/** @var */
  this._select_button = "map-select-" + this._id;
	/** @var */
  this._div_map = "map-canvas-" + this._id;
	/** @var */
  this.geocoder = null;
	/** @var */
  this.map = null;
	/** @var */
  this.marker = null;
	/** @var */
  this._geocoder = null;
	/** @var */
  this.is_loaded = false;
	/** @var */
  this.selected_address = null;
  if(!opts){
    opts = {};
  }
/** 
* @var 
* @example
{
    readonly: false,
    classes: {
      div_wrapper: "", 
      command_panel: "", 
      address_text: "", 
      address_button: "", 
      select_button: "", 
      map_div :""
    },
    script: {
      params: {  
        key: __PreamoGMapApiKey__,    
        china: false,
        v: '3.17',
        libraries: '',
        language: 'en',
        sensor: 'false'
      }
    },
    search_text: "Search",
    select_text: "Use this location",
    address: "",
    latitude: null,
    longitude: null,
    styles: {
      div_wrapper: {"min-height": "500px", margin: 0, padding: 0}, 
      command_panel: {
        "position": "relative", 
        "border-radius":"2px 0 0 2px",
        "box-sizing": "border-box",
        "-moz-box-sizing": "border-box",
        "outline": "none",
        "box-shadow": "0 2px 6px rgba(0, 0, 0, 0.3)",
        
        "z-index": 5, 
        "background-color": "#fff", 
        "padding": "1px 1px 1px 10px", 
        "border": "1px solid #999", 
        "font-family": "'Roboto','sans-serif'", 
        "line-height": "30px"
      }, 
      address_text: {"font-size": "15px",
        "padding": "0 11px 0 13px",
        "text-overflow": "ellipsis",
        "margin-left": "12px",
        "width": "40%"
      }, 
      address_button:{"font-size": "15px"}, 
      select_button:{"font-size": "15px"}, 
      map_div :""
    },
    map: {
      zoom: 1,      
      zoomControl: true,
      panControl: true,
    }
*/

  var defaults = {
    readonly: false,
    classes: {
      div_wrapper: "", 
      command_panel: "", 
      address_text: "", 
      address_button: "", 
      select_button: "", 
      map_div :""
    },
    script: {
      params: {  
        key: __PreamoGMapApiKey__,    
        china: false,
        v: '3.17',
        libraries: '',
        language: 'en',
        sensor: 'false'
      }
    },
    search_text: "Search",
    select_text: "Use this location",
    address: "",
    latitude: null,
    longitude: null,
    styles: {
      div_wrapper: {"min-height": "500px", margin: 0, padding: 0}, 
      command_panel: {
        "position": "relative", 
        //"top": "5px", 
        //"left": "50%",
        "border-radius":"2px 0 0 2px",
        "box-sizing": "border-box",
        "-moz-box-sizing": "border-box",
        "outline": "none",
        "box-shadow": "0 2px 6px rgba(0, 0, 0, 0.3)",
        
        "z-index": 5, 
        "background-color": "#fff", 
        "padding": "1px 1px 1px 10px", 
        "border": "1px solid #999", 
        //"height": "32px", 
        "font-family": "'Roboto','sans-serif'", 
        "line-height": "30px"
      }, 
      address_text: {"font-size": "15px",
        "padding": "0 11px 0 13px",
        "text-overflow": "ellipsis",
        "margin-left": "12px",
        "width": "40%"
      }, 
      address_button:{"font-size": "15px"}, 
      select_button:{"font-size": "15px"}, 
      map_div :""
    },
    map: {
      zoom: 1,      
      zoomControl: true,
      panControl: true,
    }
  };
  /*if(this.isGoogleMapsLoaded()){
    defaults.map.mapTypeControl = true;
    defaults.map.mapTypeControlOptions = { mapTypeIds: [google.maps.MapTypeId.ROADMAP]};
    defaults.map.zoomControlOptions = { style: google.maps.ZoomControlStyle.SMALL};
  }*/
  this._options = _.defaultsDeep(opts, defaults);
  this._selector = containerSelector;
  this._window_context = self == top ? document : parent.document;
  
}
/** @returns {string} google maps api uri  */
GMapLocatorWrapper.prototype.getScriptUrl = function() {
  if (this._options.script.params.china) {
    return 'http://maps.google.cn/maps/api/js?';
  } else {
    return 'https://maps.googleapis.com/maps/api/js?';
  }
}
/** include lo script per google maps api  */
GMapLocatorWrapper.prototype.includeScript = function() {
    var query, script, scriptId;
    scriptId = void 0;
    query = _.map(this._options.script.params, function(v, k) {
      return k + '=' + v;
    });
    /*if (scriptId) {
      document.getElementById(scriptId).remove();
    }*/
    query = query.join('&');
    script = document.createElement('script');
    script.id = scriptId = "ui_gmap_loacator_load_" + this._id;
    script.type = 'text/javascript';
    script.src = this.getScriptUrl() + query;
    return document.body.appendChild(script);
}
/** @public  */
GMapLocatorWrapper.prototype.isGoogleMapsLoaded = function() {
    return !(_.isUndefined(window.google) || _.isUndefined(window.google.maps));
}
/** @public  */
GMapLocatorWrapper.prototype.loadGMap = function() {
  var deferred, randomizedFunctionName;
  deferred = $.Deferred();
  if (this.isGoogleMapsLoaded()) {
    deferred.resolve(window.google.maps);
    return deferred.promise();
  }
  randomizedFunctionName = this._options.script.params.callback = 'onGoogleMapsReady' + Math.round(Math.random() * 1000);
  window[randomizedFunctionName] = function() {
    window[randomizedFunctionName] = null;
    deferred.resolve(window.google.maps);
  };
  if (window.navigator.connection && window.Connection && window.navigator.connection.type === window.Connection.NONE) {
    var self = this;
    document.addEventListener('online', function() {
      if (!self.isGoogleMapsLoaded()) {
        return self.includeScript();
      }
    });
  } else {
    this.includeScript();
  }
  return deferred.promise();
}
/** Inizializza  GMapLocatorWrapper: crea l'html, la mappa e inizializza gli eventi in ascolto */

GMapLocatorWrapper.prototype.init = function(){
  this._geocoder = new google.maps.Geocoder();
  //var latlng = new google.maps.LatLng(lat, lng);
  this.container = $(this._selector, this._window_context);  
  this._prepareHtml();

  //console.log(this.container.html());

  this.map = new google.maps.Map(this._window_context.getElementById(this._div_map), this._options.map);
  var self = this;
  google.maps.event.addListener(this.map, 'click', function(e) {
    self.reverseSearch(e.latLng);
  });
  /*google.maps.event.addListener(this.map, 'resize', function(e) {
    self.searchAddress();
  });*/
  if(_.isEmpty(this._options.latitude)){this._options.latitude = null;}
  if(_.isEmpty(this._options.longitude)){this._options.longitude = null;}
  if(!_.isEmpty(this._options.address)){
    this.searchAddress();
  }else{
    if(_.isNull(this._options.latitude) || _.isNull(this._options.longitude)){
      this.map.setZoom(2);
      this.map.setCenter(new google.maps.LatLng(0, 0));
    }else{
      var latlng = new google.maps.LatLng(this._options.latitude, this._options.longitude);
      this.reverseSearch(latlng);
    }
  }
  this.is_loaded = true;
  //tilesloaded
  $('#' + this._button_search, this._window_context).click(function(){
    self.searchAddress();
  });
  $('#' + this._text_address, this._window_context).keypress(function(evt){
    if(evt.which == 13){
      self.searchAddress();
    }
  });
  if(this._options.readonly === true){
    $('#' + this._select_button, this._window_context).attr("disabled", true);
  }else{
    $('#' + this._select_button, this._window_context).click(function(){
      google.maps.event.trigger(self, 'location_selected', self, self.marker);   
    });
  }
  return self;
}
/** @public */
GMapLocatorWrapper.prototype.getContext = function(){
	return this._window_context;
}

/** @public */
GMapLocatorWrapper.prototype.load = function(){
  var self = this;
  var deferred = $.Deferred();
  this.loadGMap().then(function(_gmap){
    self.init();
    deferred.resolve(self, _gmap);
  });
  return deferred.promise();
}
/** @public */
GMapLocatorWrapper.prototype.unload = function(){
  this.geocoder = null;
  this.map = null;
  this.marker = null;
  this._detachHtml();
}
/** @protected */
GMapLocatorWrapper.prototype._prepareHtml = function(){
  this._detachHtml();
  var element = $("<div id='" +this._div_wrapper +"'/>");
  this._setElementStyle(element, 'div_wrapper');
  this.container.append(element);
  var mapElement = $("<div id='" +this._div_map +"' />");
  this._setElementStyle(mapElement, 'map_div');
  mapElement.height(this.container.height());
  var panel = $("<div id='" +this._div_panel +"' />");
  this._setElementStyle(panel, 'command_panel');
  var addr = $('<input id="' +this._text_address +'" type="textbox" value="'+this._options.address+'" />');
  this._setElementStyle(addr, 'address_text');
  var button = $('<input type="button" value="' +this._options.search_text +'" id="' +this._button_search +'"/>');
  this._setElementStyle(button, 'address_button');
  var select_button = $('<input type="button" value="' +this._options.select_text +'" id="' +this._select_button +'"/>');
  this._setElementStyle(select_button, 'select_button');

  panel.append(addr);
  panel.append(button);
  panel.append(select_button);
  element.append(panel);
  element.append(mapElement);
  
  //console.log(this.container.html());
}
/** @protected */
GMapLocatorWrapper.prototype._setElementStyle = function(el, opt_property){
  if(!_.isEmpty(this._options.classes[opt_property])){
    el.addClass(this._options.classes[opt_property]);
  }else{
    el.css(this._options.styles[opt_property]);
  }
}
/** @protected */
GMapLocatorWrapper.prototype._detachHtml = function(){
  this.container.remove('#'+this._div_wrapper);
  
  $('#'+this._div_wrapper, this._window_context).detach();
  this.is_loaded = false;
}
/** @public */
GMapLocatorWrapper.prototype.isLoaded = function(){
  return this.is_loaded;
}
/** @public */
GMapLocatorWrapper.prototype.reverseSearch = function(latLng){
  var self = this;
  self._geocoder.geocode({'location': latLng}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK && results[0]) {
      self.map.fitBounds(results[0].geometry.viewport);
      self.placeMarker(latLng, results[0]); 
    }else{
      self.placeMarker(latLng);
    }
  });     
}
/** @public */
GMapLocatorWrapper.prototype.searchAddress = function(){
  var self = this;
  //console.log($('#' +this._text_address).val())
  this._geocoder.geocode( { 'address': $('#' +this._text_address, this._window_context).val()}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      self.map.setCenter(results[0].geometry.location);
      /*if(self.map.getZoom() < 18){
        self.map.setZoom(18);
      }*/
      self.map.fitBounds(results[0].geometry.viewport);
      self.placeMarker(results[0].geometry.location, results[0]);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });    
}
/** @public */
GMapLocatorWrapper.prototype.placeMarker = function(position, address) {
  if(this.marker){
    this.marker.setMap(null);
  }
  if(!address){
    address = {formatted_address: ''}; 
  }
  this.selected_address = address;
  this.marker = new google.maps.Marker({
    position: position,
    map: this.map,
    title: address.formatted_address
  });
  this.map.panTo(position);
  var iContent = _.template('<h4><%= address %></h4><p><%= lat %>, <%= lng %></p>');
  //address + '<p>' + position.lat() + ', ' + position.lng() + '</p>';
  var infowindow = new google.maps.InfoWindow({
    content: iContent({address: address.formatted_address, lat: position.lat(), lng: position.lng()})
  });
  var self = this;
  google.maps.event.addListener(this.marker, 'click', function() {
    infowindow.open(self.map, self.marker);
  });
  infowindow.open(self.map, self.marker);
  $('#' +this._text_address, this._window_context).val(address.formatted_address);
  
  google.maps.event.trigger(this, 'markerplaced', this, this.marker);
}