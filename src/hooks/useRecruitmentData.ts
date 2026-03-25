import { useState } from 'react';
import { DEMO_MASTER_TRACKER, DEMO_EOD_SHEET, DEMO_SELECTION_SHEET } from '@/data/demoData';
import { fetchRecruitmentSheets, requestGoogleAccessToken } from '@/services/googleSheets';
import type { EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

export function useRecruitmentData() {
  const [master, setMaster] = useState<MasterTrackerRow[]>(DEMO_MASTER_TRACKER);
  const [selection, setSelection] = useState<SelectionSheetRow[]>(DEMO_SELECTION_SHEET);
  const [eod, setEod] = useState<EODSheetRow[]>(DEMO_EOD_SHEET);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connectGoogleSheets = async (clientId: string, masterSheetId: string, selectionEodSheetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await requestGoogleAccessToken(clientId);
      const data = await fetchRecruitmentSheets(masterSheetId, selectionEodSheetId, accessToken);
      setMaster(data.master);
      setSelection(data.selection);
      setEod(data.eod);
      setConnected(true);
      sessionStorage.setItem('gp_client_id', clientId);
      sessionStorage.setItem('gp_master_sheet_id', masterSheetId);
      sessionStorage.setItem('gp_selection_eod_sheet_id', selectionEodSheetId);
    } catch (e: any) {
      setError(e.message || 'Failed to connect Google Sheets');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  return { master, selection, eod, loading, error, connected, connectGoogleSheets };
}
