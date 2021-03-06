var setupMapRaphael = function() {
    var zoom_min = 8;
    var zoom_max = 18;

    var centerOfMap = new google.maps.LatLng(37.76136024289929,-122.41976332275391);
    var mapOptions = {
        zoom: 12,
        center: centerOfMap,
        panControl: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        draggableCursor:'crosshair',
        mapTypeId: 'blankSlate'
    };
    var mapStyle = [
        {featureType: "poi", elementType: "all",
            stylers: [
                {visibility: "off"}
            ]},
        {featureType:"water",
            elementType:"all",
            stylers: [
                {visibility:"simplified"},
                {saturation:0},
                {lightness:0},
                {gamma:1},
                {color:'#8ac0de'}
            ]},
        {featureType: "landscape",
            elementType: "all",
            stylers: [
                {visibility:"simplified"},
                {saturation:0},
                {lightness:0},
                {gamma:1},
                {color:'#01579b'}
            ]},
        {featureType:"road",
            elementType:"all",
            stylers: [
                {visibility:"simplified"},
                {saturation:0},
                {lightness:10},
                {gamma:1},
                {color:'#0677d0'},
                {hue:'#01579b'}

            ]},
        {featureType:"transit", elementType:"all",
            stylers: [
                {visibility: "off"}
            ]},
        {featureType:"administrative", elementType:"labels",
            stylers: [
                { visibility:"off" }
            ]}
    ]; //end of mapOptions
    var styledMapOptions = {
        maxZoom : zoom_max,
        minZoom : zoom_min
    };

    var map = new google.maps.Map(  jQuery('.map-container')[0],
        mapOptions
    );

    var mapType = new google.maps.StyledMapType(mapStyle, styledMapOptions);
    map.mapTypes.set('blankSlate', mapType);

    // var service = new google.maps.places.PlacesService(map);
    // var searchRequest = {
    //     location:centerOfMap,
    //     radius:4000,
    //     types:['bus_station']
    // };
    // var searchResultsCallback = function(results, status) {
    //   console.log(results);
    //     new RaphaelOverlayView(results, map);
    // };
    // service.nearbySearch(searchRequest, searchResultsCallback);

    new RaphaelOverlayView([], map);
};


RaphaelOverlayView = function(data, map) {
    this.data_ = data;
    this.map_ = map;
    this.svg_ = null;
    this.isOverlayInit = false;
    this.markers = [];
    this.setMap(map);
};

RaphaelOverlayView.prototype = new google.maps.OverlayView();
RaphaelOverlayView.prototype.initOverlay = function() {
    this.isOverlayInit = true;
    var latLongBounds = this.map_.getBounds();
    var overlayProjection = this.getProjection();
    var swPoint = overlayProjection.fromLatLngToDivPixel(latLongBounds.getSouthWest());
    var nePoint = overlayProjection.fromLatLngToDivPixel(latLongBounds.getNorthEast());
    var div = document.createElement('div');
    div.classList.add('svg-overlay-container');
    div.style.width = '100%';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';
    this.div_ = div;

    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(div);

    this.paper = Raphael(div, nePoint.x, swPoint.y);
    var overlayProjection = this.getProjection();
    for(var i = 0, svgMarker; i < this.data_.length; i++) {
        svgMarker = new SVGMarker( this.data_[i], this.paper);
        svgMarker.applyProjection(overlayProjection);
        this.markers.push(svgMarker);
    }

    this.redrawlisteners = [];
    this.redrawlisteners.push( this.map_.addListener('zoom_changed', this.redraw.bind(this)) );
    this.redrawlisteners.push( this.map_.addListener('drag', this.redraw.bind(this)) );
    this.redrawlisteners.push( this.map_.addListener('bounds_changed', this.redraw.bind(this)) );
    this.redrawlisteners.push( this.map_.addListener('center_changed', this.redraw.bind(this)) );
    this.redrawlisteners.push( this.map_.addListener('resize', this.redraw.bind(this)) );

};
RaphaelOverlayView.prototype.fixLayout = function() {
    this.div_.classList.add('svg-overlay-container');
    this.div_.style.width = '100%';
    this.div_.left = '0px';
    this.div_.top = '0px';

};
RaphaelOverlayView.prototype.onAdd = function() {
    if(this.isOverlayInit == false) {
        this.initOverlay();
    } else {
        this.redraw();
    }
};

