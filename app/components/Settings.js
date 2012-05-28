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
    var template = window.mustaches.settings;
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