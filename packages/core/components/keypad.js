(function framework7ComponentLoader(e,t){void 0===t&&(t=!0);var a;document,window,e.$,e.Template7,e.utils,e.device,e.support,e.Class,e.Modal,e.ConstructorMethods,e.ModalMethods;var n={name:"keypad",install:function(){a=function(e){return function(e){function t(a,n){e.call(this,n,[a]);var s=a.utils,l=a.$,o=a.request,r=this;r.app=a;var p,i,u,c,d,h,v,m,y=s.extend({on:{}},a.params.keypad);if(r.params=s.extend(y,n),r.params.containerEl&&0===(p=l(r.params.containerEl)).length)return r;if(!r.params.buttons||0===r.params.buttons.length){var f=r.params,b=f.dotCharacter,k=f.dotButton;"numpad"===r.params.type?r.params.buttons=[{html:'<span class="keypad-button-number">1</span><span class="keypad-button-letters"></span>',value:1},{html:'<span class="keypad-button-number">2</span><span class="keypad-button-letters">ABC</span>',value:2},{html:'<span class="keypad-button-number">3</span><span class="keypad-button-letters">DEF</span>',value:3},{html:'<span class="keypad-button-number">4</span><span class="keypad-button-letters">GHI</span>',value:4},{html:'<span class="keypad-button-number">5</span><span class="keypad-button-letters">JKL</span>',value:5},{html:'<span class="keypad-button-number">6</span><span class="keypad-button-letters">MNO</span>',value:6},{html:'<span class="keypad-button-number">7</span><span class="keypad-button-letters">PQRS</span>',value:7},{html:'<span class="keypad-button-number">8</span><span class="keypad-button-letters">TUV</span>',value:8},{html:'<span class="keypad-button-number">9</span><span class="keypad-button-letters">WXYZ</span>',value:9},{html:k?'<span class="keypad-button-number">'+b+"</span>":"",value:k?b:void 0,dark:!0,cssClass:k?"":"keypad-dummy-button"},{html:'<span class="keypad-button-number">0</span>',value:0},{html:'<i class="icon icon-keypad-delete"></i>',cssClass:"keypad-delete-button",dark:!0}]:"calculator"===n.type&&(r.params.buttons=[{html:'<span class="keypad-button-number">C</span>',value:"C",dark:!0},{html:'<span class="keypad-button-number">±</span>',value:"±",dark:!0},{html:'<span class="keypad-button-number">%</span>',value:"%",dark:!0},{html:'<span class="keypad-button-number">÷</span>',value:"÷",cssClass:"calc-operator-button"},{html:'<span class="keypad-button-number">7</span>',value:7},{html:'<span class="keypad-button-number">8</span>',value:8},{html:'<span class="keypad-button-number">9</span>',value:9},{html:'<span class="keypad-button-number">×</span>',value:"×",cssClass:"calc-operator-button"},{html:'<span class="keypad-button-number">4</span>',value:4},{html:'<span class="keypad-button-number">5</span>',value:5},{html:'<span class="keypad-button-number">6</span>',value:6},{html:'<span class="keypad-button-number">-</span>',value:"-",cssClass:"calc-operator-button"},{html:'<span class="keypad-button-number">1</span>',value:1},{html:'<span class="keypad-button-number">2</span>',value:2},{html:'<span class="keypad-button-number">3</span>',value:3},{html:'<span class="keypad-button-number">+</span>',value:"+",cssClass:"calc-operator-button"},{html:'<span class="keypad-button-number">0</span>',value:0,cssClass:"keypad-button-double"},{html:'<span class="keypad-button-number">.</span>',value:b},{html:'<span class="keypad-button-number">=</span>',value:"=",cssClass:"calc-operator-button calc-operator-button-equal"}])}function g(){r.open()}function O(e){e.preventDefault()}function E(e){var t=l(e.target);r.isPopover()||r.opened&&(t.closest('[class*="backdrop"]').length||(i&&i.length>0?t[0]!==i[0]&&0===t.closest(".sheet-modal, .keypad-modal").length&&r.close():0===l(e.target).closest(".sheet-modal, .keypad-modal").length&&r.close()))}function $(e){if(0!==e.length){var t=r.params.buttons[e.index()],a=t.value,n=r.value;if("numpad"===r.params.type&&(void 0===n&&(n=""),e.hasClass("keypad-delete-button")?n=n.substring(0,n.length-1):void 0!==a&&("."===a&&n.indexOf(".")>=0&&(a=""),n+=a),void 0!==n&&r.setValue(n)),"calculator"===r.params.type)r.calculator(t.value),r.$el.find(".keypad-buttons").find(".calc-operator-active").removeClass("calc-operator-active"),e.hasClass("calc-operator-button")&&!e.hasClass("calc-operator-button-equal")&&e.addClass("calc-operator-active");r.emit("local::buttonClick keypadButtonClick",r,t),t.onClick&&t.onClick(r,t)}}function C(e){var t=l(e.target).closest(".keypad-button");t.length&&$(t)}r.params.inputEl&&(i=l(r.params.inputEl)),(u=r.params.view?r.params.view:i&&i.length?i.parents(".view").length&&i.parents(".view")[0].f7View:a.views.get(i))||(u=a.views.main),s.extend(r,{app:a,request:o,$containerEl:p,containerEl:p&&p[0],inline:p&&p.length>0,$inputEl:i,inputEl:i&&i[0],initialized:!1,opened:!1,view:u,url:r.params.url,calcValues:[],calcOperations:[],lastWasNumber:!1}),s.extend(r,{attachInputEvents:function(){r.$inputEl.on("click",g),r.params.inputReadOnly&&r.$inputEl.on("focus mousedown",O)},detachInputEvents:function(){r.$inputEl.off("click",g),r.params.inputReadOnly&&r.$inputEl.off("focus mousedown",O)},attachHtmlEvents:function(){a.on("click",E)},detachHtmlEvents:function(){a.off("click",E)}});function x(e){if(!d&&!h){var t=l(e.target).closest(".keypad-button");t.length&&(c=t,d=!0,v=e.targetTouches[0].pageX,m=e.targetTouches[0].pageY)}}function V(e){if(d){var t=(e.targetTouches[0]||e.changedTouches[0]).pageX,a=(e.targetTouches[0]||e.changedTouches[0]).pageY;(Math.abs(t-v)>10||Math.abs(a-m)>10)&&(h=!0)}}function I(){if(d){if(h)return d=!1,void(h=!1);d=!1,h=!1,$(c)}}return r.attachKeypadEvents=function(){var e=r.$el.find(".keypad-buttons");a.support.touch?(e.on(a.touchEvents.start,x),a.on("touchmove",V),a.on("touchend",I)):e.on("click",C),r.detachKeypadEvents=function(){a.support.touch?(e.off(a.touchEvents.start,x),a.off("touchmove",V),a.off("touchend",I)):e.off("click",C)}},i&&i.length&&(i[0].f7Keypad=t),p&&p.length&&(p[0].f7Keypad=t),r.init(),r}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.initInput=function(){this.$inputEl&&this.params.inputReadOnly&&this.$inputEl.prop("readOnly",!0)},t.prototype.isPopover=function(){var e=this.app,t=this.modal,a=this.params;if("sheet"===a.openIn)return!1;if(t&&"popover"!==t.type)return!1;if(!this.inline&&this.inputEl){if("popover"===a.openIn)return!0;if(e.device.ios)return!!e.device.ipad;if(e.width>=768)return!0}return!1},t.prototype.calculator=function(e){var t=this,a="+ - = × ÷ ± %".split(" ");function n(){for(var e="",n=0;n<t.calcOperations.length;n+=1){var s=t.calcOperations[n];n===t.calcOperations.length-1&&a.indexOf(s)>=0||s&&("."===s&&(s=0),e+=(""+s.toString()).replace("×","*").replace("÷","/"))}e=e.replace(/--/g,"+"),t.setValue(eval.call(window,e))}if(t.value||(t.value=0),"C"===e)return t.setValue(0),t.calcValues=[],void(t.calcOperations=[]);if([0,1,2,3,4,5,6,7,8,9,"."].indexOf(e)>=0){if("."===e&&t.lastWasNumber&&t.value.toString().indexOf(".")>=0)return;a.indexOf(t.calcValues[t.calcValues.length-1])>=0?t.setValue(e):t.setValue(t.value?""+t.value+e:e),t.lastWasNumber=!0}if(a.indexOf(e)>=0)if("±"===e){if("."===t.value)return;t.setValue(-1*t.value),t.lastWasNumber=!0}else if("%"===e){if(t.calcOperations[t.calcOperations.length-2]){var s=t.value/100;t.setValue(t.calcOperations[t.calcOperations.length-2]*s)}t.lastWasNumber=!0}else{var l=t.calcOperations[t.calcOperations.length-1];if("="===e){if("="===t.calcOperations[t.calcOperations.length-1]){if(t.calcOperations.length<2)return;t.calcOperations.pop();var o=t.calcOperations[t.calcOperations.length-2],r=t.calcOperations[t.calcOperations.length-1];t.calcOperations.push(o),t.calcOperations.push(r)}else t.calcOperations.push(t.value);t.calcOperations.push("="),n()}else["-","+","×","÷","="].indexOf(l)>=0?("="===l&&(t.calcOperations=[t.value,e]),["-","+","×","÷"].indexOf(l)>=0&&(t.lastWasNumber?["-","+"].indexOf(l)>=0&&["×","÷"].indexOf(e)>=0?(t.calcOperations.push(t.value),t.calcOperations.push(e)):(t.calcOperations.push(t.value),t.calcOperations.push(e),n()):t.calcOperations[t.calcOperations.length-1]=e)):(t.calcOperations.push(t.value),t.calcOperations.push(e),n());t.lastWasNumber=!1}"±"!==e&&"%"!==e&&t.calcValues.push(e)},t.prototype.formatValue=function(e){return this.params.formatValue?this.params.formatValue.call(this,e):e},t.prototype.setValue=function(e){this.updateValue(e)},t.prototype.getValue=function(){return this.value},t.prototype.updateValue=function(e){this.value=e,this.params.valueMaxLength&&this.value.length>this.params.valueMaxLength&&(this.value=this.value.substring(0,this.params.valueMaxLength)),this.emit("local::change keypadChange",this,this.value),this.$inputEl&&this.$inputEl.length>0&&(this.$inputEl.val(this.formatValue(this.value)),this.$inputEl.trigger("change"))},t.prototype.renderButtons=function(){for(var e,t,a="",n=0;n<this.params.buttons.length;n+=1)e="keypad-button",(t=this.params.buttons[n]).dark&&(e+=" keypad-button-dark"),t.cssClass&&(e+=" "+t.cssClass),a+='<span class="'+e+'">'+(t.html||"")+"</span>";return a},t.prototype.renderToolbar=function(){return this.params.renderToolbar?this.params.renderToolbar.call(this,this):('\n        <div class="toolbar">\n          <div class="toolbar-inner">\n            <div class="left"></div>\n            <div class="right">\n              <a href="#" class="link sheet-close popover-close">'+this.params.toolbarCloseText+"</a>\n            </div>\n          </div>\n        </div>\n      ").trim()},t.prototype.renderSheet=function(){if(this.params.renderSheet)return this.params.renderSheet.call(this,this);var e=this.params,t=e.cssClass,a=e.toolbar;return'\n        <div class="sheet-modal keypad keypad-sheet keypad-type-'+this.params.type+" "+(t||"")+'">\n          '+(a?this.renderToolbar():"")+'\n          <div class="sheet-modal-inner keypad-buttons">\n            '+this.renderButtons()+"\n          </div>\n        </div>\n      "},t.prototype.renderPopover=function(){if(this.params.renderPopover)return this.params.renderPopover.call(this,this);var e=this.params,t=e.cssClass,a=e.toolbar;return('\n        <div class="popover keypad-popover">\n          <div class="popover-inner">\n            <div class="keypad keypad-type-'+this.params.type+" "+(t||"")+'">\n              '+(a?this.renderToolbar():"")+'\n              <div class="keypad-buttons">\n                '+this.renderButtons()+"\n              </div>\n            </div>\n          </div>\n        </div>\n      ").trim()},t.prototype.renderInline=function(){if(this.params.renderInline)return this.params.renderInline.call(this,this);var e=this.params,t=e.cssClass,a=e.toolbar;return'\n        <div class="keypad keypad-inline keypad-type-'+this.params.type+" "+(t||"")+'">\n          '+(a?this.renderToolbar():"")+'\n          <div class="keypad-buttons">\n            '+this.renderButtons()+"\n          </div>\n        </div>\n      "},t.prototype.render=function(){var e=this.params;if(e.render)return e.render.call(this);if(!this.inline){var t=e.openIn;if("auto"===t&&(t=this.isPopover()?"popover":"sheet"),"popover"===t)return this.renderPopover();if("sheet"===t)return this.renderSheet()}return this.renderInline()},t.prototype.onOpen=function(){var e=this.initialized,t=this.$el,a=this.app,n=this.$inputEl,s=this.inline,l=this.value,o=this.params;this.opened=!0,this.attachKeypadEvents(),e?l&&this.setValue(l):l?this.setValue(l):o.value&&this.setValue(o.value),!s&&n.length&&"md"===a.theme&&n.trigger("focus"),this.initialized=!0,t&&t.trigger("keypad:open",this),n&&n.trigger("keypad:open",this),this.emit("local::open keypadOpen",this)},t.prototype.onOpened=function(){this.$el&&this.$el.trigger("keypad:opened",this),this.$inputEl&&this.$inputEl.trigger("keypad:opened",this),this.emit("local::opened keypadOpened",this)},t.prototype.onClose=function(){var e=this.app;this.$inputEl&&"md"===e.theme&&this.$inputEl.trigger("blur"),this.detachKeypadEvents&&this.detachKeypadEvents(),this.$el&&this.$el.trigger("keypad:close",this),this.$inputEl&&this.$inputEl.trigger("keypad:close",this),this.emit("local::close keypadClose",this)},t.prototype.onClosed=function(){var e=this;e.opened=!1,e.inline||e.app.utils.nextTick((function(){e.modal&&e.modal.el&&e.modal.destroy&&(e.params.routableModals||e.modal.destroy()),delete e.modal})),e.$el&&e.$el.trigger("keypad:closed",e),e.$inputEl&&e.$inputEl.trigger("keypad:closed",e),e.emit("local::closed keypadClosed",e)},t.prototype.open=function(){var e,t=this,a=t.app,n=t.opened,s=t.inline,l=t.$inputEl,o=t.params;if(!n){if(s)return t.$el=a.$(t.render()),t.$el[0].f7Keypad=t,t.$containerEl.append(t.$el),t.onOpen(),void t.onOpened();var r=o.openIn;"auto"===r&&(r=t.isPopover()?"popover":"sheet");var p=t.render(),i={targetEl:l,scrollToEl:t.params.scrollToInput?l:void 0,content:p,backdrop:void 0===t.params.backdrop?"sheet"!==r:t.params.backdrop,on:{open:function(){t.modal=this,t.$el="popover"===r?this.$el.find(".keypad"):this.$el,t.$el[0].f7Keypad=t,t.onOpen()},opened:function(){t.onOpened()},close:function(){t.onClose()},closed:function(){t.onClosed()}}};t.params.routableModals?t.view.router.navigate({url:t.url,route:(e={path:t.url},e[r]=i,e)}):(t.modal=a[r].create(i),t.modal.open())}},t.prototype.close=function(){var e=this.opened,t=this.inline;if(e)return t?(this.onClose(),void this.onClosed()):void(this.params.routableModals?this.view.router.back():this.modal.close())},t.prototype.init=function(){if(this.initInput(),this.inline)return this.open(),void this.emit("local::init keypadInit",this);!this.initialized&&this.params.value&&this.setValue(this.params.value),this.$inputEl&&this.attachInputEvents(),this.params.closeByOutsideClick&&this.attachHtmlEvents(),this.emit("local::init keypadInit",this)},t.prototype.destroy=function(){if(!this.destroyed){var e=this.$el;this.emit("local::beforeDestroy keypadBeforeDestroy",this),e&&e.trigger("keypad:beforedestroy",this),this.close(),this.$inputEl&&this.detachInputEvents(),this.params.closeByOutsideClick&&this.detachHtmlEvents(),e&&e.length&&delete this.$el[0].f7Keypad,this.app.utils.deleteProps(this),this.destroyed=!0}},t}(e)}(this.Class),this.Keypad=a},params:{keypad:{type:"numpad",openIn:"auto",backdrop:void 0,inputEl:null,containerEl:null,value:null,valueMaxLength:null,dotButton:!0,dotCharacter:".",buttons:[],closeByOutsideClick:!0,scrollToInput:!0,inputReadOnly:!0,onlyInPopover:!1,cssClass:null,toolbar:!0,toolbarCloseText:"完成",routableModals:!0,view:null,url:"select/",renderToolbar:null,renderPopover:null,renderSheet:null,renderInline:null,render:null}},create:function(){var e=this,t=e.$;e.keypad={create:function(t){return new a(e,t)},get:function(e){if(void 0===e&&(e=".keypad"),e instanceof a)return e;var n=t(e);return 0!==n.length?n[0].f7Keypad:void 0},destroy:function(t){void 0===t&&(t=".keypad");var a=e.keypad.get(t);if(a&&a.destroy)return a.destroy()},close:function(e){void 0===e&&(e=".keypad");var a=t(e);if(0!==a.length){var n=a[0].f7Keypad;!n||n&&!n.opened||n.close()}}}},on:{pageInit:function(e){var t=e.app.$,a=e.app;e.$el.find('input[type="numpad"], input[type="calculator"]').each((function(e,n){var s=t(n),l={inputEl:n,type:s.attr("type"),value:s.val()||0};s.attr("maxlength")&&(l.valueMaxLength=s.attr("maxlength")),a.keypad.create(a.utils.extend(l,s.dataset()))}))},pageBeforeRemove:function(e){e.$el.find('input[type="numpad"], input[type="calculator"]').each((function(t,a){e.app.keypad.destroy(a)}))}}};if(t){if(e.prototype.modules&&e.prototype.modules[n.name])return;e.use(n),e.instance&&(e.instance.useModuleParams(n,e.instance.params),e.instance.useModule(n))}return n}(Framework7, typeof Framework7AutoInstallComponent === 'undefined' ? undefined : Framework7AutoInstallComponent))