RaphaelOverlayView.prototype.redraw = function() {
    this.fixLayout();
    var overlayProjection = this.getProjection();
    for(var i = 0; i < this.markers.length; i++) {
        this.markers[i].applyProjection(overlayProjection);
    }
};

RaphaelOverlayView.prototype.draw = function() {
    this.redraw();
};

RaphaelOverlayView.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
    for(var i = 0; i < this.redrawlisteners.length; i++) {
        var listener = this.redrawlisteners[i];
        google.maps.event.removeListener(listener);
    }
};


var circleFill_up ={fill : '#ffcdd2', stroke: '#ffffff', r:4};
var circleFill_over ={fill : '#ffebee', stroke: '#ffcdd2', r:10};

SVGMarker = function(data, paper) {
    this.data_ = data;
    this.paper = paper;
    this.set = paper.set();

    this.circle = paper.circle(0, 0, 6);
    this.circle.attr(circleFill_up);
    this.set.push(this.circle);

    this.label = this.paper.text(8, 0, data.name);
    this.label.attr({
                    'font-family':'Open Sans',
                    'font-size':'16px',
                    'fill':'#ffcdd2',
                    'stroke':'#0677d0',
                    'stroke-width':0.1,
                    'opacity': 0,
                    'text-anchor': 'start'
                    });
    this.set.push(this.label);

    var box = this.label.getBBox();
    this.labelBBox = box;
    this.labelBox = this.paper.rect(box.x - 3, box.y - 3, box.width + 6, box.height + 6, 3);
    this.labelBox.attr({'fill':'#0677d0', stroke:'#01579b', opacity:0, width:3});
    this.labelBox.hide();

    this.set.push(this.labelBox);

    this.label.toFront();
    this.label.hide();

    this.set.mouseover(this.onMouseOver.bind(this));
    this.set.mouseout(this.onMouseOut.bind(this));
};
SVGMarker.prototype.applyProjection = function(projection) {
    var point = projection.fromLatLngToDivPixel(this.data_.geometry.location);
    this.set.transform('t' + point.x + ',' + point.y );
};
SVGMarker.prototype.onMouseOver = function() {
    this.circle.animate(circleFill_over, 111, 'elastic');
    this.label.show();
    this.labelBox.toFront();
    this.label.toFront();
    this.labelBox.show();
    this.labelBox.animate({opacity:1, width:this.labelBBox.width + 6, x:10}, 70, 'bounceOut');
    this.label.animate({'opacity':1, 'x':13}, 100, 'bounceOut');

};
SVGMarker.prototype.onMouseOut = function() {
    var self = this;
    this.circle.animate(circleFill_up, 111, 'elastic');
    this.label.animate({'x':8, 'opacity':0}, 120, 'easeIn', function() {
        self.label.hide();
    });
    this.labelBox.animate({opacity:0, width:3, x:5}, 180, 'easeIn', function() {
        self.labelBox.hide();
    });
};

var busIcon = {
    width:22,
    height:26,
    d:"M15.976,0.881C15.915,0.388,15.51,0,15,0H7C6.49,0,6.085,0.388,6.024,0.881C0.009,3.318,0,10,0,10v13c0,0.553,0.447,1,1,1 h1c0,1.104,0.896,2,2,2s2-0.896,2-2h10c0,1.104,0.896,2,2,2s2-0.896,2-2h1c0.553,0,1-0.447,1-1V10 C22,10,21.992,3.318,15.976,0.881z M8,2h6c0.553,0,1,0.448,1,1c0,0.553-0.447,1-1,1H8C7.447,4,7,3.553,7,3C7,2.448,7.447,2,8,2z M4.5,21C3.672,21,3,20.328,3,19.5S3.672,18,4.5,18S6,18.672,6,19.5S5.328,21,4.5,21z M17.5,21c-0.828,0-1.5-0.672-1.5-1.5 s0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5S18.328,21,17.5,21z M20,13.182C20,13.634,19.634,14,19.182,14H2.818 C2.366,14,2,13.634,2,13.182c0,0,0-2.182,0-2C2,8,2,6,11,6s9,2,9,5.182C20,11,20,13.182,20,13.182z"
};

jQuery( document ).ready( setupMapRaphael );