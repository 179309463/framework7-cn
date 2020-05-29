(function framework7ComponentLoader(t,o){void 0===o&&(o=!0);document;var n=window,e=t.$,s=(t.Template7,t.utils),a=(t.device,t.support,t.Class,t.Modal),l=(t.ConstructorMethods,t.ModalMethods),r=function(t){function o(o,a){var l=s.extend({on:{}},o.params.toast,a);t.call(this,o,l);var r=this;r.app=o,r.params=l;var i,c,u=r.params,d=u.closeButton,p=u.closeTimeout;if(r.params.el)i=e(r.params.el);else{var m=r.render();i=e(m)}return i&&i.length>0&&i[0].f7Modal?i[0].f7Modal:0===i.length?r.destroy():(s.extend(r,{$el:i,el:i[0],type:"toast"}),i[0].f7Modal=r,d&&(i.find(".toast-button").on("click",(function(){r.emit("local::closeButtonClick toastCloseButtonClick",r),r.close()})),r.on("beforeDestroy",(function(){i.find(".toast-button").off("click")}))),r.on("open",(function(){e(".toast.modal-in").each((function(t,n){var e=o.toast.get(n);n!==r.el&&e&&e.close()})),p&&(c=s.nextTick((function(){r.close()}),p))})),r.on("close",(function(){n.clearTimeout(c)})),r.params.destroyOnClose&&r.once("closed",(function(){setTimeout((function(){r.destroy()}),0)})),r)}return t&&(o.__proto__=t),o.prototype=Object.create(t&&t.prototype),o.prototype.constructor=o,o.prototype.render=function(){if(this.params.render)return this.params.render.call(this,this);var t=this.params,o=t.position,n=t.horizontalPosition,e=t.cssClass,s=t.icon,a=t.text,l=t.closeButton,r=t.closeButtonColor,i=t.closeButtonText;return('\n      <div class="toast toast-'+o+" "+("top"===o||"bottom"===o?"toast-horizontal-"+n:"")+" "+(e||"")+" "+(s?"toast-with-icon":"")+'">\n        <div class="toast-content">\n          '+(s?'<div class="toast-icon">'+s+"</div>":"")+'\n          <div class="toast-text">'+a+"</div>\n          "+(l&&!s?('\n          <a class="toast-button button '+(r?"color-"+r:"")+'">'+i+"</a>\n          ").trim():"")+"\n        </div>\n      </div>\n    ").trim()},o}(a),i={name:"toast",static:{Toast:r},create:function(){var t=this;t.toast=s.extend({},l({app:t,constructor:r,defaultSelector:".toast.modal-in"}),{show:function(o){return s.extend(o,{destroyOnClose:!0}),new r(t,o).open()}})},params:{toast:{icon:null,text:null,position:"bottom",horizontalPosition:"left",closeButton:!1,closeButtonColor:null,closeButtonText:"好的",closeTimeout:null,cssClass:null,render:null}}};if(o){if(t.prototype.modules&&t.prototype.modules[i.name])return;t.use(i),t.instance&&(t.instance.useModuleParams(i,t.instance.params),t.instance.useModule(i))}return i}(Framework7, typeof Framework7AutoInstallComponent === 'undefined' ? undefined : Framework7AutoInstallComponent))
