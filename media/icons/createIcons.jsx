/**
 * Photoshop script that creates the icon files from the
 * main psd file. The psd file must be open and active
 * in order for the script to work properly.
 * 
 * @author Tim Stoddard <tim.stoddard2@gmail.com>
 */

#target photoshop

var document = app.activeDocument;
var iconSizes = [16, 48, 128];
var initialRulerUnits = app.preferences.rulerUnits;
app.preferences.rulerUnits = Units.PIXELS;

for (var i = 0; i < iconSizes.length; i++) {
    var size = iconSizes[i];
    
    // resize with bicubic sharper (best for reduction)
    document.resizeImage(
      new UnitValue(size, 'px'),
      new UnitValue(size, 'px'),
      null,
      ResampleMethod.BICUBICSHARPER);
    
    // save as png (copy)
    var file = new File(decodeURI(document.path) + '/' + size + '.png');
    var options = new PNGSaveOptions();
    document.saveAs(file, options, true, Extension.LOWERCASE);
}

app.preferences.rulerUnits = initialRulerUnits;
document.close(SaveOptions.DONOTSAVECHANGES);
