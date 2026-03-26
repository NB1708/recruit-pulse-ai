import type { EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

declare global {
  interface Window {
    google?: any;
  }
}

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

const MONTH_ABBR_MAP: Record<string, string> = {
  jan: 'January', feb: 'February', mar: 'March', apr: 'April',
  may: 'May', jun: 'June', jul: 'July', aug: 'August',
  sep: 'September', oct: 'October', nov: 'November', dec: 'December',
};

function normalizeMonth(raw: string): string {
  const key = raw.trim().toLowerCase().slice(0, 3);
  return MONTH_ABBR_MAP[key] || raw.trim();
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function emailToName(email: string): string {
  const local = email.split('@')[0] || email;
  return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
}

function rowToRecord(headers: string[], row: string[]): Record<string, string> {
  const rec: Record<string, string> = {};
  headers.forEach((h, idx) => {
    rec[normalize(h)] = (row[idx] ?? '').toString().trim();
  });
  return rec;
}

function parseMasterTracker(values: string[][]): MasterTrackerRow[] {
  if (!values.length) return [];
  const [headers, ...rows] = values;
  return rows.filter(r => r.some(Boolean)).map((row) => {
    const rec = rowToRecord(headers, row);
    const rawRecruiter = rec['recruiter'] || '';
    return {
      stage: rec['5 stages'] || rec['stage'] || '',
      clientStatus: rec['client status'] || '',
      year: rec['year'] || '',
      month: normalizeMonth(rec['month'] || ''),
      date: rec['date'] || '',
      tl: rec['tl'] || '',
      am: rec['am'] || '',
      recruiter: rawRecruiter,
      recruiterName: rawRecruiter.includes('@') ? emailToName(rawRecruiter) : rawRecruiter,
      organisation: rec['organisation'] || '',
      role: rec['role'] || '',
      location: rec['location'] || '',
      candidateName: rec['candidate name'] || '',
      contact: rec['contact'] || '',
      emailId: rec['email id'] || '',
      totalExperience: rec['total experience'] || '',
      ctc: rec['ctc'] || '',
      expected: rec['expected'] || '',
      noticePeriod: rec['notice period'] || '',
      currentCompany: rec['current company'] || '',
      status: rec['status'] || '',
    };
  }).filter(r => r.year !== '1899' && r.month !== 'December' && r.candidateName.trim() !== '');
}

function parseSelection(values: string[][]): SelectionSheetRow[] {
  if (!values.length) return [];
  const [headers, ...rows] = values;
  return rows.filter(r => r.some(Boolean)).map((row) => {
    const rec = rowToRecord(headers, row);
    const rawRecruiter = rec['recruiter'] || '';
    return {
      srNo: rec['sr. no.'] || rec['sr no'] || '',
      month: normalizeMonth(rec['month'] || ''),
      year: rec['year'] || '',
      dateOfSelection: rec['selection date'] || rec['date of selection'] || '',
      candidateName: rec['candidate name'] || '',
      contactNumber: rec['contact number'] || '',
      emailId: rec['email id'] || '',
      company: rec['company'] || '',
      location: rec['location'] || '',
      designation: rec['designation'] || '',
      ctcOffered: rec['ctc offered'] || '',
      joiningDate: rec['joining date'] || '',
      recruiter: rawRecruiter,
      recruiterName: rawRecruiter.includes('@') ? emailToName(rawRecruiter) : rawRecruiter,
      candidateStatus: rec['candidate status'] || '',
      leadSource: rec['lead source'] || '',
      joiningConfirmation: rec['joining confirmation'] || '',
      aiOrManualLead: rec['ai or manual lead'] || '',
      clientPocName: rec['client poc name'] || '',
      clientPayout: Number(rec['client payout']?.replace(/[^0-9.]/g, '')) || 0,
    };
  }).filter(r => r.year !== '1899' && r.month !== 'December' && r.candidateName.trim() !== '' && r.candidateStatus.trim() !== '');
}

function parseEod(values: string[][]): EODSheetRow[] {
  if (values.length < 2) return [];
  const dateRow = values[0]; // Row 1: dates starting from column B

  const recruiterIndices: { name: string; rowIndex: number }[] = [];

  // Scan Column A for recruiter names (non-metric, non-empty rows)
  const metricKeywords = ['total calls', 'calls', 'lineup', 'lineups', 'selection', 'selections', 'joining', 'joinings', 'remarks', 'remark'];
  for (let i = 1; i < values.length; i++) {
    const colA = (values[i]?.[0] ?? '').trim();
    if (!colA) continue;
    const lower = colA.toLowerCase();
    if (metricKeywords.some(k => lower.includes(k))) continue;
    recruiterIndices.push({ name: colA, rowIndex: i });
  }

  const results: EODSheetRow[] = [];

  for (const { name, rowIndex } of recruiterIndices) {
    // Fixed offsets: Total Calls at +6, Selection at +7, Joinings at +8
    const callsRow = values[rowIndex + 6];
    const selectionsRow = values[rowIndex + 7];
    const joiningsRow = values[rowIndex + 8];

    if (!callsRow && !selectionsRow && !joiningsRow) continue;

    // Sum per date column
    for (let c = 1; c < dateRow.length; c++) {
      const dateStr = (dateRow[c] ?? '').trim();
      if (!dateStr) continue;

      const calls = Number(callsRow?.[c]) || 0;
      const sels = Number(selectionsRow?.[c]) || 0;
      const joins = Number(joiningsRow?.[c]) || 0;

      if (calls === 0 && sels === 0 && joins === 0) continue;

      results.push({
        date: dateStr,
        recruiterName: name,
        totalCallsMade: calls,
        lineupsDone: 0,
        selections: sels,
        joinings: joins,
        remarks: '',
      });
    }
  }

  return results;
}

async function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity script'));
    document.head.appendChild(script);
  });
}

export async function requestGoogleAccessToken(clientId: string): Promise<string> {
  await loadGoogleIdentityScript();

  return await new Promise<string>((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: SHEETS_SCOPE,
      callback: (response: any) => {
        if (response?.error || !response?.access_token) {
          reject(new Error(response?.error || 'Google OAuth failed'));
          return;
        }
        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

async function fetchValues(spreadsheetId: string, range: string, accessToken: string): Promise<string[][]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets API failed [${res.status}] ${text}`);
  }
  const json = await res.json();
  return json.values ?? [];
}

export async function fetchRecruitmentSheets(
  masterSheetId: string,
  selectionEodSheetId: string,
  accessToken: string
): Promise<{
  master: MasterTrackerRow[];
  selection: SelectionSheetRow[];
  eod: EODSheetRow[];
}> {
  const [masterValues, selectionValues, eodValues] = await Promise.all([
    fetchValues(masterSheetId, 'MASTER TRACKER!A:T', accessToken),
    fetchValues(selectionEodSheetId, 'SELECTION SHEET!A:R', accessToken),
    fetchValues(selectionEodSheetId, 'EOD SHEET!A:G', accessToken),
  ]);

  return {
    master: parseMasterTracker(masterValues),
    selection: parseSelection(selectionValues),
    eod: parseEod(eodValues),
  };
}
