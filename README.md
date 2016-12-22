# Openlayers 3 Advance Image

A new awesome openlayers 3 image source.

It allows you to add an image to your openlayers 3 map and rotate, scale or crop it.


## How to use it 

### Example

```
const image = new Image()
image.onload = () => {
	// Configure the source image
	const sourceImage = new ol.source.AdvanceImage({
		image: image, // the image object
		imagePosition: [bottomLeftPoint, topRightPoint], // The image extent
		imageRotate: radianAzimuth, // The image orientation
	})

	map.addLayer(new ol.layer.ImageAnimate({
		source: sourceImage,
	}))
}
image.src = "http://mydomain.com/myImage.jpg"
```

### Others

* It is possible to pass image URL directly.

* imageCrop option allow you to crop the image

`imageCrop: 10` OR `imageCrop: [10, 10, 50, 50]`



