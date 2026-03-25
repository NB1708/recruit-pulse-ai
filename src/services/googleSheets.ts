import type { DailyCallingRow, EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

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

function parseSelection(values: string[][]): SelectionSheetRow[] {
  if (!values.length) return [];
  const [headers, ...rows] = values;
  return rows.filter(r => r.some(Boolean)).map((row) => {
    const rec = rowToRecord(headers, row);
    return {
      srNo: rec['sr. no.'] || rec['sr no'] || '',
      month: rec['month'] || '',
      dateOfSelection: rec['date of selection'] || '',
      candidateName: rec['candidate name'] || '',
      contactNumber: rec['contact number'] || '',
      emailId: rec['email id'] || '',
      company: rec['company'] || '',
      location: rec['location'] || '',
      designation: rec['designation'] || '',
      ctcOffered: rec['ctc offered'] || '',
      joiningDate: rec['joining date'] || '',
      recruiter: rec['recruiter'] || '',
      candidateStatus: rec['candidate status'] || '',
      leadSource: rec['lead source'] || '',
      joiningConfirmation: rec['joining confirmation'] || '',
      aiOrManualLead: rec['ai or manual lead'] || '',
      clientPocName: rec['client poc name'] || '',
    };
  });
}

function parseEod(values: string[][]): EODSheetRow[] {
  if (!values.length) return [];
  const [headers, ...rows] = values;
  return rows.filter(r => r.some(Boolean)).map((row) => {
    const rec = rowToRecord(headers, row);
    return {
      date: rec['date'] || '',
      recruiterName: rec['recruiter name'] || '',
      totalCallsMade: Number(rec['total calls made'] || 0),
      lineupsDone: Number(rec['lineups done'] || 0),
      selections: Number(rec['selections'] || 0),
      joinings: Number(rec['joinings'] || 0),
      remarks: rec['remarks'] || '',
    };
  });
}

function parseDailyCalling(values: string[][]): DailyCallingRow[] {
  if (!values.length) return [];
  const [headers, ...rows] = values;
  return rows.filter(r => r.some(Boolean)).map((row) => {
    const rec = rowToRecord(headers, row);
    return {
      date: rec['date'] || '',
      candidateName: rec['candidate name'] || '',
      contactNumber: rec['contact number'] || '',
      location: rec['location'] || '',
      client: rec['client'] || '',
      jobRole: rec['job role'] || '',
      source: rec['source'] || '',
      callStatus: rec['call status'] || '',
      linedUp: rec['lined-up (yes/no)'] || rec['lined-up'] || rec['lined up'] || '',
      remarks: rec['remarks'] || '',
      uniqueId: rec['unique id'] || '',
    };
  });
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

async function fetchSheetTitles(spreadsheetId: string, accessToken: string): Promise<string[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}?fields=sheets(properties(title))`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets metadata failed [${res.status}] ${text}`);
  }
  const json = await res.json();
  return (json.sheets ?? []).map((s: any) => s.properties?.title).filter(Boolean);
}

export async function fetchRecruitmentSheets(spreadsheetId: string, accessToken: string): Promise<{
  master: MasterTrackerRow[];
  selection: SelectionSheetRow[];
  eod: EODSheetRow[];
  daily: DailyCallingRow[];
}> {
  const [masterValues, selectionValues, eodValues, titles] = await Promise.all([
    fetchValues(spreadsheetId, 'MASTER TRACKER!A:T', accessToken),
    fetchValues(spreadsheetId, 'SELECTION SHEET!A:Q', accessToken),
    fetchValues(spreadsheetId, 'EOD SHEET!A:G', accessToken),
    fetchSheetTitles(spreadsheetId, accessToken),
  ]);

  const dailySheetTitles = titles.filter((t) => t.toUpperCase().includes('DAILY CALLING'));
  const dailySheets = await Promise.all(dailySheetTitles.map((title) => fetchValues(spreadsheetId, `${title}!A:K`, accessToken)));
  const mergedDailyValues = dailySheets.flat();

  return {
    master: parseMasterTracker(masterValues),
    selection: parseSelection(selectionValues),
    eod: parseEod(eodValues),
    daily: parseDailyCalling(mergedDailyValues),
  };
}
