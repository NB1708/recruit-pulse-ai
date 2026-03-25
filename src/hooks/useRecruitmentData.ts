import { useState } from 'react';
import { DEMO_DAILY_CALLING, DEMO_EOD_SHEET, DEMO_MASTER_TRACKER, DEMO_SELECTION_SHEET } from '@/data/demoData';
import { fetchRecruitmentSheets, requestGoogleAccessToken } from '@/services/googleSheets';
import type { DailyCallingRow, EODSheetRow, MasterTrackerRow, SelectionSheetRow } from '@/types/recruitment';

export function useRecruitmentData() {
  const [master, setMaster] = useState<MasterTrackerRow[]>(DEMO_MASTER_TRACKER);
  const [selection, setSelection] = useState<SelectionSheetRow[]>(DEMO_SELECTION_SHEET);
  const [eod, setEod] = useState<EODSheetRow[]>(DEMO_EOD_SHEET);
  const [daily, setDaily] = useState<DailyCallingRow[]>(DEMO_DAILY_CALLING);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const connectGoogleSheets = async (clientId: string, spreadsheetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = await requestGoogleAccessToken(clientId);
      const data = await fetchRecruitmentSheets(spreadsheetId, accessToken);
      setMaster(data.master);
      setSelection(data.selection);
      setEod(data.eod);
      setDaily(data.daily);
      setConnected(true);
      sessionStorage.setItem('gp_client_id', clientId);
      sessionStorage.setItem('gp_sheet_id', spreadsheetId);
    } catch (e: any) {
      setError(e.message || 'Failed to connect Google Sheets');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  return { master, selection, eod, daily, loading, error, connected, connectGoogleSheets };
}
