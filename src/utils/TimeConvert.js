import moment from 'moment';

const TimeConvert = (datetime, format) => {
    return moment(datetime).local('ko').format(format);
};

export default TimeConvert;