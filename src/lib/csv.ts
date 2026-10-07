/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;
    const src = text.replace(/^\uFEFF/, '');

    for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (inQuotes) {
            if (c === '"') {
                if (src[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
            } else field += c;
        } else if (c === '"') inQuotes = true;
        else if (c === ',' || c === ';' || c === '\t') { row.push(field); field = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && src[i + 1] === '\n') i++;
            row.push(field);
            if (row.some((f) => f.trim() !== '')) rows.push(row);
            row = [];
            field = '';
        } else field += c;
    }
    row.push(field);
    if (row.some((f) => f.trim() !== '')) rows.push(row);
    return rows;
}

/** Turn CSV rows into contact objects using the header row. */
export function csvToContacts(text: string) {
    const rows = parseCsv(text);
    if (rows.length < 2) return { contacts: [], columns: [] as string[] };
    const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const idx = (...names: string[]) => header.findIndex((h) => names.includes(h));
    const iEmail = idx('email', 'email_address', 'e-mail', 'mail');
    const iName = idx('name', 'full_name', 'fullname');
    const iFirst = idx('first_name', 'firstname', 'first');
    const iLast = idx('last_name', 'lastname', 'last', 'surname');
    const iPhone = idx('phone', 'phone_number', 'mobile');
    const iTags = idx('tags', 'tag', 'labels');
    const known = new Set([iEmail, iName, iFirst, iLast, iPhone, iTags]);

    const contacts = rows.slice(1).map((r) => {
        const customFields: Record<string, string> = {};
        header.forEach((h, i) => {
            if (!known.has(i) && r[i]?.trim() && /^[a-z0-9_]{1,50}$/.test(h)) customFields[h] = r[i].trim();
        });
        const name = iName >= 0 ? r[iName]?.trim() : [iFirst >= 0 ? r[iFirst] : '', iLast >= 0 ? r[iLast] : ''].join(' ').trim();
        return {
            email: (iEmail >= 0 ? r[iEmail] : '').trim(),
            name: name || undefined,
            phone: iPhone >= 0 ? r[iPhone]?.trim() || undefined : undefined,
            tags: iTags >= 0 ? (r[iTags] || '').split(/[|;,]/).map((t) => t.trim()).filter(Boolean) : [],
            customFields,
        };
    });
    return { contacts, columns: header, hasEmail: iEmail >= 0 };
}
