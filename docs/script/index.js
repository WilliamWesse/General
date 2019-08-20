var LightnessDivId = 'lightnessDivId';
var LightnessInputId = 'lightnessInputId';
var SaturationDivId = 'saturationDivId';
var SaturationInputId = 'saturationInputId';
var StartColorInputId = 'startColorInputId';
var HueDivId ='hueDivId';
var HueInputId = 'hueInputId';
var ColorPaletteId = 'colorPaletteId'; /* canvas */
var PaletteCursorId = 'paletteCursorId';
var InputBigIncrement = 15;
var SelectedHue = 0;
var SelectedLightness = 0;
var SelectedSaturation = 100;
var GoldenRatio = 1.618;
var CONSOLE_DEBUG = false;
var DEBUG_INCREMENT = 15;

function Initialize()
{
   UpdateHue();
   UpdateLightness();
   UpdateSaturation();
   UpdateColorPalette(0);
   //UpdatePaletteStartColor();
}

function GetNumericInput(id, percent, fraction)
{
   var element = null;
   var value = 0;
   try {
      element = document.getElementById(id);
      if (element == null || element.tagName.toLowerCase() != 'input' ||
         element.type != 'number') {
         if (CONSOLE_DEBUG) {
            var msg = arguments.callee.name + '(' + id + ',' + percent + ',' + fraction +') invalid';
            if (element.tagName.toLowerCase() != 'input')
               msg += ' element: ' + element.tagName;
            if (element.type != 'number')
               msg += ' type: ' + element.type;
            console.log(msg + element.tagName + ' ' + element.type);
         }
      }
      else {
         if (percent) value = SanitizePercent(element.value, fraction);
         else value = SanitizeDegrees(element.value, fraction);
         var val = percent ? SanitizePercent(element.value, false) : SanitizeDegrees(element.value, false);
         if (element.value != val) element.value = val;
      }
      return [element, value];
   }
   catch (e) { LogError(arguments, e); }
   if (CONSOLE_DEBUG)
      console.log(arguments.callee.name +
         '(' + id + ',' + percent + ',' + fraction + ') value: ' + element.value + ' -> ' + value);
   return [element, value];
}

function GetOffset(element)
{
   var top = 0;
   var left = 0;
   do {
      top = element.offsetTop;
      left = element.offsetLeft;
      if (CONSOLE_DEBUG) console.log(arguments.callee.name +
         ' offset[' + left + ', ' + top +']');
      element = element.parentNode;
   } while (element.parentNode != null &&
      element.parentNode != element.parentNode);
   return [left, top];
}

function UpdateColorPalette(hueInDegrees)
{
   try {
      var canvas = document.getElementById(ColorPaletteId);
      var ctx = canvas.getContext('2d');
      hueInDegrees = SanitizeDegrees(hueInDegrees, false);
      if (CONSOLE_DEBUG) console.log(arguments.callee.name +
         '(' + hueInDegrees + '°)' +
         canvas.clientWidth + ' x ' + canvas.clientHeight);
      for (var i = 0; i < canvas.clientWidth; i++) {
         var color = StyleRgbFromHue(i+hueInDegrees);
         ctx.fillStyle = color;
         ctx.fillRect(i,0,1,canvas.clientHeight);
      }
   }
   catch (e) { LogError(arguments, e); }
}

function UpdatePaletteStartColor()
{
   var input = document.getElementById(StartColorInputId);
   UpdateColorPalette(input.value);
}

function UpdateHue()
{
   try {
      var ni = GetNumericInput(HueInputId, false, false);
      SelectedHue = ni[1];
      var color = StyleRgbFromHue(ni[1]);
      color = StyleRgbFromHsl(SelectedHue, SelectedSaturation/100, SelectedLightness/100);
      var msg = '';
      if (CONSOLE_DEBUG) {
         msg = arguments.callee.name + '(' + ni[1] + '°) ' + color;
         console.log(msg);
      }
      var element = document.getElementById(HueDivId);
      element.style.backgroundColor = color;

      var palette = document.getElementById(ColorPaletteId);
      var cursor = document.getElementById(PaletteCursorId);
      var offset = GetOffset(palette);
      var nudge = (cursor.offsetWidth >> 1) - 1;
      var newx = offset[0] + ni[1] - nudge; /* + parseInt(value) */
      if (CONSOLE_DEBUG)
         console.log(msg + ' palette: ' + offset[0] + ' x ' + offset[1]);
      var newy = offset[1] + 1;/* (palette.clientHeight >> 1) - nudge; */
      cursor.style.borderColor =
         StyleRgbFromHue(SanitizeDegrees(ni[1] + 180, false));
      if (CONSOLE_DEBUG) console.log(msg +
         ' palette: ' + offset[0] + ' x ' + offset[1] +
         ' cursor: ' + newx + ' x ' + newy +
         ' border: ' + cursor.style.borderColor);
      cursor.style.left = newx + 'px';
      cursor.style.top = newy + 'px';
   }
   catch (e) { LogError(arguments, e); }
}

