import { useState, useEffect } from 'react';
import { toHijri } from 'hijri-converter';
import { format } from 'date-fns';

interface IslamicDate {
  day: number;
  month: string;
  year: number;
  event?: string;
}

interface PrayerTime {
  name: string;
  time: string;
  remaining?: string;
}

const ISLAMIC_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'
];

export function useIslamicDate() {
  const [islamicDate, setIslamicDate] = useState<IslamicDate>({
    day: 1,
    month: ISLAMIC_MONTHS[0],
    year: 1444
  });

  const [gregorianDate] = useState<Date>(new Date());

  const [prayerTimes] = useState<PrayerTime[]>([
    { name: 'Fajr', time: '05:41' },
    { name: 'Dhuhr', time: '12:30' },
    { name: 'Asr', time: '15:45' },
    { name: 'Maghrib', time: '18:15' },
    { name: 'Isha', time: '19:45' }
  ]);

  useEffect(() => {
    // Get current date
    const today = new Date();
    const hijri = toHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    // Check for Islamic events
    let event: string | undefined;
    
    // Ramadan
    if (hijri.hm === 9) {
      event = "Ramadan";
    }
    // Eid al-Fitr
    else if (hijri.hm === 10 && hijri.hd <= 3) {
      event = "Eid al-Fitr";
    }
    // Hajj
    else if (hijri.hm === 12 && hijri.hd >= 8 && hijri.hd <= 12) {
      event = "Hajj";
    }
    // Eid al-Adha
    else if (hijri.hm === 12 && hijri.hd >= 10 && hijri.hd <= 13) {
      event = "Eid al-Adha";
    }
    // Islamic New Year
    else if (hijri.hm === 1 && hijri.hd === 1) {
      event = "Islamic New Year";
    }
    // Ashura
    else if (hijri.hm === 1 && hijri.hd === 10) {
      event = "Ashura";
    }
    // Mawlid al-Nabi (Prophet's Birthday)
    else if (hijri.hm === 3 && hijri.hd === 12) {
      event = "Mawlid al-Nabi";
    }
    
    setIslamicDate({
      day: hijri.hd,
      month: ISLAMIC_MONTHS[hijri.hm - 1],
      year: hijri.hy,
      event
    });
  }, []);

  return { 
    islamicDate, 
    gregorianDate, 
    prayerTimes,
    formattedGregorianDate: format(gregorianDate, 'MMMM d, yyyy')
  };
}
