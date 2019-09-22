
enum HslAxis { H = 0, S = 1, L = 2, A = 3 }
enum RgbAxis { R = 0, G = 1, B = 2, A = 3 }
enum HslNorm { H = 0, S = 100, L = 50, A = 100 }
enum HslFmt {
   hsl,   // 'hsl(',
   hsla,  // 'hsla('
   rgb,   // 'rgb(',
   rgba,  // 'rgba('
   style, // '#',
}
enum CtrlTags {
   none,
   button,
   input
}

enum CtrlType {
   none,
   button,   // A push button with no default behavior.
   checkbox, // A check box allowing single values to be selected/deselected.
   color,    // HTML5 A control for specifying a color. A color picker's UI has no required features other than accepting simple colors as text (more info).
   date,     // HTML5 A control for entering a date (year, month, and day, with no time).
   dtlocal,  // HTML5 (datetime-local) A control for entering a date and time, with no time zone.
   email,    // HTML5 A field for editing an e-mail address.
   file,     // A control that lets the user select a file. Use the accept attribute to define the types of files that the control can select.
   hidden,   // A control that is not displayed but whose value is submitted to the server.
   image,    // A graphical submit button. You must use the src attribute to define the source of the image and the alt attribute to define alternative text. You can use the height and width attributes to define the size of the image in pixels.
   month,    // HTML5 A control for entering a month and year, with no time zone.
   number,   // HTML5 A control for entering a number.
   password, // A single-line text field whose value is obscured. Use the maxlength and minlength attributes to specify the maximum length of the value that can be entered.
   radio,    // A radio button, allowing a single value to be selected out of multiple choices.
   range,    // HTML5 A control for entering a number whose exact value is not important.
   reset,    // A button that resets the contents of the form to default values.
   search,   // HTML5 A single-line text field for entering search strings. Line-breaks are automatically removed from the input value.
   submit,   // A button that submits the form.
   tel,      // HTML5 A control for entering a telephone number.
   text,     // A single-line text field. Line-breaks are automatically removed from the input value.
   time,     // HTML5 A control for entering a time value with no time zone.
   url,      // HTML5 A field for entering a URL.
   week,     // HTML5 A control for entering a date consisting of a week-year number and a week number with no time zone.

}
interface HslMeta { axes: number[], formats: string[], value: number, color: number }
const GetCtrlType: Function = (type: string): CtrlType => {

   if (type == null || type.length == 0) return CtrlType.none;
   switch (type.toLowerCase())
   {
      case 'button':   return CtrlType.button;
      case 'checkbox': return CtrlType.checkbox;
      case 'color':    return CtrlType.color;
      case 'date':     return CtrlType.date;
      case 'datetime-local': return CtrlType.dtlocal;
      case 'email':    return CtrlType.email;
      case 'file':     return CtrlType.file;
      case 'hidden':   return CtrlType.hidden;
      case 'image':    return CtrlType.image;
      case 'month':    return CtrlType.month;
      case 'number':   return CtrlType.number;
      case 'password': return CtrlType.password;
      case 'radio':    return CtrlType.radio;
      case 'range':    return CtrlType.range;
      case 'reset':    return CtrlType.reset;
      case 'search':   return CtrlType.search;
      case 'submit':   return CtrlType.submit;
      case 'tel':      return CtrlType.tel;
      case 'text':     return CtrlType.text;
      case 'time':     return CtrlType.time;
      case 'url':      return CtrlType.url;
      case 'week':     return CtrlType.week;
   }
   return CtrlType.none;
};
const GetCtrlTagType: Function = (tag: string): CtrlTags => {
   if (tag == null || tag.length == 0) return CtrlTags.none;
   switch (tag.toLowerCase())
   {
      case 'button': return CtrlTags.button;
      case 'input': return CtrlTags.input;
   }
   return CtrlTags.none;
};

/**
 * see: https://www.w3.org/TR/REC-xml/#NT-Name
 * see: https://www.w3.org/TR/REC-xml-names/#ns-qualnames
 * see: https://stackoverflow.com/questions/3158274/what-would-be-a-regex-for-valid-xml-names/51413159#51413159
 * see: Brett Leuszler: https://stackoverflow.com/users/1542024/brett-leuszler
 * Breakdown (redacted): Single token (BMP0, ASCII)
 * SubExpression                Validates (case-insensitive)
 * ============================ ===============================================
 * ^([_a-z][\w]?|               any string with 1 or 2 characters in length.
 *   [a-w_yz][\w]{2,}|          any 3+ string absent an "x" in position 1.
 *   [_a-z][a-l_n-z\d][\w]+|    any 3+ string absent an "m" in position 2.
 *   [_a-z][\w][a-k_m-z\d][\w]* any 3+ string absent an "l" in position 3.
 * )$/i                         case-insensitive, expression literal reduction.
 * - [Brett Leuszler] posted [the original] with the idea that it may help
 *   anyone who's looking for a slightly more straight-forward (albeit Anglo-
 *   centric) solution for parsing a simplified set of XML element (tag) names.
 * */
