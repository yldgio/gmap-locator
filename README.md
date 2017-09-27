## GmapLocatorWrapper yet another gmap locator ##

### search & locate an address on a google map ###
#### Sample: ####

```html
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

```