function UpdateLightness()
{
   try {
      var ni = GetNumericInput(LightnessInputId, true, false);
      SelectedLightness = ni[1];
      var color = StyleRgbFromHsl(SelectedHue, SelectedSaturation/100, SelectedLightness/100);
      var msg;
      if (CONSOLE_DEBUG) {
         msg = arguments.callee.name + '(' + ni[1] + '%) value: ' + ni[0].value + ' color: ' + color;
         console.log(msg);
      }
      UpdateHue();
   }
   catch (e) { LogError(arguments, e); }
}

function UpdateSaturation()
{
   try {
      var ni = GetNumericInput(SaturationInputId, true, false);
      SelectedSaturation = ni[1];
      color = StyleRgbFromHsl(SelectedHue, SelectedSaturation/100, SelectedLightness/100);
      var msg;
      if (CONSOLE_DEBUG) {
         msg = arguments.callee.name + '(' + ni[1] + '%) value: ' + (ni[0].value * 2.5) + ' color: ' + color ;
         console.log(msg);
      }
      UpdateHue();
   }
   catch (e) { LogError(arguments, e); }
}

function LogError(args, e)
{
   console.log(args.callee.name + ' ' + e);
   console.log(e);
}

function Reset()
{
   var element = document.getElementById(SaturationInputId);
   element.value = 100;
   UpdateSaturation();
   element = document.getElementById(LightnessInputId);
   element.value = 50;
   UpdateLightness();
}

function SanitizeDegrees(degree, fraction)
{
   var mod = Math.abs(degree) % 360;
   // if (degree == 360) mod = degree; else
   if (degree < 0) mod = 360 - mod;
   return fraction ? mod/360 : mod;
}

function SanitizePercent(percent, fraction)
{
   var mod = Math.abs(percent) % 100;
   if (percent == 100) mod = percent;
   else if (percent < 0) mod = 100 - mod;
   return fraction ? mod/100 : mod;
}

function StyleRgbFromHsl(h, s, l)
{
   var rgb = hslToRgb(SanitizeDegrees(h, true),s,l);
   var val = "#";
   for (var i = 0; i < rgb.length; i++)
      val += rgb[i] < 16 ? '0' + rgb[i].toString(16) : rgb[i].toString(16);
   if (CONSOLE_DEBUG && (h % DEBUG_INCREMENT)==0)
      console.log(arguments.callee.name + '(' + h + '°) rgb: ' + val);
   return val;
}

function StyleRgbFromHue(hueInDegrees)
{
   var rgb = hslToRgb(SanitizeDegrees(hueInDegrees, true), 1.0, 0.5);
   var decl = "#";
   for (var i = 0; i < rgb.length; i++)
      decl += rgb[i] < 16 ? '0' + rgb[i].toString(16) : rgb[i].toString(16);
   if (CONSOLE_DEBUG && (hueInDegrees % DEBUG_INCREMENT)==0)
      console.log(arguments.callee.name + '(' + hueInDegrees + '°) rgb: ' + decl);
   return decl;
}

/**
 * Color spaces! RGB, HSL, Cubehelix, Lab (CIELAB) and HCL (CIELCH).
 * https://github.com/d3/d3-color/tree/v1.2.3
 * src\color.js(333-342)
 * https://observablehq.com/collection/@d3/d3-color
 *
 * @param {*} h TODO
 * @param {*} m1 TODO
 * @param {*} m2 TODO
 */
/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
   return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

/**
 * HSL to RGB color conversion [closed]
 * https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
   var r, g, b;

   if(s == 0){
      r = g = b = l; // achromatic
   }else{
      var hue2rgb = function hue2rgb(p, q, t){
         if(t < 0) t += 1;
         if(t > 1) t -= 1;
         if(t < 1/6) return p + (q - p) * 6 * t;
         if(t < 1/2) return q;
         if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
         return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
   }
   return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}