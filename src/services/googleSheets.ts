import type { EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

export interface OAuthRedirectResult {
  accessToken: string | null;
  error: string | null;
  errorDescription: string | null;
}

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

export function cleanGoogleClientId(clientId: string): string {
  return clientId
    .replace('https://', '')
    .replace('http://', '')
    .trim();
}

export function validateGoogleClientId(clientId: string): string | null {
  const trimmedClientId = cleanGoogleClientId(clientId);
  if (!trimmedClientId || !trimmedClientId.endsWith('.apps.googleusercontent.com') || !trimmedClientId.includes('-')) {
    return '⚠️ Invalid Client ID format. It must end with .apps.googleusercontent.com';
  }
  return null;
}

export function formatClientIdPreview(clientId: string): string {
  const trimmedClientId = clientId.trim();
  return trimmedClientId ? `${trimmedClientId.slice(0, 20)}...` : 'Not available';
}

function cleanupOAuthUrl(): void {
  const url = new URL(window.location.href);
  url.hash = '';
  ['code', 'scope', 'authuser', 'prompt', 'error', 'error_description', 'error_subtype', 'state'].forEach((key) => {
    url.searchParams.delete(key);
  });
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
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
  });
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
      clientPayout: Number(rec['client payout']?.replace(/[^0-9.]/g, '')) || 0,
    };
  });
}

function parseEod(values: string[][]): EODSheetRow[] {
  if (values.length < 2) return [];
  const dateRow = values[0];
  const results: EODSheetRow[] = [];

  for (let i = 1; i < values.length; i++) {
    const colA = (values[i]?.[0] ?? '').trim();
    if (!colA) continue;

    // Detect if this row is a Recruiter Name by checking if the NEXT row is "CV to TL"
    const nextColToLower = (values[i + 1]?.[0] ?? '').trim().toLowerCase();

    if (nextColToLower === 'cv to tl') {
      const recruiterName = colA;

      const lineupsRow = values[i + 3]; // Row 3 down is "CV to Client" (Lineups)
      const callsRow = values[i + 6];   // Row 6 down is "Total Calls"

      if (!callsRow) continue;

      // Loop across the dates horizontally without clipping
      for (let c = 1; c < dateRow.length; c++) {
        const dateStr = (dateRow[c] ?? '').trim();
        if (!dateStr) continue;

        const calls = Number(callsRow[c]) || 0;
        const lineups = Number(lineupsRow?.[c]) || 0;

        if (calls === 0 && lineups === 0) continue;

        results.push({
          date: dateStr,
          recruiterName: recruiterName,
          totalCallsMade: calls,
          lineupsDone: lineups,
          selections: 0,
          joinings: 0,
          remarks: '',
        });
      }
    }
  }

  return results;
}

/**
 * Redirect-based OAuth flow — works on mobile browsers (no popup).
 * Redirects the user to Google's OAuth consent page.
 * After consent, Google redirects back with the access_token in the URL hash.
 */
export function startGoogleOAuthRedirect(clientId: string): void {
  const trimmedClientId = cleanGoogleClientId(clientId);
  const validationError = validateGoogleClientId(trimmedClientId);
  if (validationError) {
    throw new Error(validationError);
  }

  console.log('[Google OAuth] Using Client ID:', trimmedClientId);
  const redirectUri = window.location.origin.replace(/\/$/, '');
  const params = new URLSearchParams({
    client_id: trimmedClientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: SHEETS_SCOPE,
    prompt: 'consent',
    include_granted_scopes: 'true',
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * After Google redirects back, the access_token is in the URL hash.
 * Parse it and clean up the URL.
 */
export function extractOAuthRedirectResult(): OAuthRedirectResult {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : '';
  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(window.location.search);
  const accessToken = hashParams.get('access_token');
  const error = hashParams.get('error') || searchParams.get('error');
  const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

  if (accessToken) {
    sessionStorage.setItem('gp_access_token', accessToken);
    cleanupOAuthUrl();
    return { accessToken, error: null, errorDescription: null };
  }

  if (error) {
    cleanupOAuthUrl();
    return { accessToken: null, error, errorDescription };
  }

  return { accessToken: null, error: null, errorDescription: null };
}

export async function fetchValues(spreadsheetId: string, range: string, accessToken: string): Promise<string[][]> {
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
    // Removed column caps (!A:G) so it fetches all dates and columns!
    fetchValues(masterSheetId, 'MASTER TRACKER', accessToken),
    fetchValues(selectionEodSheetId, 'SELECTION SHEET', accessToken),
    fetchValues(selectionEodSheetId, 'EOD SHEET', accessToken),
  ]);

  return {
    master: parseMasterTracker(masterValues),
    selection: parseSelection(selectionValues),
    eod: parseEod(eodValues),
  };
}
