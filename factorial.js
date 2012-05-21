function Factorial(){}

window.factorial = Factorial;

/**
 * Global settings, editable via settings pane.  Also has callbacks for when
 */
Factorial.settingsData = [
  new Setting("push-html",
              "Flyout menu appears next to the page, rather than above it",
              true,
              function(settings, value){
                settings.flyout.setIsCoveringPage(value);
              })
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
    that.inspect = new Inspector($("#inspect"), that.$iframe, that.flyout);
    Util.appendStyles(that.$iframe, "inner.css")
  })
}

/**
 * Covers up the main workspace with a semi-transparent div
 */
Factorial.modal = function(enable) {
  if (enable) {
    $("#modal").show();
  } else {
    $("#modal").hide();
  }
}

function Setting(id, text, checked, change) {
  this.id = id;
  this.text = text;
  this.checked = checked ? "checked" : null;
  this.change = change;
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

function Overlay($parentFrame) {
  this.$frameDocument = top[$parentFrame.attr("name")].document;
  this.$parent = $(this.$frameDocument.body);
  this.$overlay = $("<div></div>", this.$parent).addClass("overlay").addClass("f_ignore");
  this.$shader = $("<div></div>", this.$parent).addClass("f_ignore");
  this.$overlay.append(this.$shader);
  this.$parent.append(this.$overlay);
  this.$element = $();
  this.$close = $("<a>x</a>", this.$parent).addClass("close").addClass("f_ignore");
  this.$parent.append(this.$close);
  this.closable = true;
}

Overlay.prototype.updateElement = function($newElement) {
  if($newElement.size() == 1 && !$newElement.hasClass("f_ignore")) {
    this.$element = $newElement;
    this.$overlay.show();
    this.$overlay.css("left", $newElement.offset().left);
    this.$overlay.css("top", $newElement.offset().top);
    this.$overlay.width($newElement.outerWidth());
    this.$overlay.height($newElement.outerHeight());

    this.$close.css("left", $newElement.offset().left + $newElement.outerWidth());
    this.$close.css("top", $newElement.offset().top);
  } else {
    this.$element = $();
  }
  return this;
}

Overlay.prototype.activate = function() {
  var that = this;
  this.$overlay.addClass("active");
  this.$overlay.bind("mousemove.factorial", { that: that}, function(event){
    that.updateEvent(event);
  });
  this.unclosable();
  return this;
}

Overlay.prototype.implied = function() {
  this.$overlay.addClass("implied");
  console.log("implied")
  return this;
}

Overlay.prototype.deactivate = function() {
  this.$overlay.removeClass("active");
  this.$overlay.unbind("mousemove.factorial");
  if(this.closable) {
    this.$close.show();
  }
  return this;
}

Overlay.prototype.unclosable = function() {
  this.$close.hide();
  this.closable = false;
  return this;
}

Overlay.prototype.overlaid$Element = function() {
  return this.$element;
}

Overlay.prototype.updateEvent = function(event) {
  this.hide();
  var $newElement = $(this.$frameDocument.elementFromPoint(event.pageX, event.pageY));
  if(this.$parent.has($newElement[0]).size() == 0) {
    this.$element = $();
  } else if ($newElement.hasClass("f_ignore")) {
    // yup, ignoring.
  } else {
    this.updateElement($newElement);
  }
  return this;
}

Overlay.prototype.hide = function() {
  this.$overlay.hide();
  this.$close.hide();
  return this;
}

Overlay.prototype.click = function(context, cb) {
  this.$overlay.bind("click.factorial", {that: context}, cb);
  return this;
}

Overlay.prototype.closeClick = function(context, cb) {
  this.$close.bind("click.factorial", {that: context}, cb);
  return this;
}

Overlay.prototype.show = function() {
  this.$overlay.show();
  if(this.closable) {
    this.$close.show();
  }
  return this;
}

Overlay.prototype.cleanUp = function() {
  this.$overlay.remove();
  this.$close.remove();
  return this;
}

function Inspector($button, $iframe, flyout) {
  var that = this;
  this.flyout = flyout;
  this.$button = $button;
  this.$iframe = $iframe;
  this.overlays = {};
  this.impliedOverlays = [];
  this.rejectedOverlays = [];
  this.nextOverlayId = 1;
  this.$activeOverlay = new Overlay($iframe).activate().hide().click(this, function(event){
    that.overlayClick(event);
  });
  $button.click(function() { that.toggle(); });
  $.map(['html', 'body', 'head', 'base'], function(selector) {
    $(selector, $iframe.contents()).addClass("f_ignore");
  });
  $("*", $iframe.contents()).bind("mouseover", { that: that}, that.over);
  $("*", $iframe.contents()).bind("mouseout", { that: that}, that.out);
  this.disable();
}

Inspector.prototype.overlayClick = function(event) {
  var that = event.data.that;
  var $element = this.$activeOverlay.overlaid$Element();
  this.toggleStaticOverlay($element);
  this.updateImpliedSelector();
}

Inspector.prototype.onFlyoutClose = function() {}

Inspector.prototype.toggleStaticOverlay = function($element) {
  var that = this;
  var currentOverlayId = $element.data("overlay");
  if(!currentOverlayId) {
    var newOverlay = new Overlay(this.$iframe).updateElement($element).closeClick(this, function(event){
      that.toggleStaticOverlay($element);
      that.updateImpliedSelector();
    });
    $element.data("overlay", this.nextOverlayId);
    this.overlays[this.nextOverlayId] = newOverlay;
    this.nextOverlayId++;
  } else {
    var oldOverlay = this.overlays[currentOverlayId];
    oldOverlay.cleanUp();
    delete(this.overlays[currentOverlayId]);
    $element.data("overlay", null);
  }
  this.rejectedOverlays = [];
}

Inspector.prototype.selectAll = function(selector) {
  var that = this;
  this.$iframe.contents().find("body").find(selector).not(".f_ignore").each(function(){
    console.log("hai")
    var $element = $(this);
    if(!$element.data("overlay")) {
      that.toggleStaticOverlay($element);
    }
  });
  this.updateImpliedSelector();
}

Inspector.prototype.updateImpliedSelector = function() {
  var that = this;
  var dom = new DomPredictionHelper();
  var elements = []
  $.each(this.impliedOverlays, function(){
    this.cleanUp();
  });
  this.impliedOverlays = [];
  for (var key in this.overlays) {
    var overlay = this.overlays[key];
    elements.push(overlay.overlaid$Element()[0]);
  }

  var selector = dom.predictCss(elements, this.rejectedOverlays);
  this.impliedSelector = selector;
  $("#selector").val(selector);

  for (var key in this.overlays) {
    var overlay = this.overlays[key];
    var $element = overlay.overlaid$Element();
    if(!$element.is(selector)) {
      that.toggleStaticOverlay($element);
    }
  }

  var $impliedElements = this.$iframe.contents().find("body").find(selector).not(".f_ignore");
  $impliedElements.each(function(){
    console.log("css:")
    var rejected = that.rejectedOverlays.slice(0);
    rejected.push(this)
    console.log(dom.predictCss(elements, rejected));
    var closable = dom.predictCss(elements, rejected).length > 0;

    var $element = $(this);
    if(!$element.data("overlay")) {
      var newOverlay = new Overlay(that.$iframe).updateElement($element).implied();
      if(closable) {
        newOverlay.closeClick(this, function(event){
          that.rejectedOverlays.push($element[0]);
          that.updateImpliedSelector();
        });
      } else {
        newOverlay.unclosable();
      }
      that.impliedOverlays.push(newOverlay);
    }
  })
}

Inspector.prototype.toggle = function() {
  var that = this;
  if (this.isInspecting) {
    this.disable();
    this.flyout.disable();
  } else {
    this.enable();
    this.flyout.enable(300, this);
    var template = $('#inspector-mustache').html();
    var html = Mustache.to_html(template, {});
    var $html = $(html);
    this.flyout.setContent(html);
    $("#selector").val(this.impliedSelector);
    $("#selector").bind("keyup", function(e){
      console.log("hi")
      var code = (e.keyCode ? e.keyCode : e.which);
      if(code == 13) {
        that.selectAll($("#selector").val());
      }
    })
  }
}

Inspector.prototype.enable = function() {
  this.$button.addClass("enabled");
  this.isInspecting = true;
}

Inspector.prototype.disable = function() {
  this.$button.removeClass("enabled");
  this.isInspecting = false;
  this.$activeOverlay.hide();
}

Inspector.prototype.over = function(event) {
  var that = event.data.that;
  // if(!that.isInspecting) {
  //   return false;
  // }
  that.$activeOverlay.updateEvent(event);
  return false;
}

Inspector.prototype.out = function(event) {
  var that = event.data.that;
  // if(!that.isInspecting) {
  //   return false;
  // }
  that.$activeOverlay.updateEvent(event);
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
  if(this.owner != owner) {
    this.disable();
  }
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