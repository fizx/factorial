function Setting(id, text, checked, change) {
  this.id = id;
  this.text = text;
  this.checked = checked ? "checked" : null;
  this.change = change;
}