const IdRE: RegExp = new RegExp(
   '^([_a-z][\w]?|' +
   '[a-w_yz][\w]{2,}|' +
   '[_a-z][a-l_n-z\d][\w]+|' +
   '[_a-z][\w][a-k_m-z\d][\w]*)$/i');

class HslAxisCtrl {

   public AxisIs: Function = (axis: HslAxis): boolean => {
      return axis == this.Axis;
   };

   public Reset: Function = (notify: boolean = true): boolean => {
      this.Value = this.DefaultValue;
      return notify ? this.Controller.ValueChanged(this) : this.Valid;
   };

   get Axis(): HslAxis { return this._axis; };
   // get Control(): HTMLElement { return this._ctrl; };
   get Controller(): HslAxisController { return this._controller; };
   get DefaultValue(): number { return this._default; };
   set DefaultValue(value: number) {
      this._default = this.Controller.SanitizeValue(value);
   };
   get Id(): string { return this._id; };
   get IsAngle(): boolean { return this._angle; };
   get IsInteger(): boolean { return this._isInt; };
   get IsPercent(): boolean { return !this._angle; };
   get Valid(): boolean { return this._valid; };
   get Value(): number { return this._value; };
   set Value(value: number) {
      this._value = this.Controller.SanitizeValue(this, value);
   };

   constructor(
      controller: HslAxisController,
      id: string,
      axis: HslAxis,
      defaultValue: number = 0) {

      if (controller == null) throw 'controller is null';
      if (id == null || id.length == 0)
         throw 'id is ' + id == null ? 'null' : 'empty';
      if (IdRE.exec(id) == null) throw 'id is invalid: ' + id;

      this._controller = controller;
      this._id = id;
      this._axis = axis;
      switch (this.Axis)
      {
         case HslAxis.H: this._angle = true; break;
         case HslAxis.S:
         case HslAxis.L:
         case HslAxis.A: break;
         default: throw 'Invalid Axis: ' + axis;
      }
      this._valid = this.Controller !== null;
      this.DefaultValue = this._value =
         this.Controller.SanitizeValue(this, defaultValue);

      var ctrl = document.getElementById(id);
      var isValid = ctrl !== null;
      if (isValid) {

      }
      this._tagType = GetCtrlTagType(ctrl.tagName);
      this._ctlType = GetCtrlType(ctrl.getAttribute('type'));
      switch (this._tagType)
      {
         case CtrlTags.input:
            switch (this._ctlType)
            {
               case CtrlType.number: this._valueCtrl = ctrl; break;
               case CtrlType.range: this._rangeCtrl = ctrl; break; /* slider */
               case CtrlType.button:
               case CtrlType.reset: this._resetCtrl = ctrl; break;
               case CtrlType.submit:
               default: isValid = false; break;
            }
            break;
         case CtrlTags.button:
            switch (this._ctlType)
            {
               case CtrlType.button:
               case CtrlType.reset: this._resetCtrl = ctrl; break;
               case CtrlType.submit:
               default: isValid = false; break;
            }
            break; /* Reset */
      }
      if (!isValid) {
         throw 'Invalid ' + this._tagType + ' \'type\' attribute: ' + this._ctlType;
      }
      if (!this.Valid) {
         return;
      }
      if (this.IsPercent) {
         // this.Control.onclick = null;
         // let OnClick: Function = (event: Event) => {
         //    this._value = this.Controller.SanitizePercentInput(this.Control.nodeValue);
         // };
      }
   }
   protected _angle: boolean = false;
   protected _axis: HslAxis = HslAxis.S;
   // protected _ctrl: HTMLElement;
   protected _resetCtrl: HTMLElement = null; // input type="reset"
   protected _valueCtrl: HTMLElement = null; // input type="number"
   protected _rangeCtrl: HTMLElement = null; // input type="range"

   protected _controller: HslAxisController;
   protected _default: number = HslNorm.S;
   protected _id: string;
   protected _isInt: boolean = true;
   protected _valid: boolean = false;
   protected _value: number = 0;
   protected _tagType: CtrlTags = CtrlTags.none;
   protected _ctlType: CtrlType = CtrlType.none;
}

class HslAxisController {

   constructor(id: string)
   {
      this._axes[HslAxis.H] = new HslAxisCtrl(this, id + 'H', HslAxis.H, HslNorm.H);
      this._axes[HslAxis.S] = new HslAxisCtrl(this, id + 'S', HslAxis.S, HslNorm.S);
      this._axes[HslAxis.L] = new HslAxisCtrl(this, id + 'L', HslAxis.L, HslNorm.L);
      this._axes[HslAxis.A] = new HslAxisCtrl(this, id + 'A', HslAxis.A, HslNorm.A);
   }

   get H():HslAxisCtrl { return this._axes[HslAxis.H]; };
   get S():HslAxisCtrl { return this._axes[HslAxis.S]; };
   get L():HslAxisCtrl { return this._axes[HslAxis.L]; };
   get A():HslAxisCtrl { return this._axes[HslAxis.A]; };
   get Color(): number { return this.Meta.color; };
   get Dirty(): boolean { return this._dirty; };
   get Meta(): HslMeta { return this._meta(); };
   get Style(): string { return this.Meta[HslFmt.style]; };
   get Valid(): boolean { return this._valid(); };
   get Value(): number { return this.Meta.value };

