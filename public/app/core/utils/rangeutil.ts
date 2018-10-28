import _ from 'lodash';
import moment from 'moment';
import * as dateMath from './datemath';

const spans = {
  s: { display: 'second' },
  m: { display: 'minute' },
  h: { display: 'hour' },
  d: { display: 'day' },
  w: { display: 'week' },
  M: { display: 'month' },
  y: { display: 'year' },
};

const rangeOptions = [
  {
    from: moment().subtract(1, 'days'),
    to: moment(),
    display: 'Last 1 day',
    section: 1,
  },
  {
    from: moment().subtract(2, 'days'),
    to: moment(),
    display: 'Last 2 days',
    section: 1,
  },
  {
    from: moment().subtract(3, 'days'),
    to: moment(),
    display: 'Last 3 days',
    section: 1,
  },
  {
    from: moment().subtract(5, 'minutes'),
    to: moment(),
    display: 'Last 5 minutes',
    section: 3,
  },
  {
    from: moment().subtract(15, 'minutes'),
    to: moment(),
    display: 'Last 15 minutes',
    section: 3,
  },
  {
    from: moment().subtract(1, 'hours'),
    to: moment(),
    display: 'Last 1 hour',
    section: 3,
  },
  {
    from: moment().subtract(3, 'hours'),
    to: moment(),
    display: 'Last 3 hours',
    section: 3,
  },
  {
    from: moment().subtract(6, 'hours'),
    to: moment(),
    display: 'Last 6 hours',
    section: 3,
  },
  {
    from: moment().subtract(12, 'hours'),
    to: moment(),
    display: 'Last 12 hours',
    section: 3,
  },
  {
    from: moment().subtract(24, 'hours'),
    to: moment(),
    display: 'Last 24 hours',
    section: 3,
  },
];

const absoluteFormat = 'MMM D, YYYY HH:mm:ss';

const rangeIndex = {};
_.each(rangeOptions, frame => {
  rangeIndex[frame.from + ' to ' + frame.to] = frame;
});

export function getRelativeTimesList(timepickerSettings, currentDisplay) {
  const groups = _.groupBy(rangeOptions, (option: any) => {
    option.active = option.display === currentDisplay;
    return option.section;
  });

  // _.each(timepickerSettings.time_options, (duration: string) => {
  //   let info = describeTextRange(duration);
  //   if (info.section) {
  //     groups[info.section].push(info);
  //   }
  // });

  return groups;
}

function formatDate(date) {
  return date.format(absoluteFormat);
}

// handles expressions like
// 5m
// 5m to now/d
// now/d to now
// now/d
// if no to <expr> then to now is assumed
export function describeTextRange(expr: any) {
  const isLast = expr.indexOf('+') !== 0;
  if (expr.indexOf('now') === -1) {
    expr = (isLast ? 'now-' : 'now') + expr;
  }

  let opt = rangeIndex[expr + ' to now'];
  if (opt) {
    return opt;
  }

  if (isLast) {
    opt = { from: expr, to: 'now' };
  } else {
    opt = { from: 'now', to: expr };
  }

  const parts = /^now([-+])(\d+)(\w)/.exec(expr);
  if (parts) {
    const unit = parts[3];
    const amount = parseInt(parts[2], 10);
    const span = spans[unit];
    if (span) {
      opt.display = isLast ? 'Last ' : 'Next ';
      opt.display += amount + ' ' + span.display;
      opt.section = span.section;
      if (amount > 1) {
        opt.display += 's';
      }
    }
  } else {
    opt.display = opt.from + ' to ' + opt.to;
    opt.invalid = true;
  }

  return opt;
}

export function describeTimeRange(range) {
  const option = rangeIndex[range.from.toString() + ' to ' + range.to.toString()];
  if (option) {
    return option.display;
  }

  if (moment.isMoment(range.from) && moment.isMoment(range.to)) {
    return formatDate(range.from) + ' to ' + formatDate(range.to);
  }

  if (moment.isMoment(range.from)) {
    const toMoment = dateMath.parse(range.to, true);
    return formatDate(range.from) + ' to ' + toMoment.fromNow();
  }

  if (moment.isMoment(range.to)) {
    const from = dateMath.parse(range.from, false);
    return from.fromNow() + ' to ' + formatDate(range.to);
  }

  if (range.to.toString() === 'now') {
    const res = describeTextRange(range.from);
    return res.display;
  }

  return range.from.toString() + ' to ' + range.to.toString();
}
