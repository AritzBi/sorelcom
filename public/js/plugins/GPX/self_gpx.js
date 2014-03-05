L.GPX = L.LineString.extend({
  	initialize: function(gpx, options) {
    	options.max_point_interval = options.max_point_interval || _MAX_POINT_INTERVAL_MS;
    	options.marker_options = this._merge_objs(
      		_DEFAULT_MARKER_OPTS,
      		options.marker_options || {});
    	options.polyline_options = this._merge_objs(
      		_DEFAULT_POLYLINE_OPTS,
      		options.polyline_options || {});

    	L.Util.setOptions(this, options);

    	// Base icon class for track pins.
    	L.GPXTrackIcon = L.Icon.extend({ options: options.marker_options });

    	this._gpx = gpx;
    	this._layers = {};
    	this._info = {
      		name: null,
      		length: 0.0,
      		elevation: {gain: 0.0, loss: 0.0, _points: []},
      		hr: {avg: 0, _total: 0, _points: []},
      		duration: {start: null, end: null, moving: 0, total: 0},
    	};

        if (gpx) {
      		this._parse(gpx, options, this.options.async);
    	}
  	},

	_parse_gpx_data: function(xml, options) {
    	var j, i, el, layers = [];
    	var tags = [['rte','rtept'], ['trkseg','trkpt']];

    	var name = xml.getElementsByTagName('name');
    	if (name.length > 0) {
    	 	this._info.name = name[0].textContent;
    	}
    	var desc = xml.getElementsByTagName('desc');
    	if (desc.length > 0) {
    	  	this._info.desc = desc[0].textContent;
    	}
    	var author = xml.getElementsByTagName('author');
    	if (author.length > 0) {
    	  	this._info.author = author[0].textContent;
    	}
    	var copyright = xml.getElementsByTagName('copyright');
    	if (copyright.length > 0) {
     	 	this._info.copyright = copyright[0].textContent;
    	}

    	for (j = 0; j < tags.length; j++) {
      		el = xml.getElementsByTagName(tags[j][0]);
      		for (i = 0; i < el.length; i++) {
        		var coords = this._parse_trkseg(el[i], xml, options, tags[j][1]);
        		if (coords.length === 0) continue;
	
	        	var l = new L.Polyline(coords, options.polyline_options);
	        	this.fire('addline', { line: l })
	        	layers.push(l);
      		}
    	}

    	this._info.hr.avg = Math.round(this._info.hr._total / this._info.hr._points.length);

    	if (!layers.length) return;
    	var layer = layers[0];
    	if (layers.length > 1)
      		layer = new L.FeatureGroup(layers);
    	return layer;
  },

  _parse_trkseg: function(line, xml, options, tag) {
    	var el = line.getElementsByTagName(tag);
    	if (!el.length) return [];
    	var coords = [];
    	var last = null;

    	for (var i = 0; i < el.length; i++) {
      		var _, ll = new L.LatLng(
        	el[i].getAttribute('lat'),
        	el[i].getAttribute('lon'));
      		ll.meta = { time: null, ele: null, hr: null };

      		_ = el[i].getElementsByTagName('time');
      		if (_.length > 0) {
        		ll.meta.time = new Date(Date.parse(_[0].textContent));
      		}

      		_ = el[i].getElementsByTagName('ele');
      		if (_.length > 0) {
        		ll.meta.ele = parseFloat(_[0].textContent);
      		}

      		_ = el[i].getElementsByTagNameNS('*', 'hr');
      		if (_.length > 0) {
        		ll.meta.hr = parseInt(_[0].textContent);
        		this._info.hr._points.push([this._info.length, ll.meta.hr]);
        		this._info.hr._total += ll.meta.hr;
      		}

      		this._info.elevation._points.push([this._info.length, ll.meta.ele]);
      		this._info.duration.end = ll.meta.time;

      		if (last != null) {
       	 		this._info.length += this._dist3d(last, ll);

        		var t = ll.meta.ele - last.meta.ele;
        		if (t > 0) this._info.elevation.gain += t;
        		else this._info.elevation.loss += Math.abs(t);

        		t = Math.abs(ll.meta.time - last.meta.time);
        		this._info.duration.total += t;
        		if (t < options.max_point_interval) this._info.duration.moving += t;
      		} else {
        		this._info.duration.start = ll.meta.time;
      		}

      		last = ll;
      		coords.push(ll);
    	}

    	return coords;
  	},

});