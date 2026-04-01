/// <reference path="../glo.ts" />
/// <reference path="utils.ts" />

namespace conx.controls {
    export class Button {
        public static SetPrototype(that: any, withStyle: boolean = true): void {
            that.css = {};
            that._state = "reg";
            that._withStyle = withStyle;
            that._setStyle = (down: boolean) => {
                if (!that._withStyle) return;
                let style = that.css[that.state] || that.css?.reg;
                if (down)
                    style = that.css?.down || style;
                if (style)
                    glo.setStyle(that, style);
            }
            that.onPointerdown = (e: any) => {
                that.addEventListener("pointerup", that.onPointerup);
                that.addEventListener("pointerover", that.onPointerover);
                that.addEventListener("pointerout", that.onPointerout);
                that._setStyle(true);
            }
            that.onPointerover = (e: any) => {
                that._setStyle(true);
            }
            that.onPointerout = (e: any) => {
                that._setStyle(false);
            }
            that.onPointerup = (e: any) => {
                that.removeEventListener("pointerup", that.onPointerup);
                that.removeEventListener("pointerover", that.onPointerover);
                that.removeEventListener("pointerout", that.onPointerup);
                that._setStyle(false);
            }
            Object.defineProperty(that, "state", {
                get: function () {
                    return this._state;
                },
                set: function (value) {
                    this._state = value;
                    this._setStyle(false);
                }
            });
            that.addEventListener("pointerdown", that.onPointerdown);
        }
    }
}
