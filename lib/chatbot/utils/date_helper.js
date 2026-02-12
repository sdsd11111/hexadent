/**
 * Date Helper for Hexadent Chatbot
 * Handles specialized date parsing and "Truth Generation" for Ecuador Timezone.
 */

export const monthsMap = {
    enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
    julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11
};

export const dayMapEcu = {
    'lunes': 1, 'martes': 2, 'miércoles': 3, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sábado': 6, 'sabado': 6, 'domingo': 0
};

/**
 * Resolves a natural language date into YYYY-MM-DD
 * @param {string} text - The user message or potential date string
 * @param {Date} now - Current time in ECU context
 */
export function resolveDate(text, now) {
    const lowText = text.toLowerCase();

    // Anchor to 12:00 PM to avoid DST/timezone edge cases when calculating relative dates
    const anchor = new Date(now.getTime());
    anchor.setHours(12, 0, 0, 0);

    const date = new Date(anchor.getTime());

    // 0. Absolute Years/Full Dates (e.g., "25 de julio 2027")
    const fullDateMatch = text.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)(?:\s+del?\s+(\d{4}))?/i);
    if (fullDateMatch) {
        const dayNum = parseInt(fullDateMatch[1]);
        const monthName = fullDateMatch[2].toLowerCase();
        const yearNum = fullDateMatch[3] ? parseInt(fullDateMatch[3]) : date.getFullYear();

        const monthIdx = monthsMap[monthName];
        const res = new Date(yearNum, monthIdx, dayNum);

        // If the date passed already this year and no year was specified, assume next year
        if (!fullDateMatch[3] && res < anchor && (anchor.getTime() - res.getTime() > 24 * 60 * 60 * 1000)) {
            res.setFullYear(yearNum + 1);
        }
        return res.toISOString().split('T')[0];
    }

    // 1. "en X semanas" or "en X dias"
    const weeksMatch = text.match(/en\s+(\d{1,2})\s+semana/i);
    if (weeksMatch) {
        date.setDate(date.getDate() + (parseInt(weeksMatch[1]) * 7));
        return date.toISOString().split('T')[0];
    }
    const daysMatch = text.match(/en\s+(\d{1,2})\s+d[ií]a/i);
    if (daysMatch) {
        date.setDate(date.getDate() + parseInt(daysMatch[1]));
        return date.toISOString().split('T')[0];
    }

    // 2. Relative logic (hoy, mañana, pasado mañana)
    if (lowText.includes('pasado mañana')) {
        date.setDate(date.getDate() + 2);
        return date.toISOString().split('T')[0];
    }
    if (lowText.includes('mañana') || lowText.includes('mañana')) {
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    }
    if (lowText.includes('hoy')) {
        return date.toISOString().split('T')[0];
    }

    // 3. Days of the week (e.g., "el lunes", "proximo martes")
    let extraWeek = 0;
    if (lowText.includes('próximo') || lowText.includes('proximo') || lowText.includes('siguiente')) {
        extraWeek = 7;
    }

    for (const [name, val] of Object.entries(dayMapEcu)) {
        if (lowText.includes(name)) {
            const currentDay = date.getDay();
            let diff = val - currentDay;
            if (diff <= 0) diff += 7;
            date.setDate(date.getDate() + diff + (extraWeek === 7 && diff < 7 ? 7 : 0));
            return date.toISOString().split('T')[0];
        }
    }

    // 4. Just a number (e.g., "el 15")
    const justNumMatch = text.match(/(?:el\s+)?(\d{1,2})(?!\s+de)/i);
    if (justNumMatch) {
        const dayNum = parseInt(justNumMatch[1]);
        if (dayNum < date.getDate()) {
            date.setMonth(date.getMonth() + 1);
        }
        date.setDate(dayNum);
        return date.toISOString().split('T')[0];
    }

    return null; // Return null if no date is found, so we don't overwrite session dates
}

/**
 * Generates the "Absolute Truth" string for a specific date
 */
export function getDateTruth(targetDateStr, now) {
    if (!targetDateStr || targetDateStr === '9999-99-99') return "";

    try {
        const dateObj = new Date(`${targetDateStr}T12:00:00-05:00`);
        const formatter = new Intl.DateTimeFormat('es-EC', { weekday: 'long', timeZone: 'America/Guayaquil' });
        const dayName = formatter.format(dateObj).toUpperCase();
        const isSunday = dateObj.getDay() === 0;

        // 24h rule check (approximate at day level)
        const dayOnly = new Date(`${targetDateStr}T23:59:59-05:00`);
        const earliest = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        const isPossible = dayOnly >= earliest;

        return `[VERDAD DE FECHA: El ${targetDateStr} es ${dayName}. Referencia 24h: ${isPossible ? 'PUEDE HABER HORARIOS' : 'POSIBLEMENTE MUY PRONTO'}. Laborable: ${isSunday ? 'NO (Cerrado)' : 'SÍ'}.]`;
    } catch (e) {
        return `[ERROR DE FECHA: ${targetDateStr} no pudo ser validada matemáticamente.]`;
    }
}
