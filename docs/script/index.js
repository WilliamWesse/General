/* jshint esversion: 6 */
var DefaultHue = 0;
var DefaultSaturation = 100;
var DefaultLightness = 50;

var LightnessDivId = 'lightnessDivId';
var LightnessInputId = 'lightnessInputId';
var SaturationDivId = 'saturationDivId';
var SaturationInputId = 'saturationInputId';
var StartColorInputId = 'startColorInputId';
var ColorDivId ='colorDivId';
var HueInputId = 'hueInputId';
var ColorPaletteId = 'colorPaletteId'; /* canvas */
var PaletteCursorId = 'paletteCursorId';
var PlayBtnDegreeIncrement = 15;
var PlayBtnPercentIncrement = 5;
var SelectedHue = 0;
var SelectedLightness = 0;
var SelectedSaturation = 100;
var GoldenRatio = 1.618;
var CONSOLE_DEBUG = false;
var DEBUG_INCREMENT = 15;

var HslDimension =  { Hue: 0, Saturation: 1, Lightness: 2 };
var HslDimensionCtrlType = { None: 0, Percent: 1, Degrees: 2 };

class HslDimensionCtrl {
   constructor(controller, id, dimension, defaultValue) {

      this.Controller = controller; /* implements HslDimensionCtrl for Hue, Saturation, Lightness */
      this.Id = id;
      this.Type = HslDimensionCtrlType.None;
      this.Dimension = dimension;
      this.DefaultValue = defaultValue;
      switch (dimension)
      {
         case HslDimension.Hue: this.Type = HslDimensionCtrlType.Degrees; break;
         case HslDimension.Saturation:
         case HslDimension.Lightness: this.Type = HslDimensionCtrlType.Percent; break;
         default: throw 'Invalid Color Control Dimension: ' + dimension;
      }
      this.Control = document.getElementById(id);
      this.Valid = this.Control != null && this.Control.tagName.toLowerCase() == 'button';
      this.IsHue = this.Valid && this.Dimension == HslDimension.Hue;
      this.IsLightness = this.Valid && this.Dimension == HslDimension.Lightness;
      this.IsPercent = this.Valid && this.Type == HslDimensionCtrlType.Percent;
      this.IsSaturation = this.Valid && this.Dimension == HslDimension.Saturation;

      if (this.IsPercent) {
         // BUGBUG TODO implements Controller. This code uses existing globals.
         this.OnClick = function(event) {
            function UpdatePercentage(saturation)
            {
               try {
                  var ni = GetNumericInput(saturation ? SaturationInputId : LightnessInputId, true, false);
                  if (saturation) SelectedSaturation = ni[1];
                  else SelectedLightness = ni[1];
                  var color = StyleRgbFromHsl(SelectedHue, SelectedSaturation/100, SelectedLightness/100);
                  var msg;
                  if (CONSOLE_DEBUG) {
/* jshint ignore:start */
                     msg = arguments.callee.name + '(' + ni[1] + '%) ' +
                        (saturation ? 'saturation' : 'lightness') +
                        ' value: ' + ni[0].value + ' color: ' + color;
/* jshint ignore:end */
                     console.log(msg);
                  }
                  return UpdateHue();
               }
               catch (e) { LogError(arguments, e); }
               return false;
            }
         };
      }
      if (this.Valid)
      {

      }



      this.Initialize = function () {
         if (!this.Valid) return;

      };
   }
}

function Initialize()
{
   UpdateHue();
   UpdatePercentage(false);
   UpdatePercentage(true);
   UpdateColorPalette(0);
   ResetPlayButtons();
   console.log(new Date(Date.now()).toUTCString());
   var element = document.getElementById(PaletteCursorId);

   document.addEventListener('dragstart', CursorDragStart);
   document.addEventListener('dragend', EndCursorDrag);
   document.addEventListener('dragover', CursorDragOver);
}

