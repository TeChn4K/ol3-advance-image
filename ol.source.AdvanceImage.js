ol.source.AdvanceImage = function sourceAdvanceImage(params) {
  // Default options
  const options = {
    attributions: params.attributions,
    logo: params.logo,
    projection: params.projection,
  }

  this.position = params.imagePosition
  this.rotate = params.imageRotate ? params.imageRotate : 0
  this.crop = params.imageCrop

  // Load Image
  this.image = params.image ? params.image : new Image
  this.image.crossOrigin = params.crossOrigin

  this.image.onload = () => {
    this.setCrop(self.crop)
    this.changed()
  }

  if (!params.image) {
    this.image.src = params.url
  }

  // Draw image on canvas
  options.canvasFunction = function(extent, resolution, pixelRatio, size, projection) {
    const canvas = document.createElement("canvas")
    canvas.width = size[0]
    canvas.height = size[1]

    const ctx = canvas.getContext("2d")

    if (!this.imageSize) {
      return canvas
    }

    // transform coords to pixel
    function coordsToPixels(xy) {
      return [
        Math.round((xy[0] - extent[0]) / (extent[2] - extent[0]) * size[0]),
        Math.round((xy[1] - extent[3]) / (extent[1] - extent[3]) * size[1]),
      ]
    }
    
    const pixel = coordsToPixels(this.position[0])
    const pixel2 = coordsToPixels(this.rotatePoint(this.position[0], this.position[1], this.rotate))

    const scale = [
      (pixel2[0] - pixel[0]) / this.imageSize[0],
      (pixel2[1] - pixel[1]) / this.imageSize[1],
    ]

    // Draw
    const scaleX = Math.round(this.imageSize[0] * scale[0])
    const scaleY = Math.round(this.imageSize[1] * scale[1])

    ctx.translate(pixel[0], pixel[1])

    if (this.rotate) {
      ctx.rotate(-this.rotate)
    }

    ctx.drawImage(this.image, this.crop[0], this.crop[1], this.imageSize[0], this.imageSize[1], 0, 0, scaleX, scaleY)

    this.dispatchEvent("draw")

    return canvas
  }

  ol.source.ImageCanvas.call(this, options)
  this.setCrop(this.crop)
}

ol.inherits(ol.source.AdvanceImage, ol.source.ImageCanvas)

ol.source.AdvanceImage.prototype.rotatePoint = function(origin, point, radians) {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = (cos * (point[0] - origin[0])) + (sin * (point[1] - origin[1])) + origin[0]
  const ny = (cos * (point[1] - origin[1])) - (sin * (point[0] - origin[0])) + origin[1]
  return [nx, ny]
}

/**
 * Get coordinate of the image position.
 * @return {ol.Coordinate} coordinate of the image position.
 * @api stable
 */
ol.source.AdvanceImage.prototype.getPosition = function() {
  return this.position
}
/**
 * Set coordinate of the image position.
 * @param {ol.Coordinate} coordinate of the image position.
 * @api stable
 */
ol.source.AdvanceImage.prototype.setPosition = function(position) {
  this.position = position
  this.changed()
}

/**
 * Get image rotation.
 * @return {Number} rotation in degre.
 * @api stable
 */
ol.source.AdvanceImage.prototype.getRotation = function() {
  return this.rotate
}
/**
 * Set image rotation.
 * @param {Number} rotation in radian.
 * @api stable
 */
ol.source.AdvanceImage.prototype.setRotation = function(angle) {
  this.rotate = angle
  this.changed()
}

/**
 * Get the image.
 * @api stable
 */
ol.source.AdvanceImage.prototype.getImage = function() {
  return this.image
}

/**
 * Get image crop extent.
 * @return {ol.extent} image crop extent.
 * @api stable
 */
ol.source.AdvanceImage.prototype.getCrop = function() {
  return this.crop
}


/**
 * Set image crop extent.
 * @param {ol.extent|Number} image crop extent or a number to crop from original size.
 * @api stable
 */
ol.source.AdvanceImage.prototype.setCrop = function(crop) {
  // Image not loaded => get it latter
  if (!this.image.naturalWidth) {
    this.crop = crop
    return
  }

  if (crop) {
    if (typeof crop === "number") {
      crop = [crop, crop, this.image.naturalWidth - crop, this.image.naturalHeight - crop]
    }
    else if (typeof crop === "object") {
      if (crop.length !== 4) {
        return
      }
    }
    else {
      return
    }

    crop = ol.extent.boundingExtent([[crop[0], crop[1]], [crop[2], crop[3]]])
    this.crop = [Math.max(0, crop[0]), Math.max(0, crop[1]), Math.min(this.image.naturalWidth, crop[2]), Math.min(this.image.naturalHeight, crop[3])]
  }
  else {
    this.crop = [0, 0, this.image.naturalWidth, this.image.naturalHeight]
  }

  if (this.crop[2] <= this.crop[0]) {
    this.crop[2] = this.crop[0] + 1
  }
  if (this.crop[3] <= this.crop[1]) {
    this.crop[3] = this.crop[1] + 1
  }

  this.imageSize = [this.crop[2] - this.crop[0], this.crop[3] - this.crop[1]]
  this.changed()
}
