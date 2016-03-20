/**
* Default attributes of a drag and drop component
*/
var DefaultComponentPrototype = {

}
/**
* Representation of an Led Componet to be attached to the arduino
*
*/
function LedComponent(){

};

LedComponent.prototype = {
	update: function() {
		
	}
};

LedComponent.getAssetName = function() {
	return "LedComponentImage";
}

LedComponent.getAssetUrl = function() {
	return "./assets/led-icon.png";
}

LedComponent.getIconUrl = function() {
	return "./assets/led-icon.png";
}

/**
* Representation of a Yun Component
*
*/
function YunComponent() {

};

YunComponent.prototype = {

};