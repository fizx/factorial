function Factorial(){}

window.factorial = Factorial;

Factorial.settingsData = [
  { id: "push-html", 
    text: "Flyout menu appears next to the page, rather than above it", 
    checked: "checked",
    change: function(settings, value){
      settings.flyout.setIsCoveringPage(value);
    }
  }
];

Factorial.main = function(src, $iframe) {
  var that = this;
  this.$iframe = $iframe
  $iframe.attr("src", src);
  $iframe.load(function(){
    that.$page = $("#page");
    that.$iframe = $iframe;
    that.flyout = new Flyout($("#flyout"), 80, that.$page);
    that.settings = new Settings($("#settings"), that.flyout, that.settingsData);
    that.inspect = new Inspector($("#inspect"), that.$iframe);
    Util.appendStyles(that.$iframe, "inner.css")    
  })
}

Factorial.modal = function(enable) {
  if (enable) {
    $("#modal").show();
  } else {
    $("#modal").hide();
  }
}

function Util() {}

Util.appendScript = function($iframe, src) {
  var tag = $("<script></script>").attr("src", src).attr("type", "text/javascript");
  $iframe.contents().find("body").append(tag);
}

Util.appendStyles = function($iframe, href) {
  var tag = $("<link></link>").attr("href", href).attr("rel", "stylesheet");
  $iframe.contents().find("body").append(tag);
}

function Overlay($parent) {
  this.$element = $("<div></div>", $parent).addClass("overlay");
  this.$activeOverlay = $("<div></div>", this.$iframe.contents()).addClass("overlay");
  this.$activeOverlay.hide().bind("mousemove", function(event){
    that.updateActiveOverlay(event);
  });
  
  this.$activeOverlay.hide().bind("click", function(event){
    that.overlays.push(this.$activeOverlay)
  });
  this.$iframe.contents().find("body").append(this.$activeOverlay);
}


function Inspector($button, $iframe) {
  var that = this;
  this.$button = $button;
  this.$iframe = $iframe;
  this.enable();
  this.overlays = [];
  $button.click(function() { that.toggle(); });
  $.map(['html', 'body', 'head', 'base'], function(selector) {  
    $(selector, $iframe.contents()).addClass("f_ignore"); 
  });
  $("*", $iframe.contents()).bind("mouseover", { that: that}, that.over);
  $("*", $iframe.contents()).bind("mouseout", { that: that}, that.out);
}

Inspector.prototype.toggle = function() {
  if (this.isInspecting) {
    this.disable();
  } else {
    this.enable();
  }
}

Inspector.prototype.enable = function() {
  this.$button.addClass("enabled");
  this.isInspecting = true;
}

Inspector.prototype.disable = function() {
  this.$button.removeClass("enabled");
  this.isInspecting = false;
  this.updateActiveOverlay();
}

Inspector.prototype.updateActiveOverlay = function(event) {
  var $overlay = this.$activeOverlay;
  $overlay.hide();
  var name = this.$iframe.attr("name");
  if(!this.isInspecting) {
    return;
  }
  
  var $element = $(top[name].document.elementFromPoint(event.pageX, event.pageY ));
  if($element.size() == 1 && !$element.hasClass("f_ignore")) {
    $overlay.show();
    $overlay.css("left", $element.offset().left);
    $overlay.css("top", $element.offset().top);
    $overlay.width($element.outerWidth());
    $overlay.height($element.outerHeight());
  }
}

Inspector.prototype.over = function(event) {
  var that = event.data.that;
  that.updateActiveOverlay(event);
  return false;
}

Inspector.prototype.out = function(event) {
  var that = event.data.that;
  that.updateActiveOverlay(event);
  return false;
}

function Settings($button, flyout, data) {
  var that = this;
  this.enabled = false
  this.$button = $button;
  $button.click(function() { 
    that.toggle(); 
  });
  this.flyout = flyout;
  this.data = data;  
  this.dataByName = _.reduce(data, function(memo, datum){ 
    memo[data.id] = datum;
    datum.change(that, datum.checked);
    return memo;
  }, {});
}

Settings.prototype.isEnabled = function() {
  return this.enabled;
}

Settings.prototype.toggle = function() {
  var that = this;
  
  this.enabled = !this.enabled;
  this.flyout.disable();

  if(this.enabled) {    
    var template = $('#settings-mustache').html();
    var html = Mustache.to_html(template, { checkboxes: this.data });
    var $html = $(html);
    this.flyout.setContent(html);
  
    this.flyout.get$Content().find("input").each(function(){
      var $box = $(this);
      var obj = that.dataByName[$box.id];
      $box.attr("checked", obj.checked);
      $box.click(function(){
        obj.change(that, $box.attr("checked"));
        obj.checked = $box.attr("checked");
      });
    });  

    this.$button.addClass("enabled");
    this.flyout.enable(300, this);
  } else {
    this.$button.removeClass("enabled");
  }
}

Settings.prototype.onFlyoutClose = function() {
  this.$button.removeClass("enabled");
  this.enabled = false;
}

function Flyout($elem, x, $page){
  var that = this;
  this.owner = null;
  this.$elem = $elem;
  this.$page = $page
  this.isCoveringPage = false;
  this.x = x;
  this.enabled = false;
  this.$content = $("<div></div>").addClass("content");
  this.$dot = $("<div></div>").addClass("dot").click(function(){
    return false;
  }).draggable({ 
    axis: "x",
    start: function(event, ui) { 
      Factorial.modal(true);
      that.$elem.width(that.$dot.position().left + that.$dot.width());
      that._update(true);
    },
    drag: function(event, ui) { 
      that.$elem.width(that.$dot.position().left + that.$dot.width());
      that._update(true);
    },
    stop: function(event, ui) { 
      that.$elem.width(that.$dot.position().left + that.$dot.width());
      that._update(true);
      Factorial.modal(false);
    }
  });
  this.$x = $("<a>x</a>").addClass("close").attr("href", "#").click(function(){
    that.disable();
    return false;
  });
  this.$elem.append(this.$dot);
  this.$elem.append(this.$content);
  this.$elem.append(this.$x);
}

Flyout.prototype.isEnabled = function() { 
  return this.enabled;
}

Flyout.prototype.setIsCoveringPage = function(value) {
  this.isCoveringPage = value;
}

Flyout.prototype.setContent = function(html) {
  this.$content.html(html);
}

Flyout.prototype.get$Content = function() {
  return this.$content;
}

Flyout.prototype.enable = function(width, owner) {
  this.owner = owner;
  this.enabled = true;
  if (width) {
    this.$elem.width(width);
  }
  this._update();
}

Flyout.prototype.disable = function() {
  if(this.owner) {
    this.owner.onFlyoutClose(this);
  }
  this.enabled = false;
  this._update();
}

Flyout.prototype._update = function() {
  var _x = this.enabled ? this.x : -9999;
  var _pageX = this.enabled ? this.x + this.$elem.width() : this.x;
  if(this.isCoveringPage) {
    this.$page.css("left", _pageX);
  } else {
    this.$page.css("left", this.x);
  }  
  this.$content.width(this.$elem.width() - this.$dot.width());
  this.$dot.css("left", this.$elem.width() - this.$dot.width());
  this.$elem.css("left", _x);
  this.$x.css("left", this.$elem.width() - this.$dot.width());
}