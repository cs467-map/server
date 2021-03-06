// Returns a city's name and image.
async function getCityFallback(city) {
    const res = getThingFallback(city);
    return res;
}

// Used to interprete JSON objects returned by requests to API's.
// Fetches "url" and returns whatever value is associated with the "object".
async function getThingFallback(city) {
    var map;
    var service;
    var infowindow;

    var sydney = new google.maps.LatLng(-33.867, 151.195);

    infowindow = new google.maps.InfoWindow();

    map = new google.maps.Map(
        document.getElementById('map-hide'), {center: sydney, zoom: 15});

    var request = {
        query: city,
        fields: ['name', 'place_id'],
    };
    // console.log('status:', status);

    var service = new google.maps.places.PlacesService(map);

    return new Promise(function (resolve, reject) {
        service.findPlaceFromQuery(request, function(results, status) {
            // console.log('status:', status);
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    const place_id = results[i].place_id;
                    var req = {
                        placeId: place_id,
                        fields: ['name', 'photos']
                    };
                    service.getDetails(req, callback);

                    function callback(place, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            const url = place.photos[0].getUrl();
                            resolve(url);
                        }
                    }
                }
            }
            else {
                reject('Google places API error.');
            }
        });
    });


}

