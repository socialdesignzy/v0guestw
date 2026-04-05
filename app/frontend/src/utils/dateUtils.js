export const formatDateToDDMMYYYY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const getTodayDDMMYYYY = () => {
  return formatDateToDDMMYYYY(new Date());
};

export const parseDDMMYYYY = (dateStr) => {
  const [day, month, year] = dateStr.split('-');
  return new Date(year, month - 1, day);
};

export const getThisWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  // Get Sunday of current week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  sunday.setHours(0, 0, 0, 0);
  
  // Get Saturday of current week
  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);
  
  return {
    start: formatDateToDDMMYYYY(sunday),
    end: formatDateToDDMMYYYY(saturday),
    startDate: sunday.toISOString().split('T')[0], // YYYY-MM-DD for input
    endDate: saturday.toISOString().split('T')[0]
  };
};

export const getThisMonthRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    start: formatDateToDDMMYYYY(firstDay),
    end: formatDateToDDMMYYYY(lastDay),
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0]
  };
};

export const getLastWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  // Get Sunday of last week
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - dayOfWeek - 7);
  lastSunday.setHours(0, 0, 0, 0);
  
  // Get Saturday of last week
  const lastSaturday = new Date(lastSunday);
  lastSaturday.setDate(lastSunday.getDate() + 6);
  lastSaturday.setHours(23, 59, 59, 999);
  
  return {
    start: formatDateToDDMMYYYY(lastSunday),
    end: formatDateToDDMMYYYY(lastSaturday),
    startDate: lastSunday.toISOString().split('T')[0],
    endDate: lastSaturday.toISOString().split('T')[0]
  };
};

export const getThisYearRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), 0, 1); // January 1st
  const lastDay = new Date(today.getFullYear(), 11, 31); // December 31st
  
  return {
    start: formatDateToDDMMYYYY(firstDay),
    end: formatDateToDDMMYYYY(lastDay),
    startDate: firstDay.toISOString().split('T')[0],
    endDate: lastDay.toISOString().split('T')[0]
  };
};
