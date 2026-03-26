import type { EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

declare global {
  interface Window {
    google?: any;
  }
}

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

function normalize(value: string): string {
  return value.trim().toLowerCase();
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
    return {
      stage: rec['stage'] || '',
      clientStatus: rec['client status'] || '',
      year: rec['year'] || '',
      month: rec['month'] || '',
      date: rec['date'] || '',
      tl: rec['tl'] || '',
      am: rec['am'] || '',
      recruiter: rec['recruiter'] || '',
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
  });
}

function emailToName(email: string): string {
  const local = email.split('@')[0] || email;
  return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
}

function parseSelection(values: string[][]): SelectionSheetRow[] {
  if (!values.length) return [];
  const [headers, ...rows] = values;
  return rows.filter(r => r.some(Boolean)).map((row) => {
    const rec = rowToRecord(headers, row);
    const rawRecruiter = rec['recruiter'] || '';
    return {
      srNo: rec['sr. no.'] || rec['sr no'] || '',
      month: rec['month'] || '',
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
    };
  });
}

function parseEod(values: string[][]): EODSheetRow[] {
  if (values.length < 2) return [];
  const dateRow = values[0];
  // dates start from column B (index 1)
  const dates = dateRow.slice(1).map(d => d.trim());

  const results: EODSheetRow[] = [];
  let currentRecruiter = '';
  const recruiterMetrics: Record<string, Record<string, number[]>> = {};

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const colA = (row[0] ?? '').trim();
    if (!colA) continue;

    const colALower = colA.toLowerCase();
    const isMetric = ['total calls', 'calls', 'lineup', 'lineups', 'selection', 'selections', 'joining', 'joinings'].some(m => colALower.includes(m));

    if (!isMetric) {
      currentRecruiter = colA;
      if (!recruiterMetrics[currentRecruiter]) {
        recruiterMetrics[currentRecruiter] = {};
      }
    } else if (currentRecruiter) {
      const vals = row.slice(1).map(v => Number(v) || 0);
      let metricKey = 'remarks';
      if (colALower.includes('call')) metricKey = 'totalCallsMade';
      else if (colALower.includes('lineup')) metricKey = 'lineupsDone';
      else if (colALower.includes('selection')) metricKey = 'selections';
      else if (colALower.includes('joining')) metricKey = 'joinings';
      recruiterMetrics[currentRecruiter][metricKey] = vals;
    }
  }

  for (const [recruiter, metrics] of Object.entries(recruiterMetrics)) {
    for (let d = 0; d < dates.length; d++) {
      if (!dates[d]) continue;
      const calls = metrics.totalCallsMade?.[d] ?? 0;
      const lineups = metrics.lineupsDone?.[d] ?? 0;
      const sels = metrics.selections?.[d] ?? 0;
      const joins = metrics.joinings?.[d] ?? 0;
      if (calls === 0 && lineups === 0 && sels === 0 && joins === 0) continue;
      results.push({
        date: dates[d],
        recruiterName: recruiter,
        totalCallsMade: calls,
        lineupsDone: lineups,
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
    fetchValues(selectionEodSheetId, 'SELECTION SHEET!A:Q', accessToken),
    fetchValues(selectionEodSheetId, 'EOD SHEET!A:G', accessToken),
  ]);

  return {
    master: parseMasterTracker(masterValues),
    selection: parseSelection(selectionValues),
    eod: parseEod(eodValues),
  };
}
