L.TileLayer.prototype._imageToDataUri = function (image) {
    var canvas = window.document.createElement('canvas');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    var context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);

    return canvas.toDataURL('image/png');
};

L.TileLayer.prototype._tileOnLoadWithCache = function () {
    var storage = this._layer.options.storage;
    if (storage) {
        storage.add(this._storageKey, this._layer._imageToDataUri(this));
    }
    L.TileLayer.prototype._tileOnLoad.apply(this, arguments);
};

L.TileLayer.prototype._setUpTile = function (tile, key, value, cache) {
    tile._layer = this;
    if (cache) {
        tile._storageKey = key;
        tile.onload = this._tileOnLoadWithCache;
        tile.crossOrigin = 'Anonymous';
    } else {
        tile.onload = this._tileOnLoad;
    }
    tile.onerror = this._tileOnError;
    tile.src = value;
};

L.TileLayer.prototype._loadTile = function (tile, tilePoint) {
    this._adjustTilePoint(tilePoint);
    var key = tilePoint.z + ',' + tilePoint.y + ',' + tilePoint.x;

    var self = this;
    if (this.options.storage) {
        this.options.storage.get(key, function (value) {
            if (value) {
                self._setUpTile(tile, key, value, false);
            } else {
                self._setUpTile(tile, key, self.getTileUrl(tilePoint), true);
            }
        }, function () {
            self._setUpTile(tile, key, self.getTileUrl(tilePoint), true);
        });
    } else {
        self._setUpTile(tile, key, self.getTileUrl(tilePoint), false);
    }
};


_.mixin({
    roundFloat: function (value, precision) {
        return Number((value).toFixed(precision || 0));
    }
});
