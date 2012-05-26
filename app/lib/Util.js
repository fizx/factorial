function Util() {}

Util.appendScript = function($iframe, src) {
  var tag = $("<script></script>").attr("src", src).attr("type", "text/javascript");
  $iframe.contents().find("body").append(tag);
}

Util.debounce = function(id, func) {
  var that = this;
  if(!this._debounces) {
    this._debounces = {};
  }
  if(this._debounces[id]) {
    clearTimeout(this._debounces[id]);
  }
  this._debounces[id] = setTimeout(function(){
    func();
    delete that._debounces[id];
  }, 300);
}

Util.appendStyles = function($iframe, href) {
  var tag = $("<link></link>").addClass("f_ignore").attr("href", href).attr("rel", "stylesheet");
  $iframe.contents().find("body").append(tag);
}
