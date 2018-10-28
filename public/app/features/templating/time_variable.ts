import { Variable, assignModelProperties, variableTypes } from './variable';

export class TimeVariable implements Variable {
  name: string;
  refresh: number;
  current: string;
  query: string;
  options: any[];
  defaults = {
    type: 'timerange',
    name: '',
    hide: 0,
    label: '',
    refresh: 2,
    options: [],
    query: '',
    current: {},
  };

  /** @ngInject */
  constructor(private model, private timeSrv, private templateSrv, private variableSrv) {
    assignModelProperties(this, model, this.defaults);
    this.refresh = 2;
  }

  getSaveModel() {
    assignModelProperties(this.model, this, this.defaults);
    return this.model;
  }

  setValue(option) {
    this.updateAutoValue();
    return this.variableSrv.setOptionAsCurrent(this, option);
  }

  updateAutoValue() {
    this.templateSrv.setGrafanaVariable('$__time_interval_start', this.timeSrv.absoluteFromTime);
    this.templateSrv.setGrafanaVariable('$__time_interval_end', this.timeSrv.absoluteToTime);
  }

  updateOptions() {
    this.updateAutoValue();
    this.options = [{ text: this.query.trim(), value: this.query.trim() }];
    this.setValue(this.options[0]);
    return Promise.resolve();
  }

  dependsOn(variable) {
    return false;
  }

  setValueFromUrl(urlValue) {
    return this.variableSrv.setOptionFromUrl(this, urlValue);
  }

  getValueForUrl() {
    return '';
  }
}

variableTypes['timerange'] = {
  name: 'Timerange',
  ctor: TimeVariable,
  description: 'Define a from to time range. Use variables $__time_interval_start and $__time_interval_end',
};