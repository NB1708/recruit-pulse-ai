import { useState } from 'react';
import { DEMO_MASTER_TRACKER, DEMO_EOD_SHEET, DEMO_SELECTION_SHEET } from '@/data/demoData';
import { fetchRecruitmentSheets, startGoogleOAuthRedirect } from '@/services/googleSheets';
import type { EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

export function useRecruitmentData() {
  const [master, setMaster] = useState<MasterTrackerRow[]>(DEMO_MASTER_TRACKER);
  const [selection, setSelection] = useState<SelectionSheetRow[]>(DEMO_SELECTION_SHEET);
  const [eod, setEod] = useState<EODSheetRow[]>(DEMO_EOD_SHEET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  /** Redirect-based: saves config then redirects to Google */
  const connectGoogleSheets = async (clientId: string, masterSheetId: string, selectionEodSheetId: string) => {
    sessionStorage.setItem('gp_client_id', clientId);
    sessionStorage.setItem('gp_master_sheet_id', masterSheetId);
    sessionStorage.setItem('gp_selection_eod_sheet_id', selectionEodSheetId);
    // Mark that we're in the middle of an OAuth redirect
    sessionStorage.setItem('gp_oauth_pending', 'true');
    startGoogleOAuthRedirect(clientId);
  };

  /** Called after redirect returns with an access token */
  const connectWithToken = async (accessToken: string) => {
    const masterSheetId = sessionStorage.getItem('gp_master_sheet_id') || '';
    const selectionEodSheetId = sessionStorage.getItem('gp_selection_eod_sheet_id') || '';
    if (!masterSheetId || !selectionEodSheetId) {
      setError('Sheet IDs not found. Please reconfigure.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecruitmentSheets(masterSheetId, selectionEodSheetId, accessToken);
      setMaster(data.master);
      setSelection(data.selection);
      setEod(data.eod);
      setConnected(true);
    } catch (e: any) {
      setError(e.message || 'Failed to connect Google Sheets');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  return { master, selection, eod, loading, error, connected, connectGoogleSheets, connectWithToken };
}
