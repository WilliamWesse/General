/* jshint esversion: 6 */
var HslDimension =  { Hue: 0, Saturation: 1, Lightness: 2 };
var HslDimensionCtrlType = { None: 0, Percent: 1, Degrees: 2 };

class HslDimensionCtrl {
   constructor(controller, id, dimension, defaultValue) {

      /* implements HslDimensionCtrl for Hue, Saturation, Lightness */
      this.Controller = controller;
      this.Id = id;
      this.Type = HslDimensionCtrlType.None;
      this.Dimension = dimension;
      this.DefaultValue = defaultValue;
      switch (dimension)
      {
         case HslDimension.Hue:
            this.Type = HslDimensionCtrlType.Degrees; break;
         case HslDimension.Saturation:
         case HslDimension.Lightness:
            this.Type = HslDimensionCtrlType.Percent; break;
         default: throw 'Invalid Color Control Dimension: ' + dimension;
      }
      this.Control = document.getElementById(id);
      this.Valid = this.Control != null &&
         this.Control.tagName.toLowerCase() == 'button';
      this.IsHue = this.Valid && this.Dimension == HslDimension.Hue;
      this.IsLightness = this.Valid &&
         this.Dimension == HslDimension.Lightness;
      this.IsPercent = this.Valid &&
         this.Type == HslDimensionCtrlType.Percent;
      this.IsSaturation = this.Valid &&
         this.Dimension == HslDimension.Saturation;

      if (this.IsPercent) {
         // BUGBUG TODO implements Controller. This code uses existing globals.
         this.OnClick = function(event) {
            function UpdatePercentage(saturation)
            {
               try {
                  var ni = GetNumericInput(
                     saturation ? SaturationInputId : LightnessInputId,
                     true, false);
                  if (saturation) SelectedSaturation = ni[1];
                  else SelectedLightness = ni[1];
                  var color = StyleRgbFromHsl(SelectedHue,
                     SelectedSaturation/100, SelectedLightness/100);
                  var msg;
                  if (CONSOLE_DEBUG>1) {
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

