exports.Progression = class {

  constructor(name, y) {
    this.term = require('terminal-kit').terminal;

    this.steps    = [];
    this.step     = null;
    this.progress = this.term.progressBar({
      title      : name,
      width      : 100,
      eta        : true,
      percent    : true,
      syncMode   : true,
      items      : this.steps.length,
      barChar    : '█',
      barHeadChar: '█',
      y          : y
    });

    this.progress.update({
      progress: null
    });
  }

  addStep(name) {
    this.steps.push(name);

    this.progress.update({
      items: this.steps.length
    });
  }

  nextStep() {
    if (this.step != null) {
      this.progress.itemDone(this.step);
    }

    this.step = this.steps.shift();
    this.progress.startItem(this.step ?? '');
  }

  setProgress(value) {
    this.progress.update(value);
  }

}