import { addFormatToken } from '../format/format';
import { addUnitAlias } from './aliases';
import { addUnitPriority } from './priorities';
import { addRegexToken, match1to2, match1to4, match1to6, match2, match4, match6, matchSigned } from '../parse/regex';
import { addWeekParseToken } from '../parse/token';
import { weekOfYear, weeksInYear, dayOfYearFromWeeks } from './week-calendar-utils';
import toInt from '../utils/to-int';
import { hooks } from '../utils/hooks';
import { quickCreateLocal } from '../create/from-anything';
import { createUTCDate } from '../create/date-from-array';
import { getSetDayOfMonth } from './day-of-month';
import { getSetMonth } from './month';
import { getSetYear } from './year';

// FORMATTING

addFormatToken(0, ['gg', 2], 0, function () {
    return this.weekYear() % 100;
});

addFormatToken(0, ['GG', 2], 0, function () {
    return this.isoWeekYear() % 100;
});

function addWeekYearFormatToken (token, getter) {
    addFormatToken(0, [token, token.length], 0, getter);
}

addWeekYearFormatToken('gggg',     'weekYear');
addWeekYearFormatToken('ggggg',    'weekYear');
addWeekYearFormatToken('GGGG',  'isoWeekYear');
addWeekYearFormatToken('GGGGG', 'isoWeekYear');

// ALIASES

addUnitAlias('weekYear', 'gg');
addUnitAlias('isoWeekYear', 'GG');


// PARSING

addRegexToken('G',      matchSigned);
addRegexToken('g',      matchSigned);
addRegexToken('GG',     match1to2, match2);
addRegexToken('gg',     match1to2, match2);
addRegexToken('GGGG',   match1to4, match4);
addRegexToken('gggg',   match1to4, match4);
addRegexToken('GGGGG',  match1to6, match6);
addRegexToken('ggggg',  match1to6, match6);

addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
    week[token.substr(0, 2)] = toInt(input);
});

addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
    week[token] = hooks.parseTwoDigitYear(input);
});

// MOMENTS

export function getSetWeekYear (input) {
    return getSetWeekYearHelper(this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy);
}

export function getSetISOWeekYear (input) {
    return getSetWeekYearHelper(
        this, input, this.isoWeek(), this.isoWeekday(), 1, 4);
}

export function getISOWeeksInYear () {
    return weeksInYear(this.year(), 1, 4);
}

export function getWeeksInYear () {
    var weekInfo = this.localeData()._week;
    return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
}

function getSetWeekYearHelper(mom, input, week, weekday, dow, doy) {
    var weeksTarget;
    if (input == null) {
        return weekOfYear(mom, dow, doy).year;
    } else {
        if (!mom.isValid()) {
            return mom;
        }
        weeksTarget = weeksInYear(input, dow, doy);
        if (week > weeksTarget) {
            week = weeksTarget;
        }
        return setWeekAll(mom, input, week, weekday, dow, doy);
    }
}

function setWeekAll(mom, weekYear, week, weekday, dow, doy) {
    var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
        date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear),
        d = new Date(mom._d);

    // TODOv3 -- I guess the generic set method should accept all args that the Date
    // object accepts.
    d.setUTCFullYear(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return quickCreateLocal(d.valueOf(), mom._locale, mom._tz);
}

// PRIORITY

addUnitPriority('weekYear', 1, getSetWeekYear);
addUnitPriority('isoWeekYear', 1, getSetISOWeekYear);
