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
  var overlay = this.toggleStaticOverlay($element);
  this.updateImpliedSelector();
  that.$activeOverlay.hide();
  overlay.trigger("mouseover");
}

Inspector.prototype.onFlyoutClose = function() {}

Inspector.prototype.toggleStaticOverlay = function($element) {
  var that = this;
  var currentOverlayId = $element.data("overlay");
  var currentOverlay;
  if(!currentOverlayId) {
    currentOverlay = new Overlay(this.$iframe).updateElement($element).closeClick(this, function(event){
      that.toggleStaticOverlay($element);
      that.updateImpliedSelector();
    });
    $element.data("overlay", this.nextOverlayId);
    this.overlays[this.nextOverlayId] = currentOverlay;
    this.nextOverlayId++;
  } else {
    currentOverlay = this.overlays[currentOverlayId];
    currentOverlay.cleanUp();
    delete(this.overlays[currentOverlayId]);
    $element.data("overlay", null);
  }
  this.rejectedOverlays = [];
  return currentOverlay;
}

Inspector.prototype.selectNone = function(selector) {
  for (var key in this.overlays) {
    var overlay = this.overlays[key];
    var $element = overlay.overlaid$Element();
    this.toggleStaticOverlay($element);
  }
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

  var badSelector = false;
  var $impliedElements
  try {
    $impliedElements = this.$iframe.contents().find("body").find(selector).not(".f_ignore");
  } catch(err) {
    badSelector = true;
    $impliedElements = $();
    selector = "";
  }
  
  $("#selector").val(selector);
  this.impliedSelector = selector;
  
  for (var key in this.overlays) {
    var overlay = this.overlays[key];
    var $element = overlay.overlaid$Element();
    if(!$element.is(selector) || badSelector) {
      that.toggleStaticOverlay($element);
    }
  }

  $impliedElements.each(function(){
  var $element = $(this);
    if($element.data("overlay")) {
      return;
    }


    if(!$element.data("overlay")) {
      var newOverlay = new Overlay(that.$iframe).updateElement($element).implied();
      newOverlay.closeClick(this, function(event){
        that.rejectedOverlays.push($element[0]);
        that.updateImpliedSelector();
      });
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
      Util.debounce("inspectselector", function() { 
        var val = $.trim($("#selector").val());
        if(val.length == 0) {
          that.selectNone();
        } else {
          that.selectAll(val);
        }
      });
    });
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