   public Reset: Function = (): boolean => {

      this._axes.forEach ((element) => { element.Reset(false); });
      this._dirty = false;
      return true;
   };

   public ValueChanged: Function = (ctrl: HslAxisCtrl): boolean => {
      // BUGBUG TODO
      if (ctrl == null) {

      }
      switch (ctrl.Axis)
      {
         case HslAxis.H: break;
         case HslAxis.S: break;
         case HslAxis.L: break;
         case HslAxis.A: break;
         default: throw 'Invalis Axis: ' + ctrl.Axis;
      }
      // Set display items
      return true;
   };

   public SanitizeDegree: Function = (value: number) => {
      value = Math.round(value);
      var result = Math.abs(value) % 360;
      if (result > 359) return 0;
      return value >= 0 ? result : 360 - result;
   };

   public SanitizeDegreeInput: Function = (input: string) => {
      var value = Number.parseFloat(input);
      return Number.isNaN(value) ? 0 : this.SanitizeDegree(value);
   }

   public SanitizeInput: Function = (ctrl: HslAxisCtrl, input: string) => {
      var value = Number.parseFloat(input);
      value = ctrl.IsPercent ? this.SanitizePercent(value) : this.SanitizeDegree(value);
   }

   public SanitizePercent: Function = (value: number) => {
      value = Math.round(value);
      if (value > 100) return 0;
      return value < 0 ? 100 : value;
   }

   public SanitizePercentInput: Function = (input: string) => {
      var value = Number.parseFloat(input);
      return Number.isNaN(value) ? 0 : this.SanitizePercent(value);
   }

   public SanitizeValue: Function = (ctrl: HslAxisCtrl, value: number) => {
      var value = Math.round(value);
      value = ctrl.IsPercent ? this.SanitizePercent(value) : this.SanitizeDegree(value);
   }

   protected _formats: string[] = [
      'hsl(',  // 0 hsl
      'hsla(', // 1 hsla
      'rgb(',  // 2 rgb
      'rgba(', // 3 rgba
      '#',     // 4 style
   ];

   /**
    * Redacted and adapted from: function hslToRgb(h, s, l)
    * https://gist.github.com/mjackson/5311256#file-color-conversion-algorithms-js
    * Lines 36-72
    * Michael Jackson https://gist.github.com/mjackson
    * Converts an HSLA color value to RGBA. Conversion formula
    * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes h, s, l and a are contained in the set [0, 1] and
    * with r, g, b and a results in the set [0, 255].
    * See: interface HslMeta
    */
   protected _CreateMeta: Function = (): HslMeta => {

      var h: number = this.H.Value/360;
      var s: number = this.S.Value/100;
      var l: number = this.L.Value/100;
      var a: number = this.A.Value/100;
      var axes: number[] = [l,l,l,a]; // achromatic, alpha pass-through

      if (s > 0) { // chromatic
         var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
         var p = 2 * l - q;
         axes[RgbAxis.R] = this._hue2rgb(p, q, h + 1/3);
         axes[RgbAxis.G] = this._hue2rgb(p, q, h);
         axes[RgbAxis.G] = this._hue2rgb(p, q, h - 1/3);
      }
      var value: number = 0;
      var fmts: string[] = this._formats.slice(0); // Clone formats
      var sep: string = ', ';
      var psep: string = '%, ';
      var shift: number = 0;

      axes.forEach((element) => {
         element = Math.round(element * 255);
         if (shift < 24) { // consume: H, S, L produce: R, G, B
            var dec = element.toString(10);
            var txt = dec + sep;
            fmts[HslFmt.rgb] += txt;
            fmts[HslFmt.rgba] += txt;
            if (shift > 0) txt = dec + psep;
            fmts[HslFmt.hsl] += txt;
            fmts[HslFmt.hsla] += txt;
            txt = element.toString(16);
            fmts[HslFmt.style] += element < 16 ? '0' + txt : txt;
         }
         else { // transfer: alpha, finalize: hsl, rgb
            fmts[HslFmt.rgb] += ')';
            fmts[HslFmt.hsl] += ')';
            fmts[HslFmt.rgba] += sep + a;
            fmts[HslFmt.hsla] += sep + a;
         }
         value |= (element & 0xFF) << shift;
         shift += 8;
      });
      fmts[HslFmt.hsla] += ')'; // finalize: hsla, rgba
      fmts[HslFmt.rgba] += ')';
      return {
         axes: axes, formats: fmts, value: value, color: value & 0x00FFFFFF
      };
   };

   protected _hue2rgb: Function = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
   }

   protected _axes: HslAxisCtrl[] = [null, null, null, null];
   protected _dirty: boolean = true;
   protected _m: HslMeta;

   protected _meta: Function = (): HslMeta => {
      if (this._dirty) {
         this._m = this._CreateMeta();
         this._dirty = false;
      }
      return this._m;
   };

   protected _valid: Function = (): boolean => {
      this._axes.forEach ((element) => { if (!element.Valid) return false; });
      return true;
   };
}
