export function getBengaliDate(date: Date): { day: number, month: string, year: number } {
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();
  let bDay = 0, bMonth = "", bYear = y - 593;
  const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

  if (m === 0) { // Jan
    if (d < 15) { bMonth = "পৌষ"; bDay = d + 16; bYear -= 1; }
    else { bMonth = "মাঘ"; bDay = d - 14; bYear -= 1; }
  } else if (m === 1) { // Feb
    if (d < 14) { bMonth = "মাঘ"; bDay = d + 17; bYear -= 1; }
    else { bMonth = "ফাল্গুন"; bDay = d - 13; bYear -= 1; }
  } else if (m === 2) { // Mar
    const falgunDays = isLeapYear(y) ? 30 : 29;
    if (d < 15) { bMonth = "ফাল্গুন"; bDay = d + (falgunDays - 14); bYear -= 1; }
    else { bMonth = "চৈত্র"; bDay = d - 14; bYear -= 1; }
  } else if (m === 3) { // Apr
    if (d < 14) { bMonth = "চৈত্র"; bDay = d + 17; bYear -= 1; }
    else { bMonth = "বৈশাখ"; bDay = d - 13; }
  } else if (m === 4) { // May
    if (d < 15) { bMonth = "বৈশাখ"; bDay = d + 17; }
    else { bMonth = "জ্যৈষ্ঠ"; bDay = d - 14; }
  } else if (m === 5) { // Jun
    if (d < 15) { bMonth = "জ্যৈষ্ঠ"; bDay = d + 17; }
    else { bMonth = "আষাঢ়"; bDay = d - 14; }
  } else if (m === 6) { // Jul
    if (d < 16) { bMonth = "আষাঢ়"; bDay = d + 16; }
    else { bMonth = "শ্রাবণ"; bDay = d - 15; }
  } else if (m === 7) { // Aug
    if (d < 16) { bMonth = "শ্রাবণ"; bDay = d + 16; }
    else { bMonth = "ভাদ্র"; bDay = d - 15; }
  } else if (m === 8) { // Sep
    if (d < 16) { bMonth = "ভাদ্র"; bDay = d + 16; }
    else { bMonth = "আশ্বিন"; bDay = d - 15; }
  } else if (m === 9) { // Oct
    if (d < 17) { bMonth = "আশ্বিন"; bDay = d + 15; }
    else { bMonth = "কার্তিক"; bDay = d - 16; }
  } else if (m === 10) { // Nov
    if (d < 16) { bMonth = "কার্তিক"; bDay = d + 15; }
    else { bMonth = "অগ্রহায়ণ"; bDay = d - 15; }
  } else if (m === 11) { // Dec
    if (d < 16) { bMonth = "অগ্রহায়ণ"; bDay = d + 15; }
    else { bMonth = "পৌষ"; bDay = d - 15; }
  }

  return { day: bDay, month: bMonth, year: bYear };
}