function BlurPlayButton(id)
{
   var element = document.getElementById(id);
   
   switch (id)
   {
      case HueInputId: element.value = DefaultHue; UpdateHue(); break;
      case SaturationInputId: element.value = DefaultSaturation; UpdatePercentage(true); break;
      case LightnessInputId: element.value = DefaultLightness; UpdatePercentage(false); break;
   }
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
         value = SanitizeNumberInput(element.value, percent);
         if (element.value != value) element.value = value;
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

function IncrementInput(id, increment, percent)
{
   try {
      var ni = GetNumericInput(id, percent, false);
      var val = ni[1];
      var inc = id == HueInputId ? PlayBtnDegreeIncrement : PlayBtnPercentIncrement;
      if (increment) val += inc;
      else val -= inc;
      val = SanitizeNumberInput(val, percent);
      var msg;
      if (CONSOLE_DEBUG) {
         msg = arguments.callee.name + '(' + id + ') ' + ni[1] + '% value: ' + val;
         console.log(msg);
      }
      ni[0].value = val;
      switch (id)
      {
         case HueInputId: UpdateHue(); break;
         case SaturationInputId: UpdatePercentage(true); break;
         case LightnessInputId: UpdatePercentage(false); break;
      }
   }
   catch (e) { LogError(arguments, e); }
}

function UpdateColorPalette(hueInDegrees)
{
   try {
      var canvas = document.getElementById(ColorPaletteId);
      var ctx = canvas.getContext('2d');
      hueInDegrees = SanitizeNumberInput(hueInDegrees, false);
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
      var element = document.getElementById(ColorDivId);
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
         StyleRgbFromHue(SanitizeNumberInput(ni[1] + 180, false));
      if (CONSOLE_DEBUG) console.log(msg +
         ' palette: ' + offset[0] + ' x ' + offset[1] +
         ' cursor: ' + newx + ' x ' + newy +
         ' border: ' + cursor.style.borderColor);
      cursor.style.left = newx + 'px';
      cursor.style.top = newy + 'px';
      return true;
   }
   catch (e) { LogError(arguments, e); }
   return false;
}

function UpdateLightness()
{
   return UpdatePercentage(false);
}

function UpdatePercentage(saturation)
{
   try {
      var ni = GetNumericInput(saturation ? SaturationInputId : LightnessInputId, true, false);
      if (saturation) SelectedSaturation = ni[1];
      else SelectedLightness = ni[1];
      var color = StyleRgbFromHsl(SelectedHue, SelectedSaturation/100, SelectedLightness/100);
      var msg;
      if (!CONSOLE_DEBUG) {
         msg = arguments.callee.name + '(' + ni[1] + '%) ' +
            (saturation ? 'saturation' : 'lightness') +
            ' value: ' + ni[0].value + ' color: ' + color;
         console.log(msg);
      }
      return UpdateHue();
   }
   catch (e) { LogError(arguments, e); }
   return false;
}

function UpdateSaturation()
{
   return UpdatePercentage(true);
}

function LogError(args, e)
{
   console.log(args.callee.name + ' ' + e);
   console.log(e);
}

function Reset(id)
{
   var element = document.getElementById(id);
   switch (id)
   {
      case HueInputId: element.value = DefaultHue; UpdateHue(); break;
      case SaturationInputId: element.value = DefaultSaturation; UpdatePercentage(true); break;
      case LightnessInputId: element.value = DefaultLightness; UpdatePercentage(false); break;
   }
}

function ResetPlayButtons()
{
   Reset(HueInputId);
   Reset(SaturationInputId);
   Reset(LightnessInputId);
}

function ResetToStop(id, end)
{
   var element = document.getElementById(id);
   switch (id)
   {
      case HueInputId: element.value = end ? 359 : 0; UpdateHue(); break;
      case SaturationInputId: element.value = end ? 100 : 0; UpdatePercentage(true); break;
      case LightnessInputId: element.value = end ? 100 : 0; UpdatePercentage(false); break;
   }
}

function SanitizeDegreeInput(value)
{
   if (value.toString().indexOf('.') > -1) value = Math.round(value);
   var result = Math.abs(value) % 360;
   if (value == 360) return 0;
   switch (result) {
      case -1: return 359;
      case 360: return 360;
   }
   return value >= 0 ? result : 360 - result;
}

function SanitizeNumberInput(value, percent)
{
   return percent ? SanitizePercentInput(value) : SanitizeDegreeInput(value);
}

function SanitizePercentInput(value)
{
   if (value.toString().indexOf('.') > -1) value = Math.round(value);
   if (value > 100) return 0;
   if (value < 0) return 100;
   return value;
}

function EndCursorDrag(event)
{
   var element = document.getElementById(PaletteCursorId);
   if (CONSOLE_DEBUG) console.log(arguments.callee.name + ' left: ' + event.offsetX);
}

function CursorDragOver(event)
{
   var element = document.getElementById(PaletteCursorId);
   if (CONSOLE_DEBUG) console.log(arguments.callee.name + ' left: ' + event.offsetX);
}

function CursorDragStart(event)
{
   var element = document.getElementById(PaletteCursorId);
   //element.style.cursor = 'cell';
   if (CONSOLE_DEBUG) console.log(arguments.callee.name + ' left: ' + event.offsetX);
}

function SanitizeHue(value)
{
   var result = Math.abs(value) % 360;
   if (value < 0) result = 360 - result;
   return result == 360 ? 100 : result / 360;
}


function StyleRgbFromHsl(h, s, l)
{
   var rgb = hslToRgb(SanitizeHue(h), s, l);
   var val = "#";
   for (var i = 0; i < rgb.length; i++)
      val += rgb[i] < 16 ? '0' + rgb[i].toString(16) : rgb[i].toString(16);
   if (CONSOLE_DEBUG && (h % DEBUG_INCREMENT)==0)
      console.log(arguments.callee.name + '(' + h + '°) rgb: ' + val);
   return val;
}

function StyleRgbFromHue(hueInDegrees)
{
   var rgb = hslToRgb(SanitizeHue(hueInDegrees), 1.0, 0.5);
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